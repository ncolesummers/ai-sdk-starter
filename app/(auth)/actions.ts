"use server";

import { trace } from "@opentelemetry/api";
import { z } from "zod";
import { signIn } from "@/lib/auth-client";
import { createLogger } from "@/lib/logger";

const tracer = trace.getTracer("auth-actions", "1.0.0");
const logger = createLogger("auth:actions");

const authFormSchema = z.object({
  email: z.string().email(),
});

// Extract email domain for privacy-safe logging
const getEmailDomain = (email: string): string => {
  const parts = email.split("@");
  return parts.length === 2 ? parts[1] : "unknown";
};

export type LoginActionState = {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
  message?: string;
};

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  return await tracer.startActiveSpan("auth.actions.login", async (span) => {
    try {
      const validatedData = authFormSchema.parse({
        email: formData.get("email"),
      });

      const emailDomain = getEmailDomain(validatedData.email);
      const callbackURL = "/";

      span.setAttributes({
        "auth.email.domain": emailDomain,
        "auth.callback_url": callbackURL,
      });

      logger.debug("Processing login request", { emailDomain });

      // Request magic link via BetterAuth client library
      await signIn.magicLink({
        email: validatedData.email,
        callbackURL,
      });

      span.setStatus({ code: 1 }); // OK
      logger.info("Magic link sent successfully", { emailDomain });

      return {
        status: "success",
        message: "Check your email for a magic link to sign in.",
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        span.setAttribute("auth.validation.failed", true);
        span.setAttribute(
          "auth.validation.errors",
          JSON.stringify(error.errors)
        );
        span.setStatus({ code: 2, message: "Validation failed" });

        logger.warn("Login validation failed", {
          errors: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });

        return { status: "invalid_data" };
      }

      span.recordException(error as Error);
      span.setStatus({ code: 2, message: (error as Error).message });

      logger.error("Login failed", {
        error: (error as Error).message,
        errorType: (error as Error).constructor.name,
      });

      const errorMessage =
        error instanceof Error ? error.message : "Failed to send magic link.";
      return { status: "failed", message: errorMessage };
    } finally {
      span.end();
    }
  });
};

export type RegisterActionState = {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
  message?: string;
};

export const register = async (
  _: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> => {
  return await tracer.startActiveSpan("auth.actions.register", async (span) => {
    try {
      const validatedData = authFormSchema.parse({
        email: formData.get("email"),
      });

      const emailDomain = getEmailDomain(validatedData.email);
      const callbackURL = "/";

      span.setAttributes({
        "auth.email.domain": emailDomain,
        "auth.callback_url": callbackURL,
      });

      logger.debug("Processing registration request", { emailDomain });

      // Request magic link - BetterAuth will create user if they don't exist
      await signIn.magicLink({
        email: validatedData.email,
        callbackURL,
      });

      span.setStatus({ code: 1 }); // OK
      logger.info("Registration magic link sent successfully", { emailDomain });

      return {
        status: "success",
        message: "Check your email for a magic link to complete registration.",
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        span.setAttribute("auth.validation.failed", true);
        span.setAttribute(
          "auth.validation.errors",
          JSON.stringify(error.errors)
        );
        span.setStatus({ code: 2, message: "Validation failed" });

        logger.warn("Registration validation failed", {
          errors: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });

        return { status: "invalid_data" };
      }

      span.recordException(error as Error);
      span.setStatus({ code: 2, message: (error as Error).message });

      logger.error("Registration failed", {
        error: (error as Error).message,
        errorType: (error as Error).constructor.name,
      });

      const errorMessage =
        error instanceof Error ? error.message : "Failed to send magic link.";
      return { status: "failed", message: errorMessage };
    } finally {
      span.end();
    }
  });
};
