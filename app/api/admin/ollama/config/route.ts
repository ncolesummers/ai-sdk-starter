import { headers } from "next/headers";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import type { ModelConfig } from "@/lib/config/ollama-config";
import {
  getModelConfigs,
  getOllamaBaseUrl,
  setModelConfigs,
  setOllamaBaseUrl,
  testOllamaConnection,
} from "@/lib/config/ollama-config";
import { ChatSDKError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";

const logger = createLogger("admin-api-config");

// Validation schema for URL update
const updateUrlSchema = z.object({
  url: z
    .string()
    .url()
    .refine(
      (url) => {
        // Allow http:// for localhost, require https:// otherwise
        const parsedUrl = new URL(url);
        if (
          parsedUrl.hostname === "localhost" ||
          parsedUrl.hostname === "127.0.0.1"
        ) {
          return true;
        }
        return parsedUrl.protocol === "https:";
      },
      { message: "Non-localhost URLs must use HTTPS" }
    ),
  testConnection: z.boolean().default(true),
});

// Validation schema for model config update
const updateModelsSchema = z.object({
  models: z.array(
    z.object({
      id: z.string(),
      displayName: z.string(),
      enabled: z.boolean(),
      isDefault: z.boolean(),
      reasoning: z.boolean(),
    })
  ),
});

/**
 * GET /api/admin/ollama/config
 * Get current Ollama configuration
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

    // Get current configuration
    const baseUrl = await getOllamaBaseUrl();
    const modelConfigs = await getModelConfigs();

    logger.info("Admin fetched Ollama configuration", {
      email: session.user.email,
    });

    return Response.json({
      baseUrl,
      modelConfigs,
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    logger.error("Failed to get Ollama configuration", { error });
    return Response.json(
      { error: "Failed to get configuration" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ollama/config
 * Update Ollama base URL
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
    const { url, testConnection } = updateUrlSchema.parse(body);

    // Normalize URL (ensure it ends with /v1)
    const normalizedUrl = url.endsWith("/v1") ? url : `${url}/v1`;

    // Test connection if requested
    if (testConnection) {
      const isConnected = await testOllamaConnection(normalizedUrl);
      if (!isConnected) {
        throw new ChatSDKError(
          "bad_request:admin",
          "Failed to connect to Ollama server. Please check the URL and try again."
        );
      }
    }

    // Save the new URL
    await setOllamaBaseUrl(normalizedUrl);

    logger.info("Admin updated Ollama base URL", {
      email: session.user.email,
      url: normalizedUrl,
    });

    return Response.json({
      success: true,
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

    logger.error("Failed to update Ollama base URL", { error });
    return Response.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/ollama/config
 * Update model configurations
 */
export async function PUT(request: Request) {
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
    const { models } = updateModelsSchema.parse(body);

    // Save the model configurations
    await setModelConfigs(models as ModelConfig[]);

    logger.info("Admin updated model configurations", {
      email: session.user.email,
      modelCount: models.length,
    });

    return Response.json({
      success: true,
      modelConfigs: models,
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

    logger.error("Failed to update model configurations", { error });
    return Response.json(
      { error: "Failed to update model configurations" },
      { status: 500 }
    );
  }
}
