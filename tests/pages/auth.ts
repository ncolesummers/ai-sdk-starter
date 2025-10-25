import type { Page } from "@playwright/test";
import { expect } from "../fixtures";

export class AuthPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoLogin() {
    await this.page.goto("/login");
    await expect(this.page.getByRole("heading")).toContainText("Sign In");
  }

  async gotoRegister() {
    await this.page.goto("/register");
    await expect(this.page.getByRole("heading")).toContainText("Sign Up");
  }

  /**
   * Request a magic link to register (no password needed)
   */
  async register(email: string) {
    await this.gotoRegister();
    await this.page.getByPlaceholder("user@acme.com").click();
    await this.page.getByPlaceholder("user@acme.com").fill(email);
    await this.page.getByRole("button", { name: "Send Magic Link" }).click();
  }

  /**
   * Request a magic link to login (no password needed)
   */
  async login(email: string) {
    await this.gotoLogin();
    await this.page.getByPlaceholder("user@acme.com").click();
    await this.page.getByPlaceholder("user@acme.com").fill(email);
    await this.page.getByRole("button", { name: "Send Magic Link" }).click();
  }

  /**
   * Logout using the test auth helper to create session, then sign out
   */
  async logout(email: string) {
    // Use test auth to create session
    await this.page.request.post("http://localhost:3000/api/test-auth", {
      data: { email },
    });

    await this.page.goto("/");
    await this.page.waitForURL("/");

    await this.openSidebar();

    const userNavButton = this.page.getByTestId("user-nav-button");
    await expect(userNavButton).toBeVisible();

    await userNavButton.click();
    const userNavMenu = this.page.getByTestId("user-nav-menu");
    await expect(userNavMenu).toBeVisible();

    const authMenuItem = this.page.getByTestId("user-nav-item-auth");
    await expect(authMenuItem).toContainText("Sign out");

    await authMenuItem.click();

    // After sign out, user should be redirected to login
    await this.page.waitForURL("/login");
    await expect(this.page).toHaveURL("/login");
  }

  async expectToastToContain(text: string) {
    await expect(this.page.getByTestId("toast")).toContainText(text);
  }

  async openSidebar() {
    const sidebarToggleButton = this.page.getByTestId("sidebar-toggle-button");
    await sidebarToggleButton.click();
  }
}
