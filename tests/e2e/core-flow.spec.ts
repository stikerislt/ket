import { expect, test } from "@playwright/test";

test("practice mode flow", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Pradeti praktika" }).click();
  await expect(page.getByRole("heading", { name: "Praktikos rezimas" })).toBeVisible();
});

test("exam mode entry", async ({ page }) => {
  await page.goto("/exam");
  await expect(page.getByRole("heading", { name: "Egzamino simuliacija" })).toBeVisible();
});

test("topic list and topic page", async ({ page }) => {
  await page.goto("/topic");
  await expect(page.getByRole("heading", { name: "Teminis mokymas" })).toBeVisible();
  await page.getByRole("link", { name: "Mobile usage" }).click();
  await expect(page.getByRole("heading", { name: /Tema: Mobile usage/ })).toBeVisible();
});

test("keyboard navigation baseline", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  expect(focused).toBeTruthy();
});
