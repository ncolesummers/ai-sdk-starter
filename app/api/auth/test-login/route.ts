import { trace } from "@opentelemetry/api";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/queries";
import { session, user } from "@/lib/db/schema";
import { createLogger } from "@/lib/logger";

const tracer = trace.getTracer("auth-test", "1.0.0");
const logger = createLogger("auth:test-login");

/**
 * Test-only authentication endpoint for automated testing.
 *
 * WARNING: This endpoint bypasses normal authentication flow and should
 * NEVER be enabled in production environments.
 *
 * Usage:
 *   POST /api/auth/test-login
 *   Body: { "email": "test@example.com" }
 *   Response: { "sessionToken": "..." }
 */
// biome-ignore lint/suspicious/useAwait: Next.js route handlers require async
export async function POST(request: NextRequest) {
  return tracer.startActiveSpan("auth.test-login", async (span) => {
    try {
      // Security guard: Only allow in non-production environments
      if (process.env.NODE_ENV === "production") {
        logger.warn("Test login attempt blocked in production environment");
        span.setAttribute("auth.test.blocked", true);
        span.setStatus({ code: 2, message: "Not available in production" });
        span.end();

        return NextResponse.json(
          {
            error: "Test authentication is not available in production",
            code: "forbidden:test-auth",
          },
          { status: 403 }
        );
      }

      const body = await request.json();
      const email = body.email as string;

      if (!email) {
        span.setAttribute("auth.test.error", "missing_email");
        span.setStatus({ code: 2, message: "Email required" });
        span.end();

        return NextResponse.json(
          { error: "Email is required", code: "bad_request:test-auth" },
          { status: 400 }
        );
      }

      span.setAttributes({
        "auth.test.email": email,
        "auth.test.environment": process.env.NODE_ENV || "development",
      });

      logger.info("Creating test session", { email });

      // Find or create test user
      const existingUsers = await db
        .select()
        .from(user)
        .where(eq(user.email, email));

      let testUser = existingUsers[0];

      if (testUser) {
        span.setAttribute("auth.test.user.created", false);
        logger.debug("Using existing test user", { userId: testUser.id });
      } else {
        logger.debug("Test user not found, creating new user", { email });

        const [newUser] = await db
          .insert(user)
          .values({
            id: crypto.randomUUID(),
            email,
            name: email.split("@")[0],
            emailVerified: true,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        testUser = newUser;
        span.setAttribute("auth.test.user.created", true);
        logger.info("Test user created", { userId: testUser.id });
      }

      // Create session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      const sessionToken = crypto.randomUUID();

      // Better Auth uses the `id` field as the session token (cookie value)
      await db.insert(session).values({
        id: sessionToken,
        userId: testUser.id,
        expiresAt,
        token: sessionToken,
        ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
        userAgent: request.headers.get("user-agent") || "test-client",
      });

      span.setAttributes({
        "auth.test.session.created": true,
        "auth.test.session.expires": expiresAt.toISOString(),
        "auth.test.user.id": testUser.id,
      });

      logger.info("Test session created successfully", {
        userId: testUser.id,
        expiresAt: expiresAt.toISOString(),
      });

      span.setStatus({ code: 1 }); // OK

      return NextResponse.json({
        success: true,
        sessionToken,
        user: {
          id: testUser.id,
          email: testUser.email,
          name: testUser.name,
        },
        expiresAt: expiresAt.toISOString(),
      });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: (error as Error).message });

      logger.error("Test login failed", {
        error: (error as Error).message,
      });

      return NextResponse.json(
        {
          error: "Test login failed",
          message: (error as Error).message,
          code: "internal:test-auth",
        },
        { status: 500 }
      );
    } finally {
      span.end();
    }
  });
}
