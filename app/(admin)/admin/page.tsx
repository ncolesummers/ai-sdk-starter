import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getModelConfigs, getOllamaBaseUrl } from "@/lib/config/ollama-config";

export default async function AdminDashboard() {
  const baseUrl = await getOllamaBaseUrl();
  const modelConfigs = await getModelConfigs();
  const activeModels = modelConfigs.filter((config) => config.enabled);
  const defaultModel = modelConfigs.find((config) => config.isDefault);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold text-3xl">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Manage Ollama configuration and model settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ollama Configuration</CardTitle>
            <CardDescription>
              Current server connection settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium text-sm">Base URL</p>
              <p className="mt-1 font-mono text-muted-foreground text-sm">
                {baseUrl}
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90"
              href="/admin/ollama"
            >
              Configure Ollama
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model Configuration</CardTitle>
            <CardDescription>Manage available models</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium text-sm">Active Models</p>
              <p className="mt-1 font-bold text-2xl">{activeModels.length}</p>
            </div>
            <div>
              <p className="font-medium text-sm">Default Model</p>
              <p className="mt-1 text-muted-foreground text-sm">
                {defaultModel?.displayName || "None"}
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90"
              href="/admin/ollama/models"
            >
              Manage Models
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Models</CardTitle>
          <CardDescription>Current model configuration status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {modelConfigs.map((model) => (
              <div
                className="flex items-center justify-between rounded-lg border p-3"
                key={model.id}
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{model.displayName}</p>
                    <p className="text-muted-foreground text-sm">{model.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {model.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                  {model.reasoning && (
                    <Badge variant="outline">Reasoning</Badge>
                  )}
                  <Badge variant={model.enabled ? "default" : "secondary"}>
                    {model.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
