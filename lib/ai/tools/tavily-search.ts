import { tavily } from "@tavily/core";
import { tool } from "ai";
import { z } from "zod";
import { ChatSDKError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";

const logger = createLogger("tavily-search");

const searchDepthEnum = z.enum(["basic", "advanced"]).optional();
const timeRangeEnum = z.enum(["day", "week", "month", "year"]).optional();

export const tavilySearch = tool({
  description:
    "Search the web for current information using Tavily AI. Use this when you need real-time data, recent news, facts, or information not in your knowledge base. Returns search results with titles, URLs, content snippets, and relevance scores.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
    searchDepth: searchDepthEnum.describe(
      "Search depth: 'basic' (faster, 1 credit) or 'advanced' (more relevant, 2 credits). Use advanced for research queries."
    ),
    maxResults: z
      .number()
      .int()
      .min(1)
      .max(20)
      .optional()
      .describe("Maximum number of results to return (1-20, default: 5)"),
    includeImages: z
      .boolean()
      .optional()
      .describe("Include query-related image URLs in results"),
    includeDomains: z
      .array(z.string())
      .optional()
      .describe(
        "Array of domains to specifically include (e.g., ['wikipedia.org'])"
      ),
    excludeDomains: z
      .array(z.string())
      .optional()
      .describe("Array of domains to specifically exclude"),
    timeRange: timeRangeEnum.describe(
      "Limit results to specific time range: 'day', 'week', 'month', or 'year'"
    ),
  }),
  execute: async ({
    query,
    searchDepth = "basic",
    maxResults = 5,
    includeImages = false,
    includeDomains,
    excludeDomains,
    timeRange,
  }) => {
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

      logger.info("Executing Tavily search", {
        query,
        searchDepth,
        maxResults,
      });

      const response = await client.search(query, {
        searchDepth,
        maxResults,
        includeImages,
        includeDomains,
        excludeDomains,
        timeRange,
        includeAnswer: false, // Per user preference
        includeRawContent: false, // Keep response size manageable
        timeout: 60,
      });

      logger.info("Tavily search completed", {
        query,
        resultsCount: response.results.length,
        responseTime: response.responseTime,
      });

      // Format results for AI consumption
      const formattedResults = {
        query: response.query,
        resultsCount: response.results.length,
        responseTime: response.responseTime,
        results: response.results.map((result) => ({
          title: result.title,
          url: result.url,
          content: result.content,
          score: result.score,
          publishedDate: result.publishedDate,
        })),
        images: includeImages ? response.images : undefined,
      };

      return formattedResults;
    } catch (error) {
      logger.error("Tavily search failed", {
        query,
        error: error instanceof Error ? error.message : String(error),
      });

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes("401")) {
          throw new ChatSDKError("unauthorized:api", "Invalid Tavily API key");
        }

        if (error.message.includes("429")) {
          throw new ChatSDKError("rate_limit:api", "Search rate limit exceeded");
        }

        if (error.message.includes("timed out")) {
          throw new ChatSDKError("offline:api", "Search request timed out");
        }
      }

      throw new ChatSDKError("offline:api", "Search failed");
    }
  },
});
