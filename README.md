<a href="https://chat.vercel.ai/">
  <img alt="Next.js and App Router-ready AI chatbot." src="app/(chat)/opengraph-image.png">
  <h1 align="center">AI Chatbot</h1>
</a>

<p align="center">
    An open-source AI chatbot built with Next.js and the AI SDK, featuring local AI inference and modern authentication.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#deployment"><strong>Deployment</strong></a>
</p>
<br/>

## Features

### Core Capabilities
- **Local AI Inference** with [Ollama](https://ollama.ai) using Qwen3 14B models
- **Passwordless Authentication** via Better Auth magic links
- **Real-time Chat Interface** with streaming responses
- **Document Management** with artifact creation and editing
- **File Uploads** with multimodal support
- **Chat History** with persistent storage

### Technical Features
- **Modern Stack**: Next.js 16 App Router, React Server Components, Server Actions
- **Type Safety**: Full TypeScript with Drizzle ORM
- **Observability**: OpenTelemetry instrumentation and structured logging
- **Production Ready**: Health checks, error handling, and monitoring
- **Cloud & Local**: Deploy to Vercel or run locally with Docker/Kubernetes

## Tech Stack

### Frontend & Framework
- [Next.js 16](https://nextjs.org) - React framework with App Router
- [AI SDK](https://ai-sdk.dev) - Unified API for AI model interactions
- [shadcn/ui](https://ui.shadcn.com) - Component library with Tailwind CSS
- [Radix UI](https://radix-ui.com) - Accessible component primitives

### AI & Models
- [Ollama](https://ollama.ai) - Local AI model inference
- **Qwen3 14B** - Advanced reasoning and multimodal capabilities
- OpenAI-compatible API for maximum portability

### Authentication
- [Better Auth](https://better-auth.com) - Modern authentication framework
- Magic link passwordless login via email
- Session management with 7-day expiration

### Database & Storage
- [Neon Serverless Postgres](https://neon.tech) - Database with branching
- [Drizzle ORM](https://orm.drizzle.team) - Type-safe database queries
- [Vercel Blob](https://vercel.com/storage/blob) - File storage

### Observability
- [OpenTelemetry](https://opentelemetry.io) - Distributed tracing
- Structured logging with trace correlation
- Health check and diagnostic endpoints

## Getting Started

### Prerequisites

1. **Ollama** - Install from [ollama.ai](https://ollama.ai)
2. **Qwen3 Model** - Pull the model:
   ```bash
   ollama pull qwen3:14b
   ```
3. **Node.js 18+** and **pnpm**
4. **PostgreSQL** database (Neon recommended)

### Local Development

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd ai-sdk-starter
   pnpm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```

   Configure the following in `.env.local`:

   ```bash
   # Authentication
   AUTH_SECRET=<generate-with-openssl-rand-base64-32>
   BETTER_AUTH_URL=http://localhost:3000

   # Database
   DATABASE_URL=postgresql://user:pass@host:5432/db

   # Email (for magic links)
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   EMAIL_FROM=your-email@gmail.com

   # AI Model
   OLLAMA_BASE_URL=http://localhost:11434/v1

   # Storage
   BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
   ```

3. **Run database migrations**:
   ```bash
   pnpm db:migrate
   ```

4. **Start Ollama** (in a separate terminal):
   ```bash
   ollama serve
   ```

5. **Start the development server**:
   ```bash
   pnpm dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

### Network Access (Optional)

To access the chatbot from other devices on your network (e.g., mobile):

1. Find your machine's IP address:
   ```bash
   # Linux/Mac
   ip addr show | grep "inet 10."
   # Or
   ifconfig | grep "inet 10."
   ```

2. Update `BETTER_AUTH_URL` in `.env.local`:
   ```bash
   BETTER_AUTH_URL=http://10.0.1.XXX:3000
   ```

3. Restart the dev server and access from any device on your network

## Configuration

### Email Setup for Magic Links

For Gmail, you'll need an **App Password**:

1. Enable 2-factor authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password for "Mail"
4. Use this password as `SMTP_PASSWORD` in your `.env.local`

### Ollama Configuration

The default configuration uses Qwen3 14B. To use a different model:

1. Pull the model: `ollama pull <model-name>`
2. Update `lib/ai/providers.ts`:
   ```typescript
   "chat-model": ollama("your-model-name")
   ```

### Database Configuration

This project uses Neon Postgres with Drizzle ORM. Available commands:

```bash
pnpm db:generate    # Generate migrations from schema changes
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Drizzle Studio GUI
pnpm db:push        # Push schema changes directly (development only)
```

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Import your repository at [vercel.com](https://vercel.com)
   - Configure environment variables
   - Deploy

3. **Important for Vercel**: Set `OLLAMA_BASE_URL` to a public Ollama instance or use a different AI provider like OpenAI

### Docker

Build and run with Docker:

```bash
# Build
docker build -t ai-chatbot .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e OLLAMA_BASE_URL="http://host.docker.internal:11434/v1" \
  ai-chatbot
```

### Kubernetes

The project is configured for Kubernetes deployment with:
- Standalone Next.js output mode
- Configurable OTEL collector integration
- Health check endpoints at `/api/health`

Set `OTEL_EXPORTER_OTLP_ENDPOINT` to enable telemetry in K8s.

## Observability

### Structured Logging

Logs are output as:
- **JSON** in production (for log aggregation)
- **Colorized text** in development (for readability)

Configure log level via `LOG_LEVEL` environment variable:
```bash
LOG_LEVEL=DEBUG  # DEBUG, INFO, WARN, ERROR
```

### OpenTelemetry Tracing

Distributed tracing is enabled in production and when `OTEL_EXPORTER_OTLP_ENDPOINT` is set.

Instrumented modules:
- Better Auth (authentication flows)
- Email transport (magic link delivery)
- Chat API (AI streaming)

### Health Checks

- **GET /api/health** - Basic health check with uptime
- **GET /api/test-auth** - Authentication diagnostic endpoint

## Project Structure

```
├── app/
│   ├── (auth)/          # Authentication pages and API
│   ├── (chat)/          # Chat interface and pages
│   └── api/             # API routes (health, diagnostics)
├── components/          # React components
├── lib/
│   ├── ai/             # AI SDK configuration and tools
│   ├── db/             # Database schema and migrations
│   ├── auth.ts         # Better Auth configuration
│   └── logger.ts       # Structured logging
└── public/             # Static assets
```

## Development Guidelines

### Code Quality

```bash
pnpm lint      # Check code quality with ultracite
pnpm format    # Auto-fix code style issues
pnpm build     # Type check and build
```

### Testing

```bash
pnpm test      # Run Playwright tests
```

### Database Development

```bash
# Make schema changes in lib/db/schema.ts, then:
pnpm db:generate  # Generate migration
pnpm db:migrate   # Apply migration
```

## Environment Variables Reference

See [.env.example](.env.example) for a complete list of environment variables with descriptions.

**Required**:
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - Secret for session encryption
- `BETTER_AUTH_URL` - Base URL for Better Auth
- Email configuration (5 variables)

**Optional**:
- `OLLAMA_BASE_URL` - Ollama API endpoint (default: http://localhost:11434/v1)
- `LOG_LEVEL` - Logging verbosity (default: DEBUG in dev, INFO in prod)
- `OTEL_SERVICE_NAME` - Service name for telemetry
- `OTEL_EXPORTER_OTLP_ENDPOINT` - OTEL collector endpoint

## Switching AI Providers

While this template uses Ollama for local inference, you can easily switch to cloud providers:

### OpenAI

```typescript
// lib/ai/providers.ts
import { openai } from '@ai-sdk/openai';

customProvider({
  languageModels: {
    "chat-model": openai("gpt-4"),
  }
})
```

### Anthropic

```typescript
import { anthropic } from '@ai-sdk/anthropic';

customProvider({
  languageModels: {
    "chat-model": anthropic("claude-3-5-sonnet-20241022"),
  }
})
```

See the [AI SDK Providers documentation](https://ai-sdk.dev/providers/ai-sdk-providers) for more options.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
