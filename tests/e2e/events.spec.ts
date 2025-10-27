import { test, expect } from "@playwright/test";

test("events page filters render", async ({ page }) => {
  await page.goto("/en/events");
  await expect(page.getByText(/upcoming/i)).toBeVisible();
  await expect(page.locator("button", { hasText: /calendar/i })).toBeVisible();
});
