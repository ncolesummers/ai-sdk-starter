import { context, trace } from "@opentelemetry/api";
import { isDevelopmentEnvironment } from "./constants";

/**
 * Log levels in order of severity
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

/**
 * Structured log entry
 */
type LogEntry = {
  timestamp: string;
  level: string;
  module: string;
  message: string;
  traceId?: string;
  spanId?: string;
  data?: unknown;
};

/**
 * Logger configuration
 */
type LoggerConfig = {
  minLevel: LogLevel;
  prettyPrint: boolean;
};

/**
 * Get current log level from environment or defaults
 */
function getLogLevel(): LogLevel {
  const level = process.env.LOG_LEVEL?.toUpperCase();
  switch (level) {
    case "DEBUG":
      return LogLevel.DEBUG;
    case "INFO":
      return LogLevel.INFO;
    case "WARN":
      return LogLevel.WARN;
    case "ERROR":
      return LogLevel.ERROR;
    default:
      // Debug in development, Info in production
      return isDevelopmentEnvironment ? LogLevel.DEBUG : LogLevel.INFO;
  }
}

/**
 * Logger configuration singleton
 */
const config: LoggerConfig = {
  minLevel: getLogLevel(),
  prettyPrint: isDevelopmentEnvironment,
};

/**
 * Get current trace context from OpenTelemetry
 */
function getTraceContext(): { traceId?: string; spanId?: string } {
  const span = trace.getSpan(context.active());
  if (!span) {
    return {};
  }

  const spanContext = span.spanContext();
  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
  };
}

/**
 * Format log entry for console output (development)
 */
function formatPretty(entry: LogEntry): string {
  const colors = {
    DEBUG: "\x1b[36m", // Cyan
    INFO: "\x1b[32m", // Green
    WARN: "\x1b[33m", // Yellow
    ERROR: "\x1b[31m", // Red
  };
  const reset = "\x1b[0m";

  const color = colors[entry.level as keyof typeof colors] || "";
  const time = new Date(entry.timestamp).toLocaleTimeString();
  const prefix = `${color}[${entry.level}]${reset} ${time} ${entry.module}`;

  let output = `${prefix} ${entry.message}`;

  if (entry.traceId) {
    output += ` ${"\x1b[90m"}(trace: ${entry.traceId.slice(0, 8)})${reset}`;
  }

  if (entry.data) {
    output += `\n  ${JSON.stringify(entry.data, null, 2)
      .split("\n")
      .join("\n  ")}`;
  }

  return output;
}

/**
 * Format log entry as JSON (production)
 */
function formatJSON(entry: LogEntry): string {
  return JSON.stringify(entry);
}

/**
 * Logger class - provides structured logging with OTEL integration
 */
export class Logger {
  private readonly module: string;

  constructor(module: string) {
    this.module = module;
  }

  private log(
    level: LogLevel,
    levelName: string,
    message: string,
    data?: unknown
  ): void {
    // Skip if below minimum log level
    if (level < config.minLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: levelName,
      module: this.module,
      message,
      ...getTraceContext(),
    };

    if (data !== undefined) {
      entry.data = data;
    }

    const formatted = config.prettyPrint
      ? formatPretty(entry)
      : formatJSON(entry);

    // Output to appropriate console method
    switch (level) {
      case LogLevel.ERROR:
        console.error(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      default:
        console.log(formatted);
    }

    // Also add to active span if available (for OTEL log correlation)
    const span = trace.getSpan(context.active());
    if (span) {
      span.addEvent(message, {
        "log.level": levelName,
        "log.module": this.module,
        ...(data ? { "log.data": JSON.stringify(data) } : {}),
      });
    }
  }

  /**
   * Log debug message (verbose, only in development by default)
   */
  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, "DEBUG", message, data);
  }

  /**
   * Log info message (general information)
   */
  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, "INFO", message, data);
  }

  /**
   * Log warning message (potential issues)
   */
  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, "WARN", message, data);
  }

  /**
   * Log error message (failures, exceptions)
   */
  error(message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, "ERROR", message, data);
  }

  /**
   * Create a child logger with a sub-module name
   */
  child(subModule: string): Logger {
    return new Logger(`${this.module}:${subModule}`);
  }
}

/**
 * Factory function to create a logger for a specific module
 *
 * @example
 * const logger = createLogger('auth');
 * logger.info('User logged in', { userId: 123 });
 */
export function createLogger(module: string): Logger {
  return new Logger(module);
}

/**
 * Default logger instance for quick usage
 */
export const logger = createLogger("app");
