import { headers } from "next/headers";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import {
  fetchOllamaModels,
  getOllamaBaseUrl,
} from "@/lib/config/ollama-config";
import { ChatSDKError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";

const logger = createLogger("admin-api-models");

// Validation schema for custom URL
const fetchModelsSchema = z.object({
  url: z.string().url().optional(),
});

/**
 * GET /api/admin/ollama/models
 * Fetch available models from the configured Ollama server
 */
export async function GET() {
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

    // Get current Ollama URL
    const baseUrl = await getOllamaBaseUrl();

    // Fetch models from Ollama
    const models = await fetchOllamaModels(baseUrl);

    logger.info("Admin fetched Ollama models", {
      email: session.user.email,
      count: models.length,
    });

    return Response.json({
      models,
      baseUrl,
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    logger.error("Failed to fetch Ollama models", { error });
    return Response.json(
      { error: "Failed to fetch models from Ollama server" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ollama/models
 * Fetch models from a specific URL (for testing before saving)
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
    const { url } = fetchModelsSchema.parse(body);

    // Use provided URL or fall back to configured URL
    const targetUrl = url || (await getOllamaBaseUrl());

    // Normalize URL (ensure it ends with /v1)
    const normalizedUrl = targetUrl.endsWith("/v1")
      ? targetUrl
      : `${targetUrl}/v1`;

    // Fetch models from Ollama
    const models = await fetchOllamaModels(normalizedUrl);

    logger.info("Admin fetched Ollama models from custom URL", {
      email: session.user.email,
      url: normalizedUrl,
      count: models.length,
    });

    return Response.json({
      models,
      baseUrl: normalizedUrl,
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

    logger.error("Failed to fetch Ollama models from custom URL", { error });
    return Response.json(
      { error: "Failed to fetch models from Ollama server" },
      { status: 500 }
    );
  }
}
