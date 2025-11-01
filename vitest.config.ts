import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "happy-dom",
		setupFiles: ["./vitest.setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"lib/db/migrations/",
				"**/*.config.*",
				"**/*.d.ts",
				"**/types.ts",
				"**/__tests__/**",
				"**/test/**",
			],
		},
		globals: true,
		css: true,
		// Exclude Playwright tests, database migrations, and generated files
		exclude: [
			"**/node_modules/**",
			"**/dist/**",
			"**/.next/**",
			"**/lib/db/migrations/**",
			"tests/**",
			"**/playwright-report/**",
		],
		// Only include __tests__ directory for unit tests
		include: ["__tests__/**/*.{test,spec}.{ts,tsx}"],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./"),
		},
	},
});
