import { trace } from "@opentelemetry/api";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { createTransport } from "nodemailer";
import { db } from "./db/queries";
import { account, session, user, verification } from "./db/schema";
import { createLogger } from "./logger";

const tracer = trace.getTracer("better-auth", "1.0.0");
const logger = createLogger("better-auth");

logger.info("Initializing Better Auth module...");

// Email transport configuration with instrumentation
const transport = tracer.startActiveSpan(
  "auth.email-transport.initialize",
  (span) => {
    try {
      const emailConfig = {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        hasUser: Boolean(process.env.SMTP_USER),
        hasPassword: Boolean(process.env.SMTP_PASSWORD),
      };

      logger.debug("Email transport configuration", emailConfig);

      span.setAttributes({
        "email.host": emailConfig.host || "not-set",
        "email.port": emailConfig.port || 0,
        "email.user.configured": emailConfig.hasUser,
        "email.password.configured": emailConfig.hasPassword,
      });

      if (!emailConfig.host || !emailConfig.port) {
        const error = new Error(
          "Missing email configuration: EMAIL_SERVER_HOST and EMAIL_SERVER_PORT are required"
        );
        span.recordException(error);
        logger.error("Email transport initialization failed", {
          error: error.message,
        });
        throw error;
      }

      const emailTransport = createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      logger.info("Email transport initialized successfully");
      span.setStatus({ code: 1 }); // OK
      return emailTransport;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: (error as Error).message }); // ERROR
      throw error;
    } finally {
      span.end();
    }
  }
);

logger.debug("Creating Better Auth instance...");

export const auth = tracer.startActiveSpan(
  "auth.betterauth.initialize",
  (span) => {
    try {
      span.setAttributes({
        "db.adapter": "drizzle",
        "db.provider": "pg",
        "auth.plugins": ["magicLink"],
      });

      const authInstance = betterAuth({
        baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
        trustedOrigins: [
          "http://localhost:3000",
          "http://10.0.1.*", // Allow all local network IPs
        ],
        database: drizzleAdapter(db, {
          provider: "pg",
          schema: {
            user,
            session,
            account,
            verification,
          },
        }),
        emailAndPassword: {
          enabled: false, // Disable password auth
        },
        plugins: [
          magicLink({
            sendMagicLink: ({ email, url }) => {
              return tracer.startActiveSpan(
                "auth.magic-link.send",
                async (emailSpan) => {
                  try {
                    emailSpan.setAttributes({
                      "email.to": email,
                      "email.from": process.env.EMAIL_FROM || "not-set",
                    });

                    logger.info("Sending magic link email", { to: email });

                    await transport.sendMail({
                      from: process.env.EMAIL_FROM,
                      to: email,
                      subject: "Sign in to AI Chatbot",
                      html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                          <h2>Sign in to AI Chatbot</h2>
                          <p>Click the link below to sign in to your account:</p>
                          <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 500;">
                            Sign In
                          </a>
                          <p style="color: #666; font-size: 14px;">
                            This link will expire in 10 minutes. If you didn't request this email, you can safely ignore it.
                          </p>
                          <p style="color: #999; font-size: 12px; margin: 40px 0;">
                            Or copy and paste this URL into your browser:<br/>
                            <span style="color: #0070f3;">${url}</span>
                          </p>
                        </div>
                      `,
                      text: `Sign in to AI Chatbot\n\nClick the link below to sign in:\n${url}\n\nThis link will expire in 10 minutes.`,
                    });

                    logger.info("Magic link email sent successfully");
                    emailSpan.setStatus({ code: 1 }); // OK
                  } catch (error) {
                    emailSpan.recordException(error as Error);
                    emailSpan.setStatus({
                      code: 2,
                      message: (error as Error).message,
                    });
                    logger.error("Failed to send magic link email", {
                      error: (error as Error).message,
                    });
                    throw error;
                  } finally {
                    emailSpan.end();
                  }
                }
              );
            },
            expiresIn: 600, // 10 minutes in seconds
          }),
        ],
        session: {
          expiresIn: 60 * 60 * 24 * 7, // 7 days
          updateAge: 60 * 60 * 24, // Update session every 24 hours
        },
        advanced: {
          cookiePrefix: "better-auth",
        },
      });

      logger.info("Better Auth instance created successfully");
      span.setStatus({ code: 1 }); // OK
      return authInstance;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: (error as Error).message }); // ERROR
      logger.error("Better Auth initialization failed", {
        error: (error as Error).message,
      });
      throw error;
    } finally {
      span.end();
    }
  }
);

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
export type SessionWithUser = {
  session: Session;
  user: User;
};
