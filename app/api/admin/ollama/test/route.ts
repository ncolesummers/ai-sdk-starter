import { headers } from "next/headers";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import {
  getOllamaApiFormat,
  testOllamaConnection,
} from "@/lib/config/ollama-config";
import { ChatSDKError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";

const logger = createLogger("admin-api-test");

// Validation schema for connection test
const testConnectionSchema = z.object({
  url: z.string().url(),
  format: z.enum(["native", "openai"]).optional(),
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
    const { url, format } = testConnectionSchema.parse(body);

    // Use provided format or fall back to configured format
    const apiFormat = format || (await getOllamaApiFormat());

    // Normalize URL based on API format
    let normalizedUrl: string;
    if (apiFormat === "openai") {
      // For OpenAI format, ensure URL ends with /v1
      normalizedUrl = url.endsWith("/v1") ? url : `${url}/v1`;
    } else {
      // For native format, remove /v1 if present
      normalizedUrl = url.endsWith("/v1") ? url.slice(0, -3) : url;
    }

    // Test connection
    const isConnected = await testOllamaConnection(normalizedUrl, apiFormat);

    logger.info("Admin tested Ollama connection", {
      email: session.user.email,
      url: normalizedUrl,
      format: apiFormat,
      success: isConnected,
    });

    if (!isConnected) {
      return Response.json(
        {
          success: false,
          message: `Failed to connect to Ollama server using ${apiFormat} API format. Please verify the URL is correct and the server is running.`,
          url: normalizedUrl,
          apiFormat,
        },
        { status: 200 }
      );
    }

    return Response.json({
      success: true,
      message: `Successfully connected to Ollama server using ${apiFormat} API format`,
      url: normalizedUrl,
      apiFormat,
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
