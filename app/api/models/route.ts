import { getActiveModels, getDefaultModelId } from "@/lib/ai/models.server";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-models");

/**
 * GET /api/models
 * Get list of active models for the model selector
 */
export async function GET() {
  try {
    const [activeModels, defaultModelId] = await Promise.all([
      getActiveModels(),
      getDefaultModelId(),
    ]);

    logger.debug("Fetched active models", {
      count: activeModels.length,
      defaultModelId,
    });

    return Response.json({
      models: activeModels,
      defaultModelId,
    });
  } catch (error) {
    logger.error("Failed to fetch active models", { error });
    return Response.json({ error: "Failed to fetch models" }, { status: 500 });
  }
}
