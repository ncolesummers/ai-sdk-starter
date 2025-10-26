"use server";

import { z } from "zod";
import { signIn } from "@/lib/auth-client";

const authFormSchema = z.object({
  email: z.string().email(),
});

export type LoginActionState = {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
  message?: string;
};

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
    });

    // Request magic link via BetterAuth client library
    await signIn.magicLink({
      email: validatedData.email,
      callbackURL: "/",
    });

    return {
      status: "success",
      message: "Check your email for a magic link to sign in.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Login validation error:", error.errors);
      return { status: "invalid_data" };
    }

    console.error("Login error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to send magic link.";
    return { status: "failed", message: errorMessage };
  }
};

export type RegisterActionState = {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
  message?: string;
};

export const register = async (
  _: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
    });

    // Request magic link - BetterAuth will create user if they don't exist
    await signIn.magicLink({
      email: validatedData.email,
      callbackURL: "/",
    });

    return {
      status: "success",
      message: "Check your email for a magic link to complete registration.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Registration validation error:", error.errors);
      return { status: "invalid_data" };
    }

    console.error("Registration error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to send magic link.";
    return { status: "failed", message: errorMessage };
  }
};
