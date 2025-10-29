import { headers } from "next/headers";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import {
  fetchOllamaModels,
  getOllamaApiFormat,
  getOllamaBaseUrl,
  type OllamaApiFormat,
} from "@/lib/config/ollama-config";
import { ChatSDKError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";

const logger = createLogger("admin-api-models");

// Validation schema for custom URL
const fetchModelsSchema = z.object({
  url: z.string().url().optional(),
  format: z.enum(["native", "openai"]).optional(),
});

/**
 * GET /api/admin/ollama/models
 * Fetch available models from the configured Ollama server
 */
export async function GET() {
  // Declare these outside try block so they're available in catch for error logging
  let baseUrl: string | undefined;
  let apiFormat: OllamaApiFormat | undefined;

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

    // Get current Ollama configuration
    baseUrl = await getOllamaBaseUrl();
    apiFormat = await getOllamaApiFormat();

    // Fetch models from Ollama
    const rawModels = await fetchOllamaModels(baseUrl, apiFormat);

    // Normalize models to ensure they all have an 'id' field for frontend compatibility
    const models = rawModels.map((model) => {
      if (apiFormat === "native") {
        const nativeModel = model as { name: string; [key: string]: any };
        const { name, ...rest } = nativeModel;
        return {
          ...rest,
          id: name,
        };
      }
      // OpenAI format already has 'id' field
      return model;
    });

    logger.info("Admin fetched Ollama models", {
      email: session.user.email,
      count: models.length,
      format: apiFormat,
    });

    return Response.json({
      models,
      baseUrl,
      apiFormat,
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    logger.error("Failed to fetch Ollama models (GET handler)", {
      handler: "GET",
      baseUrl,
      apiFormat,
      error,
    });
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
  // Declare these outside try block so they're available in catch for error logging
  let normalizedUrl: string | undefined;
  let apiFormat: OllamaApiFormat | undefined;

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
    const { url, format } = fetchModelsSchema.parse(body);

    // Use provided URL or fall back to configured URL
    const targetUrl = url || (await getOllamaBaseUrl());

    // Use provided format or fall back to configured format
    apiFormat = format || (await getOllamaApiFormat());

    // Normalize URL based on API format
    if (apiFormat === "openai") {
      // For OpenAI format, ensure URL ends with /v1
      normalizedUrl = targetUrl.endsWith("/v1") ? targetUrl : `${targetUrl}/v1`;
    } else {
      // For native format, remove /v1 if present
      normalizedUrl = targetUrl.endsWith("/v1")
        ? targetUrl.slice(0, -3)
        : targetUrl;
    }

    // Fetch models from Ollama
    const rawModels = await fetchOllamaModels(normalizedUrl, apiFormat);

    // Normalize models to ensure they all have an 'id' field for frontend compatibility
    const models = rawModels.map((model) => {
      if (apiFormat === "native") {
        const nativeModel = model as { name: string; [key: string]: any };
        const { name, ...rest } = nativeModel;
        return {
          ...rest,
          id: name,
        };
      }
      // OpenAI format already has 'id' field
      return model;
    });

    logger.info("Admin fetched Ollama models from custom URL", {
      email: session.user.email,
      url: normalizedUrl,
      format: apiFormat,
      count: models.length,
    });

    return Response.json({
      models,
      baseUrl: normalizedUrl,
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

    logger.error("Failed to fetch Ollama models (POST handler)", {
      handler: "POST",
      requestedUrl: normalizedUrl,
      apiFormat,
      error,
    });
    return Response.json(
      { error: "Failed to fetch models from Ollama server" },
      { status: 500 }
    );
  }
}
