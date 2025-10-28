import Link from "next/link";
import { ModelConfigTable } from "@/components/admin/model-config-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getModelConfigs } from "@/lib/config/ollama-config";

export default async function ModelManagementPage() {
  const modelConfigs = await getModelConfigs();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <Link
          className="text-muted-foreground text-sm hover:text-foreground"
          href="/admin"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="mt-4 font-bold text-3xl">Model Management</h1>
        <p className="mt-2 text-muted-foreground">
          Configure which models are available to users and set their display
          names
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Configuration</CardTitle>
          <CardDescription>
            Manage model availability, display names, and default selection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ModelConfigTable initialConfigs={modelConfigs} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-2 text-muted-foreground text-sm">
            <li>At least one model must be enabled at all times</li>
            <li>Exactly one enabled model must be set as the default</li>
            <li>
              The default model cannot be disabled directly—set another model as
              default first
            </li>
            <li>
              Reasoning models have tools disabled to allow for better
              problem-solving
            </li>
            <li>Changes take effect within 30 seconds due to caching</li>
            <li>
              Use "Discover Models" to automatically detect new models from your
              Ollama server
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
