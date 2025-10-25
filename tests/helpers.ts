import fs from "node:fs";
import path from "node:path";
import {
  type APIRequestContext,
  type Browser,
  type BrowserContext,
  expect,
  type Page,
} from "@playwright/test";
import { getUnixTime } from "date-fns";
import { ChatPage } from "./pages/chat";

export type UserContext = {
  context: BrowserContext;
  page: Page;
  request: APIRequestContext;
  email: string;
};

/**
 * Creates an authenticated browser context for testing.
 *
 * Uses a test-only API endpoint (/api/test-auth) that bypasses magic link verification
 * This endpoint is only available when PLAYWRIGHT=True environment variable is set
 */
export async function createAuthenticatedContext({
  browser,
  name,
}: {
  browser: Browser;
  name: string;
}): Promise<UserContext> {
  const directory = path.join(__dirname, "../playwright/.sessions");

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  const storageFile = path.join(directory, `${name}.json`);

  const context = await browser.newContext();
  const page = await context.newPage();

  const email = `test-${name}@playwright.com`;

  // Use test auth endpoint to create user and session without magic link
  const authResponse = await page.request.post(
    "http://localhost:3000/api/test-auth",
    {
      data: { email },
    }
  );

  if (!authResponse.ok()) {
    throw new Error(
      `Failed to create test auth session: ${await authResponse.text()}`
    );
  }

  // Navigate to home page to ensure session is active
  await page.goto("http://localhost:3000/");

  // Verify we're authenticated by checking for user UI elements
  const chatPage = new ChatPage(page);
  await chatPage.createNewChat();
  await chatPage.chooseModelFromSelector("chat-model-reasoning");
  await expect(chatPage.getSelectedModel()).resolves.toEqual("Reasoning model");

  await page.waitForTimeout(1000);
  await context.storageState({ path: storageFile });
  await page.close();

  const newContext = await browser.newContext({ storageState: storageFile });
  const newPage = await newContext.newPage();

  return {
    context: newContext,
    page: newPage,
    request: newContext.request,
    email,
  };
}

export function generateRandomTestUser() {
  const email = `test-${getUnixTime(new Date())}@playwright.com`;

  return {
    email,
  };
}
