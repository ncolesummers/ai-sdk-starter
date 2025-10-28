import "server-only";

import { ChatSDKError } from "./errors";
import { createLogger } from "./logger";

const logger = createLogger("admin");

/**
 * Get list of admin emails from environment variable
 * ADMIN_EMAILS should be a comma-separated list of email addresses
 */
function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS;

  if (!adminEmailsEnv) {
    logger.warn(
      "ADMIN_EMAILS environment variable is not set. No admins configured."
    );
    return [];
  }

  // Split by comma, trim whitespace, and filter empty strings
  return adminEmailsEnv
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

/**
 * Check if an email address belongs to an admin user
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  const adminEmails = getAdminEmails();
  const normalizedEmail = email.trim().toLowerCase();

  const isAdminUser = adminEmails.includes(normalizedEmail);

  logger.debug("Admin check", {
    email: normalizedEmail,
    isAdmin: isAdminUser,
  });

  return isAdminUser;
}

/**
 * Require that the user is an admin, throwing an error if not
 * Use this in API routes to enforce admin-only access
 */
export function requireAdmin(email: string | null | undefined): void {
  if (!isAdmin(email)) {
    logger.warn("Unauthorized admin access attempt", { email });
    throw new ChatSDKError("unauthorized:admin", "Admin access required");
  }
}

/**
 * Get the list of configured admin emails (for debugging/display)
 * Note: Only returns the list if requested by an admin
 */
export function getAdminList(requestorEmail: string): string[] {
  requireAdmin(requestorEmail);
  return getAdminEmails();
}
