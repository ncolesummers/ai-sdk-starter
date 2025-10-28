import { headers } from "next/headers";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { testOllamaConnection } from "@/lib/config/ollama-config";
import { ChatSDKError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";

const logger = createLogger("admin-api-test");

// Validation schema for connection test
const testConnectionSchema = z.object({
  url: z.string().url(),
});

/**
 * POST /api/admin/ollama/test
 * Test connection to an Ollama server URL
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new ChatSDKError("unauthorized:admin");
    }

    // Check admin authorization
    requireAdmin(session.user.email);

    // Parse and validate request body
    const body = await request.json();
    const { url } = testConnectionSchema.parse(body);

    // Normalize URL (ensure it ends with /v1)
    const normalizedUrl = url.endsWith("/v1") ? url : `${url}/v1`;

    // Test connection
    const isConnected = await testOllamaConnection(normalizedUrl);

    logger.info("Admin tested Ollama connection", {
      email: session.user.email,
      url: normalizedUrl,
      success: isConnected,
    });

    if (!isConnected) {
      return Response.json(
        {
          success: false,
          message:
            "Failed to connect to Ollama server. Please verify the URL is correct and the server is running.",
          url: normalizedUrl,
        },
        { status: 200 }
      );
    }

    return Response.json({
      success: true,
      message: "Successfully connected to Ollama server",
      url: normalizedUrl,
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    if (error instanceof z.ZodError) {
      return Response.json(
        {
          error: "Invalid request body",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    logger.error("Failed to test Ollama connection", { error });
    return Response.json(
      {
        success: false,
        error: "Failed to test connection",
      },
      { status: 500 }
    );
  }
}
