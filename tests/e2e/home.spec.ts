import { test, expect } from "@playwright/test";

test.describe("homepage", () => {
  test("loads and shows navigation", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { name: /high-voltage trance/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /events/i })).toBeVisible();
  });

  test("switches locale", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: "DE" }).click();
    await expect(page).toHaveURL(/\/de\//);
  });
});
