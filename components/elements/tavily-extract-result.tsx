"use client";

import {
  AlertTriangleIcon,
  ChevronDownIcon,
  CopyIcon,
  ExternalLinkIcon,
  LinkIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { CustomUIDataTypes } from "@/lib/types";
import { Response } from "./response";

type TavilyExtractResultProps = {
  result: CustomUIDataTypes["tavilyExtractResult"];
};

export const TavilyExtractResult = ({ result }: TavilyExtractResultProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!result) {
    return null;
  }

  return (
    <div className="space-y-2 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LinkIcon className="size-4 text-green-600" />
          <h4 className="font-medium text-sm">URL Extraction Results</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">
            {result.successCount} succeeded
            {result.failureCount > 0 && `, ${result.failureCount} failed`} in{" "}
            {result.responseTime}ms
          </span>
        </div>
      </div>

      {/* Successful extractions */}
      {result.results.length > 0 && (
        <div className="space-y-2">
          {result.results.map((extraction) => (
            <Collapsible key={extraction.url}>
              <div className="rounded-lg border border-green-200 bg-green-50/50 dark:border-green-800/50 dark:bg-green-950/20">
                <CollapsibleTrigger className="flex w-full items-start gap-2 p-3 text-left hover:bg-green-100/50 dark:hover:bg-green-900/20">
                  <ChevronDownIcon className="mt-0.5 size-4 shrink-0 text-green-600 transition-transform group-data-[state=open]:rotate-180 dark:text-green-400" />
                  <div className="min-w-0 flex-1">
                    <a
                      className="mb-1 flex items-center gap-1 break-all font-medium text-green-900 text-sm hover:underline dark:text-green-100"
                      href={extraction.url}
                      onClick={(e) => e.stopPropagation()}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <ExternalLinkIcon className="size-3 shrink-0" />
                      {extraction.url}
                    </a>
                    <p className="text-green-700 text-xs dark:text-green-300">
                      {extraction.contentLength.toLocaleString()} characters
                      extracted
                    </p>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-green-200 border-t p-3 dark:border-green-800/50">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-green-900 text-xs dark:text-green-100">
                        Content Preview
                      </span>
                      <Button
                        className="h-6 gap-1 text-xs"
                        onClick={() =>
                          copyToClipboard(
                            extraction.contentPreview,
                            result.results.indexOf(extraction)
                          )
                        }
                        size="sm"
                        variant="ghost"
                      >
                        {copiedIndex === result.results.indexOf(extraction) ? (
                          <>Copied!</>
                        ) : (
                          <>
                            <CopyIcon className="size-3" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="rounded bg-green-100/50 p-2 text-green-900 text-sm dark:bg-green-900/30 dark:text-green-100">
                      <Response>{extraction.contentPreview}</Response>
                      {extraction.contentLength > 200 && (
                        <p className="mt-2 text-green-700 text-xs italic dark:text-green-300">
                          ... and {extraction.contentLength - 200} more
                          characters
                        </p>
                      )}
                    </div>

                    {extraction.images && extraction.images.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-1 text-green-900 text-xs dark:text-green-100">
                          {extraction.images.length} images found
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {extraction.images.slice(0, 5).map((img) => (
                            <a
                              className="relative size-12 overflow-hidden rounded border border-green-300"
                              href={img}
                              key={img}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <Image
                                alt="Extracted content"
                                className="object-cover"
                                fill
                                src={img}
                              />
                            </a>
                          ))}
                          {extraction.images.length > 5 && (
                            <div className="flex size-12 items-center justify-center rounded border border-green-300 bg-green-100 text-green-700 text-xs dark:bg-green-900/30 dark:text-green-300">
                              +{extraction.images.length - 5}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Failed extractions */}
      {result.failures && result.failures.length > 0 && (
        <div className="mt-4 space-y-2">
          <h5 className="flex items-center gap-2 text-red-700 text-sm dark:text-red-400">
            <AlertTriangleIcon className="size-4" />
            Failed Extractions
          </h5>
          {result.failures.map((failure) => (
            <div
              className="rounded-lg border border-red-200 bg-red-50/50 p-3 dark:border-red-800/50 dark:bg-red-950/20"
              key={failure.url}
            >
              <a
                className="mb-1 flex items-center gap-1 break-all font-medium text-red-900 text-sm hover:underline dark:text-red-100"
                href={failure.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                <ExternalLinkIcon className="size-3 shrink-0" />
                {failure.url}
              </a>
              <p className="text-red-700 text-xs dark:text-red-300">
                Error: {failure.error}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
