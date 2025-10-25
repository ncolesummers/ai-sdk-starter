import { expect, test } from "../fixtures";
import { generateRandomTestUser } from "../helpers";
import { AuthPage } from "../pages/auth";

test.describe
  .serial("Login and Registration", () => {
    let authPage: AuthPage;

    const testUser = generateRandomTestUser();

    test.beforeEach(({ page }) => {
      authPage = new AuthPage(page);
    });

    test("Register new account - sends magic link", async () => {
      await authPage.register(testUser.email);
      await authPage.expectToastToContain("Check your email for a magic link");
    });

    test("Register existing account - still sends magic link", async () => {
      await authPage.register(testUser.email);
      await authPage.expectToastToContain("Check your email for a magic link");
    });

    test("Log into account that exists", async ({ page }) => {
      // Use test auth helper to create authenticated session
      await page.request.post("http://localhost:3000/api/test-auth", {
        data: { email: testUser.email },
      });

      await page.goto("/");
      await page.waitForURL("/");
      await expect(page.getByPlaceholder("Send a message...")).toBeVisible();
    });

    test("Display user email in user menu", async ({ page }) => {
      // Use test auth helper to create authenticated session
      await page.request.post("http://localhost:3000/api/test-auth", {
        data: { email: testUser.email },
      });

      await page.goto("/");
      await page.waitForURL("/");
      await expect(page.getByPlaceholder("Send a message...")).toBeVisible();

      const sidebarToggleButton = page.getByTestId("sidebar-toggle-button");
      await sidebarToggleButton.click();

      const userEmail = await page.getByTestId("user-email");
      await expect(userEmail).toHaveText(testUser.email);
    });

    test("Log out user", async () => {
      await authPage.logout(testUser.email);
    });

    test("Log out is available for authenticated users", async ({ page }) => {
      // Use test auth helper to create authenticated session
      await page.request.post("http://localhost:3000/api/test-auth", {
        data: { email: testUser.email },
      });

      await page.goto("/");
      await page.waitForURL("/");

      const sidebarToggleButton = page.getByTestId("sidebar-toggle-button");
      await sidebarToggleButton.click();

      const userNavButton = page.getByTestId("user-nav-button");
      await expect(userNavButton).toBeVisible();

      await userNavButton.click();
      const userNavMenu = page.getByTestId("user-nav-menu");
      await expect(userNavMenu).toBeVisible();

      const authMenuItem = page.getByTestId("user-nav-item-auth");
      await expect(authMenuItem).toContainText("Sign out");
    });

    test("Do not navigate to /register for authenticated users", async ({
      page,
    }) => {
      // Use test auth helper to create authenticated session
      await page.request.post("http://localhost:3000/api/test-auth", {
        data: { email: testUser.email },
      });

      await page.goto("/");
      await page.waitForURL("/");

      await page.goto("/register");
      await expect(page).toHaveURL("/");
    });

    test("Do not navigate to /login for authenticated users", async ({
      page,
    }) => {
      // Use test auth helper to create authenticated session
      await page.request.post("http://localhost:3000/api/test-auth", {
        data: { email: testUser.email },
      });

      await page.goto("/");
      await page.waitForURL("/");

      await page.goto("/login");
      await expect(page).toHaveURL("/");
    });
  });
