import { trace } from "@opentelemetry/api";
import { NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";

const tracer = trace.getTracer("auth-diagnostic", "1.0.0");
const logger = createLogger("auth:diagnostic");

export function GET() {
  return tracer.startActiveSpan("auth.diagnostic.test", async (span) => {
    try {
      const diagnostics = {
        timestamp: new Date().toISOString(),
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          emailServerHost: process.env.EMAIL_SERVER_HOST || "NOT_SET",
          emailServerPort: process.env.EMAIL_SERVER_PORT || "NOT_SET",
          smtpUserConfigured: Boolean(process.env.SMTP_USER),
          smtpPasswordConfigured: Boolean(process.env.SMTP_PASSWORD),
          emailFromConfigured: Boolean(process.env.EMAIL_FROM),
          databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
        },
        auth: {
          moduleLoadStatus: "unknown",
          error: null as string | null,
        },
      };

      span.setAttributes({
        "env.email.host": diagnostics.environment.emailServerHost,
        "env.email.port": diagnostics.environment.emailServerPort,
        "env.smtp.user.configured": diagnostics.environment.smtpUserConfigured,
        "env.smtp.password.configured":
          diagnostics.environment.smtpPasswordConfigured,
        "env.database.configured":
          diagnostics.environment.databaseUrlConfigured,
      });

      // Test auth module import
      try {
        logger.debug("Attempting to load auth module...");
        const { auth } = await import("@/lib/auth");
        diagnostics.auth.moduleLoadStatus = auth ? "SUCCESS" : "FAILED";
        span.setAttribute("auth.module.status", "loaded");
        logger.info("Auth module loaded successfully");
      } catch (error) {
        diagnostics.auth.moduleLoadStatus = "ERROR";
        diagnostics.auth.error = (error as Error).message;
        span.recordException(error as Error);
        span.setAttribute("auth.module.status", "error");
        span.setAttribute("auth.module.error", (error as Error).message);
        logger.error("Auth module failed to load", {
          error: (error as Error).message,
        });
      }

      const status =
        diagnostics.auth.moduleLoadStatus === "SUCCESS" ? 200 : 500;

      span.setAttributes({
        "http.status_code": status,
        "diagnostic.result":
          diagnostics.auth.moduleLoadStatus === "SUCCESS"
            ? "healthy"
            : "unhealthy",
      });

      span.setStatus({ code: status === 200 ? 1 : 2 });

      logger.info("Diagnostic check complete", {
        status: diagnostics.auth.moduleLoadStatus,
      });

      return NextResponse.json(diagnostics, { status });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: (error as Error).message });
      return NextResponse.json(
        {
          error: "Diagnostic test failed",
          message: (error as Error).message,
        },
        { status: 500 }
      );
    } finally {
      span.end();
    }
  });
}
