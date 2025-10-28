import Link from "next/link";
import { OllamaConfigForm } from "@/components/admin/ollama-config-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getOllamaBaseUrl } from "@/lib/config/ollama-config";

export default async function OllamaConfigPage() {
  const baseUrl = await getOllamaBaseUrl();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          className="text-muted-foreground text-sm hover:text-foreground"
          href="/admin"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="mt-4 font-bold text-3xl">Ollama Configuration</h1>
        <p className="mt-2 text-muted-foreground">
          Configure the Ollama server connection for your application
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Server Configuration</CardTitle>
          <CardDescription>
            Update the Ollama server URL and test the connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OllamaConfigForm initialUrl={baseUrl} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
          <CardDescription>Active Ollama server details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-sm">Base URL</p>
              <p className="mt-1 font-mono text-muted-foreground text-sm">
                {baseUrl}
              </p>
            </div>
            <div>
              <p className="font-medium text-sm">Configuration Source</p>
              <p className="mt-1 text-muted-foreground text-sm">
                {baseUrl ===
                (process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1")
                  ? "Environment variable (default)"
                  : "Database (admin configured)"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
