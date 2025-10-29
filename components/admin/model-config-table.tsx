"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ModelConfig } from "@/lib/config/ollama-config";

type ModelConfigTableProps = {
  initialConfigs: ModelConfig[];
};

// Deep comparison helper for model configs
function areConfigsEqual(a: ModelConfig[], b: ModelConfig[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((configA, index) => {
    const configB = b[index];
    return (
      configA.id === configB.id &&
      configA.displayName === configB.displayName &&
      configA.enabled === configB.enabled &&
      configA.isDefault === configB.isDefault &&
      configA.reasoning === configB.reasoning
    );
  });
}

export const ModelConfigTable = memo(
  function ModelConfigTableComponent({
    initialConfigs,
  }: ModelConfigTableProps) {
    const [configs, setConfigs] = useState<ModelConfig[]>(initialConfigs);

    // Only update local state when initialConfigs actually changes
    useEffect(() => {
      if (!areConfigsEqual(configs, initialConfigs)) {
        setConfigs(initialConfigs);
      }
    }, [initialConfigs]); // Don't include configs - it would reset user changes!
    const [isSaving, setIsSaving] = useState(false);
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [message, setMessage] = useState<string>("");
    const [messageType, setMessageType] = useState<
      "success" | "error" | "info"
    >("info");

    const discoverModels = async () => {
      setIsDiscovering(true);
      setMessage("");

      try {
        const response = await fetch("/api/admin/ollama/models");
        const data = await response.json();

        if (response.ok && data.models) {
          // Merge discovered models with existing configs
          const existingIds = new Set(configs.map((c) => c.id));
          const newModels = data.models
            .filter((m: { id: string }) => !existingIds.has(m.id))
            .map((m: { id: string }) => ({
              id: m.id,
              displayName: m.id,
              enabled: false,
              isDefault: false,
              reasoning: false,
            }));

          if (newModels.length > 0) {
            setConfigs([...configs, ...newModels]);
            setMessageType("success");
            setMessage(`Discovered ${newModels.length} new models`);
          } else {
            setMessageType("info");
            setMessage("No new models found");
          }
        } else {
          setMessageType("error");
          setMessage(data.error || "Failed to discover models");
        }
      } catch (_error) {
        setMessageType("error");
        setMessage("Network error. Please try again.");
      } finally {
        setIsDiscovering(false);
      }
    };

    const updateConfig = (id: string, updates: Partial<ModelConfig>) => {
      setConfigs(
        configs.map((config) =>
          config.id === id ? { ...config, ...updates } : config
        )
      );
      setMessage("");
    };

    const setDefault = (id: string) => {
      setConfigs(
        configs.map((config) => ({
          ...config,
          isDefault: config.id === id,
        }))
      );
      setMessage("");
    };

    const toggleEnabled = (id: string) => {
      const config = configs.find((c) => c.id === id);
      if (!config) {
        return;
      }

      // If disabling the default model, warn and prevent
      if (config.enabled && config.isDefault) {
        setMessageType("error");
        setMessage(
          "Cannot disable the default model. Please set another model as default first."
        );
        return;
      }

      // If disabling and this is the last enabled model, prevent
      const enabledCount = configs.filter((c) => c.enabled).length;
      if (config.enabled && enabledCount === 1) {
        setMessageType("error");
        setMessage("At least one model must be enabled");
        return;
      }

      updateConfig(id, { enabled: !config.enabled });
    };

    const validateAndSave = async () => {
      // Validation
      const enabledModels = configs.filter((c) => c.enabled);
      if (enabledModels.length === 0) {
        setMessageType("error");
        setMessage("At least one model must be enabled");
        return;
      }

      const defaultModels = enabledModels.filter((c) => c.isDefault);
      if (defaultModels.length !== 1) {
        setMessageType("error");
        setMessage("Exactly one enabled model must be set as default");
        return;
      }

      // Check for empty display names
      if (configs.some((c) => c.enabled && !c.displayName.trim())) {
        setMessageType("error");
        setMessage("All enabled models must have a display name");
        return;
      }

      setIsSaving(true);
      setMessage("");

      try {
        const response = await fetch("/api/admin/ollama/config", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ models: configs }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setMessageType("success");
          setMessage(
            "Model configuration saved successfully! Changes take effect immediately."
          );
          // Refresh after a delay
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setMessageType("error");
          setMessage(data.error || "Failed to save configuration");
        }
      } catch (_error) {
        setMessageType("error");
        setMessage("Network error. Please try again.");
      } finally {
        setIsSaving(false);
      }
    };

    const resetChanges = () => {
      setConfigs(initialConfigs);
      setMessage("");
    };

    // Memoize computed values to prevent recalculation on every render
    const hasChanges = useMemo(
      () => !areConfigsEqual(configs, initialConfigs),
      [configs, initialConfigs]
    );

    const enabledCount = useMemo(
      () => configs.filter((c) => c.enabled).length,
      [configs]
    );

    const totalCount = useMemo(() => configs.length, [configs]);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">
              {enabledCount} enabled · {totalCount} total models
            </p>
          </div>
          <Button
            disabled={isDiscovering || isSaving}
            onClick={discoverModels}
            size="sm"
            variant="outline"
          >
            {isDiscovering ? "Discovering..." : "Discover Models"}
          </Button>
        </div>

        {message && (
          <Alert variant={messageType === "error" ? "destructive" : "default"}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-sm">
                    Model ID
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-sm">
                    Display Name
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-sm">
                    Enabled
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-sm">
                    Default
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-sm">
                    Reasoning
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {configs.map((config) => (
                  <tr
                    className={config.enabled ? "" : "opacity-50"}
                    key={config.id}
                  >
                    <td className="px-4 py-3">
                      <code className="text-sm">{config.id}</code>
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        className="max-w-xs"
                        disabled={isSaving}
                        onChange={(e) =>
                          updateConfig(config.id, {
                            displayName: e.target.value,
                          })
                        }
                        value={config.displayName}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        checked={config.enabled}
                        className="h-4 w-4 cursor-pointer"
                        disabled={isSaving}
                        onChange={() => toggleEnabled(config.id)}
                        type="checkbox"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        checked={config.isDefault}
                        className="h-4 w-4 cursor-pointer"
                        disabled={!config.enabled || isSaving}
                        name="defaultModel"
                        onChange={() => setDefault(config.id)}
                        type="radio"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        checked={config.reasoning}
                        className="h-4 w-4 cursor-pointer"
                        disabled={isSaving}
                        onChange={(e) =>
                          updateConfig(config.id, {
                            reasoning: e.target.checked,
                          })
                        }
                        type="checkbox"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-3">
          <Button disabled={!hasChanges || isSaving} onClick={validateAndSave}>
            {isSaving ? "Saving..." : "Save Configuration"}
          </Button>

          {hasChanges && (
            <Button
              disabled={isSaving}
              onClick={resetChanges}
              variant="outline"
            >
              Reset Changes
            </Button>
          )}
        </div>

        <div className="rounded-lg border bg-muted/50 p-4">
          <h4 className="mb-2 font-medium text-sm">Column Descriptions</h4>
          <ul className="space-y-1 text-muted-foreground text-sm">
            <li>
              <strong>Model ID:</strong> The identifier used by Ollama
            </li>
            <li>
              <strong>Display Name:</strong> The name shown to users in the
              model selector
            </li>
            <li>
              <strong>Enabled:</strong> Whether this model appears in the model
              selector
            </li>
            <li>
              <strong>Default:</strong> The model selected by default (only one
              allowed)
            </li>
            <li>
              <strong>Reasoning:</strong> Whether to disable tools for this
              model (for reasoning models)
            </li>
          </ul>
        </div>
      </div>
    );
  },
  // Custom comparison function - only re-render if configs actually changed
  (prevProps, nextProps) =>
    areConfigsEqual(prevProps.initialConfigs, nextProps.initialConfigs)
);
