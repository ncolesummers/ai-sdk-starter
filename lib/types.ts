import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { ArtifactKind } from "@/components/artifact";
import type { createDocument } from "./ai/tools/create-document";
import type { requestSuggestions } from "./ai/tools/request-suggestions";
import type { tavilyExtract } from "./ai/tools/tavily-extract";
import type { tavilySearch } from "./ai/tools/tavily-search";
import type { updateDocument } from "./ai/tools/update-document";
import type { Suggestion } from "./db/schema";
import type { AppUsage } from "./usage";

export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<
  ReturnType<typeof requestSuggestions>
>;
type tavilySearchTool = InferUITool<ReturnType<typeof tavilySearch>>;
type tavilyExtractTool = InferUITool<ReturnType<typeof tavilyExtract>>;

export type ChatTools = {
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  requestSuggestions: requestSuggestionsTool;
  tavilySearch: tavilySearchTool;
  tavilyExtract: tavilyExtractTool;
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  suggestion: Suggestion;
  appendMessage: string;
  id: string;
  title: string;
  kind: ArtifactKind;
  clear: null;
  finish: null;
  usage: AppUsage;
  tavilySearchResult?: {
    query: string;
    resultsCount: number;
    responseTime: number;
    results: Array<{
      title: string;
      url: string;
      content: string;
      score: number;
      publishedDate?: string;
    }>;
    images?: Array<{
      url: string;
      description?: string;
    }>;
  };
  tavilyExtractResult?: {
    successCount: number;
    failureCount: number;
    responseTime: number;
    results: Array<{
      url: string;
      contentLength: number;
      contentPreview: string;
      rawContent: string;
      images?: string[];
    }>;
    failures?: Array<{
      url: string;
      error: string;
    }>;
  };
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
};
