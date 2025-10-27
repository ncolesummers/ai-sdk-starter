# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
pnpm dev              # Start dev server with Turbopack
pnpm build            # Run migrations + production build
pnpm start            # Start production server
pnpm lint             # Check code quality (ultracite)
pnpm format           # Auto-fix code style issues
```

### Database
```bash
pnpm db:generate      # Generate migration from schema changes
pnpm db:migrate       # Run pending migrations
pnpm db:studio        # Open Drizzle Studio GUI
pnpm db:push          # Push schema directly (dev only)
```

### Testing
```bash
pnpm test             # Run all Playwright tests
```

## Architecture Overview

### Route Organization

This app uses **Next.js 16 App Router with route groups** for clean separation:

- `app/(auth)/` - Authentication routes (login, register, Better Auth API handlers)
  - `/api/auth/[...all]` - Better Auth catch-all handler
  - `actions.ts` - Auth server actions (login, register via magic link)

- `app/(chat)/` - Protected chat interface (requires auth)
  - `/` - Main chat page
  - `/chat/[id]` - Individual chat view
  - `/api/chat` - POST (stream messages), DELETE (chats)
  - `/api/chat/[id]/stream` - Resume interrupted streams
  - `actions.ts` - Chat server actions (create, delete, update)

- `app/api/` - General API routes
  - `/health` - Health check for K8s probes
  - `/test-auth` - Auth diagnostics

**Key Pattern**: Route groups `(auth)` and `(chat)` don't appear in URLs but enforce layout/auth boundaries.

### AI Streaming Architecture

**Flow**: Client → `/api/chat` → AI SDK → Ollama → SSE Stream → Client

1. **Client** (`components/chat.tsx`):
   - Uses `useChat<ChatMessage>()` hook with custom transport
   - Sends only the latest message + metadata (model, visibility)
   - Receives SSE events and updates `DataStreamProvider` context

2. **Server** (`app/(chat)/api/chat/route.ts`):
   - Validates auth and rate limits (100 messages/day)
   - Loads conversation history from database
   - Calls `streamText()` with:
     - System prompt including geolocation hints
     - Conditionally active tools (disabled for reasoning model)
     - Custom `onFinish` handler that saves messages and enriches usage via TokenLens
   - Wraps with `createUIMessageStream()` for custom SSE format

3. **Tools** (`lib/ai/tools/`):
   - Each tool uses Zod schema for type-safe parameters
   - Tools write to `dataStream` for real-time client updates
   - Document tools (create/update) invoke artifact handlers

4. **Artifact Handlers** (`lib/artifacts/server.ts`):
   - `createDocumentHandler()` wraps generators with persistence
   - Uses `streamObject()` for code generation with schemas
   - Emits SSE deltas (e.g., `data-codeDelta`, `data-title`) during generation
   - Auto-saves to `Document` table on completion

**SSE Event Types**:
- `data-textDelta` - Streaming text chunks
- `data-codeDelta` / `data-sheetDelta` - Artifact content updates
- `data-usage` - Token usage (enriched by TokenLens)
- `data-id`, `data-title`, `data-kind` - Artifact metadata
- `data-finish` - Streaming complete

### Authentication (Better Auth)

**Configuration** (`lib/auth.ts`):
- Magic link plugin (passwordless via email)
- Drizzle adapter for PostgreSQL persistence
- 7-day session with 24-hour refresh window
- OpenTelemetry instrumentation on all auth operations

**Database Schema**:
```
User → Session (cascade delete)
     → Account (OAuth/social login support)
Verification (magic link tokens)
```

**Auth Flow**:
1. User submits email at `/login`
2. Server action calls `signIn.magicLink({ email, callbackURL })`
3. Better Auth sends email with token URL
4. Click link → Better Auth validates → creates session
5. Session cookie set (prefix: `better-auth`)

**Client Access**: `lib/auth-client.ts` provides browser-side helpers

### Database Architecture

**Temporal Pattern**: Documents use composite keys `(id, createdAt)` for version history without separate version tables.

**Core Tables**:
- `Chat` - Conversations with `lastContext` JSONB for usage stats
- `Message_v2` - Messages with JSON `parts` and `attachments` arrays
- `Document` - Artifacts with `kind` enum (text/code/image/sheet)
- `Suggestion` - Document suggestions linked to specific versions
- `Vote_v2` - Message ratings (composite key: chatId, messageId)
- `Stream` - Redis-backed resumable streams

**Query Layer** (`lib/db/queries.ts`):
- Uses `server-only` directive (prevents client import)
- Custom `ChatSDKError` for typed error handling
- Drizzle ORM with type-safe results via `InferSelectModel`

### Observability

**OpenTelemetry Integration**:
- `instrumentation.ts` - Initializes `@vercel/otel` with service name
- Tracing spans on: auth flows, API routes, email sending, chat streaming
- Enabled in production OR when `OTEL_EXPORTER_OTLP_ENDPOINT` is set

**Structured Logging** (`lib/logger.ts`):
- `createLogger(module)` - Factory for module-specific loggers
- Automatic trace/span ID injection from active OTEL context
- JSON output in production, colorized text in development
- Log levels: DEBUG < INFO < WARN < ERROR (via `LOG_LEVEL` env var)

**Example**:
```typescript
const logger = createLogger("my-module");
logger.info("Operation started", { userId: "123" });
// Output includes traceId/spanId if inside active span
```

### Component Architecture

**Artifact System** - Dual-path design:

1. **Server Handlers** (`lib/artifacts/*/server.ts`):
   - Implement `DocumentHandler<ArtifactKind>` interface
   - Generate content via `streamObject()` or `streamText()`
   - Invoked by `createDocument` and `updateDocument` tools

2. **Client Renderers** (`components/artifacts/*/client.tsx`):
   - Code: CodeMirror with syntax highlighting
   - Text: ProseMirror rich text editor
   - Sheet: react-data-grid for CSV data
   - Image: Direct blob rendering
   - All support diff view via CodeMirror diff plugin

**Data Streaming**:
- `DataStreamProvider` - React Context for SSE events
- `useDataStream()` - Hook to consume real-time artifact updates
- Custom message type: `ChatMessage = UIMessage<Metadata, CustomDataTypes, Tools>`

## Key Patterns

### Model Selection
```typescript
// lib/ai/models.ts
chatModels = [
  { id: "chat-model", name: "Qwen3 Chat" },
  { id: "chat-model-reasoning", name: "Qwen3 Reasoning" }
]

// Tools disabled for reasoning model to prevent early termination
experimental_activeTools: selectedChatModel === "chat-model-reasoning"
  ? []
  : ["createDocument", "updateDocument", "requestSuggestions"]
```

### Entitlements & Rate Limiting
```typescript
// lib/ai/entitlements.ts
entitlementsByUserType.regular = {
  maxMessagesPerDay: 100,
  availableChatModelIds: ["chat-model", "chat-model-reasoning"]
}
```

### Error Handling
```typescript
// lib/errors.ts
type ErrorCode = `${ErrorType}:${Surface}`
// Examples: "bad_request:api", "unauthorized:chat"

// Visibility controls client exposure:
// - "response": User-facing message
// - "log": Server-only, generic client message
// - "none": Silent logging
```

### Stream Resumption
Redis-backed resumption via `resumable-stream` package:
```typescript
// Save stream context
await createStreamContext({ chatId, stream });

// Resume if interrupted
const resumed = await retrieveStreamContext(chatId);
```

## Code Quality

This project uses **Ultracite** (Biome-based) for formatting and linting. Key rules to follow:

### TypeScript
- **NO enums** - Use `const` objects with `as const` + type extraction
- **NO parameter properties** - Explicitly declare class properties
- **NO namespaces** - Use ES modules
- Use `type` for type aliases (not `interface` unless extending)
- Always use `import type` and `export type` for types

### React/Next.js
- **NO `<img>`** - Use Next.js `<Image>` component
- **NO `<head>`** - Use Next.js `<Head>` or Metadata API
- Always include `key` props in mapped elements
- Use `<>` instead of `<Fragment>`
- Hooks must be called from top level (no conditionals)

### Accessibility
- Include `alt` text for images (no "image", "photo", "picture" in text)
- Always set `type` on `<button>` elements
- Match `onClick` with keyboard handler (`onKeyUp`/`onKeyDown`/`onKeyPress`)
- Include `lang` attribute on `<html>` element
- Accompany `onMouseOver`/`onMouseOut` with `onFocus`/`onBlur`

### General
- **NO `console.*`** - Use structured logger instead
- **NO `any` type** - Use `unknown` and type guards
- **NO `var`** - Use `const` or `let`
- **NO unnecessary `async`** - Remove if function doesn't `await`
- Prefer arrow functions over `function` expressions
- Use `===` and `!==` (never `==` or `!=`)
- Use optional chaining (`?.`) over chained logical expressions

## Environment Configuration

**Required**:
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - Session encryption secret (32 bytes)
- `BETTER_AUTH_URL` - Base URL for magic links (e.g., `http://localhost:3000`)
- Email config: `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`

**Optional**:
- `OLLAMA_BASE_URL` - Ollama endpoint (default: `http://localhost:11434/v1`)
- `TAVILY_API_KEY` - API key for Tavily web search and content extraction tools
- `LOG_LEVEL` - Logging verbosity: DEBUG | INFO | WARN | ERROR
- `OTEL_SERVICE_NAME` - Service name for telemetry
- `OTEL_EXPORTER_OTLP_ENDPOINT` - OTEL collector endpoint (enables telemetry in K8s)

## Common Tasks

### Adding a New AI Tool

1. Create tool file in `lib/ai/tools/`:
```typescript
export const myTool = tool({
  description: "...",
  parameters: z.object({ ... }),
  execute: async ({ param1 }) => {
    // Implementation
    return result;
  }
});
```

2. Register in `app/(chat)/api/chat/route.ts`:
```typescript
tools: {
  myTool,
  createDocument: createDocument({
    session: session.session,
    dataStream,
  }),
  updateDocument: updateDocument({
    session: session.session,
    dataStream,
  }),
  // ...
}
```

### Adding a Database Table

1. Define schema in `lib/db/schema.ts`:
```typescript
export const myTable = pgTable("MyTable", {
  id: uuid("id").primaryKey().defaultRandom(),
  // ...
});
```

2. Generate migration:
```bash
pnpm db:generate
```

3. Review migration in `lib/db/migrations/`

4. Apply migration:
```bash
pnpm db:migrate
```

### Adding Authentication to a Route

Protect routes by checking session in page/layout:
```typescript
// app/(protected)/page.tsx
import { auth } from "@/lib/auth";

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: headers()
  });

  if (!session) {
    redirect("/login");
  }

  return <div>Protected content</div>;
}
```

Or use middleware for route-level protection.

## Switching AI Providers

To replace Ollama with a cloud provider:

**OpenAI**:
```typescript
// lib/ai/providers.ts
import { openai } from '@ai-sdk/openai';

customProvider({
  languageModels: {
    "chat-model": openai("gpt-4"),
  }
})
```

**Anthropic**:
```typescript
import { anthropic } from '@ai-sdk/anthropic';

customProvider({
  languageModels: {
    "chat-model": anthropic("claude-3-5-sonnet-20241022"),
  }
})
```

Update model names in `lib/ai/models.ts` accordingly.

## Deployment

### Docker
The project includes standalone Next.js output mode (`next.config.ts`):
```bash
docker build -t ai-chatbot .
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e OLLAMA_BASE_URL="http://host.docker.internal:11434/v1" \
  ai-chatbot
```

### Kubernetes
- Health check: `GET /api/health`
- Set `OTEL_EXPORTER_OTLP_ENDPOINT` to enable telemetry
- Standalone build automatically configured

### Vercel
Standard deployment flow:
1. Push to GitHub
2. Import to Vercel
3. Configure environment variables
4. Deploy

**Important**: For Vercel, either host Ollama publicly or switch to a cloud AI provider.
