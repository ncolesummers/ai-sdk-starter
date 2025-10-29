"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OllamaApiFormat } from "@/lib/config/ollama-config";

type ConnectionStatus = "idle" | "testing" | "success" | "error";

type OllamaConfigFormProps = {
  initialUrl: string;
  initialFormat: OllamaApiFormat;
};

export const OllamaConfigForm = memo(
  function OllamaConfigFormComponent({
    initialUrl,
    initialFormat,
  }: OllamaConfigFormProps) {
    const [url, setUrl] = useState(initialUrl);
    const [apiFormat, setApiFormat] = useState<OllamaApiFormat>(initialFormat);

    // Only update local state when initial values actually change
    useEffect(() => {
      if (url !== initialUrl) {
        setUrl(initialUrl);
      }
    }, [initialUrl, url]);

    useEffect(() => {
      if (apiFormat !== initialFormat) {
        setApiFormat(initialFormat);
      }
    }, [initialFormat, apiFormat]);

    const [status, setStatus] = useState<ConnectionStatus>("idle");
    const [message, setMessage] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    const testConnection = async () => {
      if (!url.trim()) {
        setStatus("error");
        setMessage("Please enter a URL");
        return;
      }

      setStatus("testing");
      setMessage("");

      try {
        const response = await fetch("/api/admin/ollama/test", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url, format: apiFormat }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage("Successfully connected to Ollama server");
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to connect to Ollama server");
        }
      } catch (_error) {
        setStatus("error");
        setMessage("Network error. Please try again.");
      }
    };

    const saveConfiguration = async () => {
      if (!url.trim()) {
        setStatus("error");
        setMessage("Please enter a URL");
        return;
      }

      if (status !== "success") {
        setStatus("error");
        setMessage("Please test the connection before saving");
        return;
      }

      setIsSaving(true);
      setMessage("");

      try {
        const response = await fetch("/api/admin/ollama/config", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            format: apiFormat,
            testConnection: false,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setMessage(
            "Configuration saved successfully! Changes will take effect within 30 seconds."
          );
          // Refresh the page to show updated configuration
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setStatus("error");
          setMessage(
            data.error || data.message || "Failed to save configuration"
          );
        }
      } catch (_error) {
        setStatus("error");
        setMessage("Network error. Please try again.");
      } finally {
        setIsSaving(false);
      }
    };

    const resetForm = () => {
      setUrl(initialUrl);
      setApiFormat(initialFormat);
      setStatus("idle");
      setMessage("");
    };

    // Memoize computed value to prevent recalculation on every render
    const hasChanges = useMemo(
      () => url !== initialUrl || apiFormat !== initialFormat,
      [url, initialUrl, apiFormat, initialFormat]
    );

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="ollama-url">Ollama Server URL</Label>
              {status === "success" && (
                <Badge className="bg-green-600" variant="default">
                  Connected
                </Badge>
              )}
              {status === "error" && (
                <Badge variant="destructive">Connection Failed</Badge>
              )}
              {status === "testing" && (
                <Badge variant="secondary">Testing...</Badge>
              )}
            </div>
            <Input
              disabled={isSaving}
              id="ollama-url"
              onChange={(e) => {
                setUrl(e.target.value);
                setStatus("idle");
                setMessage("");
              }}
              placeholder="http://localhost:11434"
              type="url"
              value={url}
            />
            <p className="text-muted-foreground text-xs">
              Enter the base URL for your Ollama server. Non-localhost URLs must
              use HTTPS.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-format">API Format</Label>
            <Select
              disabled={isSaving}
              onValueChange={(value: OllamaApiFormat) => {
                setApiFormat(value);
                setStatus("idle");
                setMessage("");
              }}
              value={apiFormat}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select API format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="native">
                  <div className="flex flex-col items-start">
                    <div className="font-medium">Native Ollama API</div>
                    <div className="text-muted-foreground text-xs">
                      Uses /api/tags endpoint (recommended)
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="openai">
                  <div className="flex flex-col items-start">
                    <div className="font-medium">OpenAI-compatible API</div>
                    <div className="text-muted-foreground text-xs">
                      Uses /v1/models endpoint
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              Choose the API format your Ollama server supports. Most production
              instances support the native format.
            </p>
          </div>

          {message && (
            <Alert variant={status === "error" ? "destructive" : "default"}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              disabled={!url.trim() || status === "testing" || isSaving}
              onClick={testConnection}
              variant="outline"
            >
              {status === "testing" ? "Testing..." : "Test Connection"}
            </Button>

            <Button
              disabled={!hasChanges || status !== "success" || isSaving}
              onClick={saveConfiguration}
            >
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>

            {hasChanges && (
              <Button disabled={isSaving} onClick={resetForm} variant="ghost">
                Reset
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-muted/50 p-4">
          <h4 className="mb-2 font-medium text-sm">⚠️ Important Notes</h4>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground text-sm">
            <li>
              Changing the Ollama configuration affects all users immediately
            </li>
            <li>Always test the connection before saving</li>
            <li>Changes take effect within 30 seconds due to caching</li>
            <li>Make sure the Ollama server is running and accessible</li>
            <li>Use Native API format for standard Ollama installations</li>
          </ul>
        </div>
      </div>
    );
  },
  // Custom comparison function - only re-render if initial values actually changed
  (prevProps, nextProps) =>
    prevProps.initialUrl === nextProps.initialUrl &&
    prevProps.initialFormat === nextProps.initialFormat
);
