import { closeDatabase } from "./db/queries";
import { createLogger } from "./logger";

const logger = createLogger("shutdown");

let isShuttingDown = false;

/**
 * Graceful shutdown handler
 * Closes database connections and exits the process cleanly
 */
async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    logger.warn("Shutdown already in progress, ignoring signal", { signal });
    return;
  }

  isShuttingDown = true;
  logger.info("Received shutdown signal, cleaning up resources...", { signal });

  try {
    // Close database connections
    logger.info("Closing database connections...");
    await closeDatabase();
    logger.info("Database connections closed successfully");

    logger.info("Shutdown complete, exiting process");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown", { error });
    process.exit(1);
  }
}

/**
 * Register shutdown handlers for SIGTERM and SIGINT signals
 */
export function registerShutdownHandlers(): void {
  // Only register in Node.js runtime (not edge)
  if (typeof process === "undefined" || !process.on) {
    return;
  }

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  logger.info("Graceful shutdown handlers registered");
}
