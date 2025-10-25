import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { createTransport } from "nodemailer";
import { db } from "./db/queries";
import { account, session, user, verification } from "./db/schema";

// Email transport configuration
const transport = createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const auth = betterAuth({
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
      sendMagicLink: async ({ email, url }) => {
        await transport.sendMail({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: "Sign in to AI Chatbot",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Sign in to AI Chatbot</h2>
              <p>Click the link below to sign in to your account:</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                Sign In
              </a>
              <p style="color: #666; font-size: 14px;">
                This link will expire in 10 minutes. If you didn't request this email, you can safely ignore it.
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 40px;">
                Or copy and paste this URL into your browser:<br/>
                ${url}
              </p>
            </div>
          `,
          text: `Sign in to AI Chatbot\n\nClick the link below to sign in:\n${url}\n\nThis link will expire in 10 minutes.`,
        });
      },
      expiresIn: 600, // 10 minutes in seconds
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },
  user: {
    additionalFields: {
      type: {
        type: "string",
        required: false,
        defaultValue: "regular",
        input: false, // Not set by user input
      },
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
  },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
export type SessionWithUser = {
  session: Session;
  user: User;
};
