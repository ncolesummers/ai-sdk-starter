import { trace } from "@opentelemetry/api";
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logger";

const tracer = trace.getTracer("better-auth-api", "1.0.0");
const logger = createLogger("better-auth:api");

logger.info("Initializing Better Auth API handlers...");

// Initialize handlers (this will throw if auth module failed)
const handlers = toNextJsHandler(auth);
logger.info("Better Auth handlers created successfully");

// Wrap GET handler with instrumentation
export const GET = async (req: Request, ctx: any) => {
  // Next.js 15+ requires awaiting params
  const params = await ctx.params;
  const route = params?.all?.join("/") || "unknown";

  return tracer.startActiveSpan(
    "auth.api.GET",
    { attributes: { "http.route": route } },
    async (span) => {
      try {
        logger.debug("Processing GET request", { path: params?.all, route });
        const response = await handlers.GET(req);
        span.setStatus({ code: 1 }); // OK
        return response;
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: 2, message: (error as Error).message });
        logger.error("GET request failed", { error: (error as Error).message });
        throw error;
      } finally {
        span.end();
      }
    }
  );
};

// Wrap POST handler with instrumentation
export const POST = async (req: Request, ctx: any) => {
  // Next.js 15+ requires awaiting params
  const params = await ctx.params;
  const route = params?.all?.join("/") || "unknown";

  return tracer.startActiveSpan(
    "auth.api.POST",
    { attributes: { "http.route": route } },
    async (span) => {
      try {
        logger.debug("Processing POST request", { path: params?.all, route });
        const response = await handlers.POST(req);

        // Log response status to help debug 404s
        logger.info("POST request completed", {
          status: response.status,
          route,
        });

        span.setAttributes({
          "http.status_code": response.status,
          "http.route": route,
        });
        span.setStatus({ code: response.status < 400 ? 1 : 2 }); // OK if < 400

        return response;
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: 2, message: (error as Error).message });
        logger.error("POST request failed", {
          error: (error as Error).message,
        });
        throw error;
      } finally {
        span.end();
      }
    }
  );
};
