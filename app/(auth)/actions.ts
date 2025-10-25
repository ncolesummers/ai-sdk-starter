"use server";

import { z } from "zod";
import { $fetch } from "@/lib/auth-client";

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

    // Request magic link via BetterAuth
    await $fetch("/magic-link/send-magic-link", {
      method: "POST",
      body: {
        email: validatedData.email,
        callbackURL: "/",
      },
    });

    return {
      status: "success",
      message: "Check your email for a magic link to sign in.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed", message: "Failed to send magic link." };
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
    await $fetch("/magic-link/send-magic-link", {
      method: "POST",
      body: {
        email: validatedData.email,
        callbackURL: "/",
      },
    });

    return {
      status: "success",
      message: "Check your email for a magic link to complete registration.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed", message: "Failed to send magic link." };
  }
};
