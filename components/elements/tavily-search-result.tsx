"use client";

import {
  ChevronDownIcon,
  CopyIcon,
  ExternalLinkIcon,
  SearchIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { CustomUIDataTypes } from "@/lib/types";
import { Response } from "./response";

type TavilySearchResultProps = {
  result: CustomUIDataTypes["tavilySearchResult"];
};

export const TavilySearchResult = ({ result }: TavilySearchResultProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!result) {
    return null;
  }

  const copyAllResults = async () => {
    const allText = result.results
      .map(
        (r, i) =>
          `${i + 1}. ${r.title}\n   URL: ${r.url}\n   Score: ${r.score}\n   ${r.content}\n`
      )
      .join("\n");
    await navigator.clipboard.writeText(allText);
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-2 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SearchIcon className="size-4 text-blue-600" />
          <h4 className="font-medium text-sm">
            Search Results for "{result.query}"
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">
            {result.resultsCount} results in {result.responseTime}ms
          </span>
          <Button
            className="h-7 gap-1.5 text-xs"
            onClick={copyAllResults}
            size="sm"
            variant="ghost"
          >
            {copiedIndex === -1 ? (
              <>Copied!</>
            ) : (
              <>
                <CopyIcon className="size-3" />
                Copy All
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {result.results.map((searchResult) => (
          <Collapsible key={searchResult.url}>
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-800/50 dark:bg-blue-950/20">
              <CollapsibleTrigger className="flex w-full items-start gap-2 p-3 text-left hover:bg-blue-100/50 dark:hover:bg-blue-900/20">
                <ChevronDownIcon className="mt-0.5 size-4 shrink-0 text-blue-600 transition-transform group-data-[state=open]:rotate-180 dark:text-blue-400" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h5 className="mb-1 font-medium text-blue-900 text-sm dark:text-blue-100">
                        {searchResult.title}
                      </h5>
                      <a
                        className="flex items-center gap-1 truncate text-blue-600 text-xs hover:underline dark:text-blue-400"
                        href={searchResult.url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <ExternalLinkIcon className="size-3 shrink-0" />
                        {searchResult.url}
                      </a>
                    </div>
                    <Badge
                      className="shrink-0 bg-blue-600 text-white dark:bg-blue-500"
                      variant="secondary"
                    >
                      {(searchResult.score * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="border-blue-200 border-t p-3 dark:border-blue-800/50">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-blue-900 text-xs dark:text-blue-100">
                      Content
                    </span>
                    <Button
                      className="h-6 gap-1 text-xs"
                      onClick={() =>
                        copyToClipboard(
                          searchResult.content,
                          result.results.indexOf(searchResult)
                        )
                      }
                      size="sm"
                      variant="ghost"
                    >
                      {copiedIndex === result.results.indexOf(searchResult) ? (
                        <>Copied!</>
                      ) : (
                        <>
                          <CopyIcon className="size-3" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="rounded bg-blue-100/50 p-2 text-blue-900 text-sm dark:bg-blue-900/30 dark:text-blue-100">
                    <Response>{searchResult.content}</Response>
                  </div>
                  {searchResult.publishedDate && (
                    <p className="mt-2 text-blue-700 text-xs dark:text-blue-300">
                      Published: {searchResult.publishedDate}
                    </p>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>

      {result.images && result.images.length > 0 && (
        <div className="mt-4">
          <h5 className="mb-2 font-medium text-sm">Related Images</h5>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {result.images.slice(0, 4).map((image) => (
              <a
                className="group relative aspect-video overflow-hidden rounded-lg border"
                href={image.url}
                key={image.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Image
                  alt={image.description || "Search result"}
                  className="object-cover transition-transform group-hover:scale-105"
                  fill
                  src={image.url}
                />
                {image.description && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-white text-xs">
                    {image.description.substring(0, 50)}...
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
