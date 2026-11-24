const { expect } = require("@playwright/test");

class StaffSchedulePage {
  constructor(page, env) {
    this.page = page;
    this.env = env;
  }

  getBaseUrlCandidates() {
    return Array.from(
      new Set([
        this.env.feBaseUrl,
        this.env.feBaseUrl.includes("localhost")
          ? this.env.feBaseUrl.replace("localhost", "127.0.0.1")
          : this.env.feBaseUrl,
        this.env.feBaseUrl.includes("127.0.0.1")
          ? this.env.feBaseUrl.replace("127.0.0.1", "localhost")
          : this.env.feBaseUrl,
      ]),
    );
  }

  async bootstrapSession() {
    const hostnames = Array.from(
      new Set(this.getBaseUrlCandidates().map((baseUrl) => new URL(baseUrl).hostname)),
    );

    await this.page.context().addCookies([
      ...hostnames.map((hostname) => ({
        name: "token",
        value: this.env.token,
        domain: hostname,
        path: "/",
      })),
    ]);

    await this.page.addInitScript((token) => {
      window.localStorage.setItem("token", token);
    }, this.env.token);
  }

  async resolveReachableBaseUrl() {
    for (const baseUrl of this.getBaseUrlCandidates()) {
      try {
        const response = await this.page.request.get(`${baseUrl}/staff_schedule`, {
          failOnStatusCode: false,
          timeout: 5000,
        });

        if (response) {
          return baseUrl;
        }
      } catch (error) {
        // Try the next local candidate.
      }
    }

    return null;
  }

  async goto() {
    const resolvedBaseUrl = await this.resolveReachableBaseUrl();
    const candidates = resolvedBaseUrl
      ? [resolvedBaseUrl, ...this.getBaseUrlCandidates().filter((item) => item !== resolvedBaseUrl)]
      : this.getBaseUrlCandidates();

    let lastError = null;

    for (const baseUrl of candidates) {
      try {
        await this.page.goto(`${baseUrl}/staff_schedule`, {
          waitUntil: "domcontentloaded",
        });
        await this.page.locator("#__next").first().waitFor({
          state: "attached",
          timeout: 5000,
        });
        this.env.feBaseUrl = baseUrl;
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("Unable to open local staff_schedule page");
  }

  async expectLoaded() {
    await expect(
      this.page.getByRole("heading", { name: "График работы (новейший)" }),
    ).toBeVisible();
    await expect(this.page.getByRole("button", { name: /Обновить/ })).toBeVisible();
    await expect(this.page.getByRole("button", { name: /Журнал здоровья/ })).toBeVisible();
    await expect(this.page.getByRole("button", { name: "Новая смена" })).toBeVisible();
  }

  async reloadAndWaitForGraph() {
    const responsePromise = this.page.waitForResponse((response) => {
      if (!response.url().includes("/staff_schedule/get_graph")) {
        return false;
      }

      const hostname = new URL(response.url()).hostname;
      return hostname === "127.0.0.1" || hostname === "localhost";
    });

    await this.page.getByRole("button", { name: /Обновить/ }).click();
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
  }
}

module.exports = {
  StaffSchedulePage,
};
