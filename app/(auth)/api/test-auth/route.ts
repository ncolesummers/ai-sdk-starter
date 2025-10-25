import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createUser, db, getUser } from "@/lib/db/queries";
import { session } from "@/lib/db/schema";

/**
 * Test-only endpoint for creating authenticated sessions without magic links
 * Only available when PLAYWRIGHT environment variable is set
 */
export async function POST(request: Request) {
  // Only allow in test environment
  if (process.env.PLAYWRIGHT !== "True") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    // Check if user already exists
    let existingUsers = await getUser(email);

    if (existingUsers.length === 0) {
      // Create new user
      await createUser(email);
      existingUsers = await getUser(email);
    }

    const user = existingUsers[0];

    // Generate a secure session token
    const token = randomBytes(32).toString("base64url");

    // Session expires in 7 days (matching BetterAuth config)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Create session directly in database
    await db.insert(session).values({
      userId: user.id,
      token,
      expiresAt,
    });

    // Return session info so tests can set cookies
    const response = NextResponse.json({
      success: true,
      email,
      userId: user.id,
    });

    // Set the session cookie for the test
    response.cookies.set({
      name: "better-auth.session_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    console.error("Test auth error:", error);
    return NextResponse.json(
      { error: "Failed to create test user" },
      { status: 500 }
    );
  }
}
