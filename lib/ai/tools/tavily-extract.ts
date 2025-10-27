import { tavily } from "@tavily/core";
import { tool } from "ai";
import { z } from "zod";
import { ChatSDKError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";

const logger = createLogger("tavily-extract");

const extractFormatEnum = z.enum(["markdown", "text"]).optional();

export const tavilyExtract = tool({
  description:
    "Extract raw content from specific URLs using Tavily AI. Use this to parse and retrieve the full content of web pages. Supports up to 20 URLs simultaneously and returns success/failure status for each.",
  inputSchema: z.object({
    urls: z
      .array(z.string().url())
      .min(1)
      .max(20)
      .describe("Array of URLs to extract content from (1-20 URLs)"),
    format: extractFormatEnum.describe(
      "Output format: 'markdown' for formatted content, 'text' for plain text"
    ),
    includeImages: z
      .boolean()
      .optional()
      .describe("Include image URLs found in the content"),
  }),
  execute: async ({ urls, format = "markdown", includeImages = false }) => {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
      logger.error("TAVILY_API_KEY environment variable not set");
      throw new ChatSDKError(
        "offline:api",
        "TAVILY_API_KEY environment variable not set"
      );
    }

    try {
      const client = tavily({ apiKey });

      logger.info("Executing Tavily extract", {
        urlCount: urls.length,
        format,
      });

      const response = await client.extract(urls, {
        format: format === "markdown" ? "markdown" : "text",
        includeImages,
        timeout: 60,
      });

      logger.info("Tavily extract completed", {
        urlCount: urls.length,
        successCount: response.results.length,
        failureCount: response.failedResults?.length || 0,
        responseTime: response.responseTime,
      });

      // Format results for AI consumption
      const formattedResults = {
        successCount: response.results.length,
        failureCount: response.failedResults?.length || 0,
        responseTime: response.responseTime,
        results: response.results.map((result) => ({
          url: result.url,
          rawContent: result.rawContent,
          contentLength: result.rawContent.length,
          images: includeImages && result.images ? result.images : undefined,
        })),
        failures:
          response.failedResults && response.failedResults.length > 0
            ? response.failedResults.map((failed) => ({
                url: failed.url,
                error: failed.error,
              }))
            : undefined,
      };

      // Log failures for debugging
      if (response.failedResults && response.failedResults.length > 0) {
        logger.warn("Some URL extractions failed", {
          failures: response.failedResults.map((f) => ({
            url: f.url,
            error: f.error,
          })),
        });
      }

      return formattedResults;
    } catch (error) {
      logger.error("Tavily extract failed", {
        urlCount: urls.length,
        error: error instanceof Error ? error.message : String(error),
      });

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes("401")) {
          throw new ChatSDKError("unauthorized:api", "Invalid Tavily API key");
        }

        if (error.message.includes("429")) {
          throw new ChatSDKError(
            "rate_limit:api",
            "Content extraction rate limit exceeded"
          );
        }

        if (error.message.includes("timed out")) {
          throw new ChatSDKError("offline:api", "Content extraction timed out");
        }

        if (error.message.includes("400")) {
          throw new ChatSDKError(
            "bad_request:api",
            "Invalid URLs provided for extraction"
          );
        }
      }

      throw new ChatSDKError("offline:api", "Content extraction failed");
    }
  },
});
