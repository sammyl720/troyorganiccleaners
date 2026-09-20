const { test, expect } = require("@playwright/test");
const user = {
  id: "00000000-0000-0000-0000-000000000001",
  aud: "authenticated",
  role: "authenticated",
  email: "admin@example.test",
  app_metadata: { provider: "email" },
  user_metadata: {},
  created_at: "2026-01-01T00:00:00Z",
};
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
].map((name, i) => ({
  id: i + 1,
  day_of_week: i,
  day_name: name,
  is_open: i !== 6,
  open_time: i === 6 ? null : "08:00:00",
  close_time: i === 6 ? null : "19:00:00",
  display_order: i,
}));
async function backend(page, admin = true) {
  const state = {
    business_hours: structuredClone(days),
    services: [],
    service_categories: [
      {
        id: 1,
        name: "Laundry",
        slug: "laundry",
        display_order: 0,
        active: true,
      },
    ],
    banner: [
      {
        id: 1,
        enabled: false,
        message: null,
        style: "info",
        link_text: null,
        link_url: null,
      },
    ],
  };
  await page.route("https://cms-test.supabase.co/**", async (route) => {
    const req = route.request(),
      url = new URL(req.url());
    let body;
    if (url.pathname.endsWith("/token"))
      body = {
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
        expires_in: 3600,
        token_type: "bearer",
        user,
      };
    else if (url.pathname.endsWith("/user")) body = user;
    else if (url.pathname.endsWith("/logout")) {
      await route.fulfill({ status: 204 });
      return;
    } else {
      const table = url.pathname.split("/").pop();
      if (table === "admin_users") body = admin ? { user_id: user.id } : null;
      else {
        if (req.method() === "POST") {
          const data = req.postDataJSON();
          if (table === "business_hours") state[table] = data;
          else if (table === "banner") state[table] = [data];
          else state[table].push({ ...data, id: state[table].length + 1 });
          body = Array.isArray(data) ? state[table] : state[table].at(-1);
        } else if (req.method() === "PATCH") {
          const id = Number(url.searchParams.get("id").replace("eq.", ""));
          state[table] = state[table].map((v) =>
            v.id === id ? { ...v, ...req.postDataJSON() } : v,
          );
          body = state[table].find((v) => v.id === id);
        } else if (req.method() === "DELETE") {
          const id = Number(url.searchParams.get("id").replace("eq.", ""));
          body = state[table].find((v) => v.id === id);
          state[table] = state[table].filter((v) => v.id !== id);
        } else body = table === "banner" ? state[table][0] : state[table];
      }
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "content-range": `0-0/${state.services.filter((s) => s.active).length}`,
      },
      body: JSON.stringify(body),
    });
  });
  return state;
}
async function login(page) {
  await page.goto("/admin/hours");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel("Email", { exact: true }).fill("admin@example.test");
  await page.getByLabel("Password", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}
test("guards routes and denies authenticated non-admin users", async ({
  page,
}) => {
  await backend(page, false);
  await login(page);
  await expect(
    page.getByRole("heading", { name: "Access denied" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Hours", exact: true }),
  ).toHaveCount(0);
});
test("owner edits hours, prices, visibility, and banner then signs out", async ({
  page,
}) => {
  const state = await backend(page);
  await login(page);
  await expect(
    page.getByRole("heading", { name: "Website content" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Hours", exact: true }).click();
  await page.getByLabel("Monday closing").fill("18:00");
  await page.getByRole("button", { name: "Save Hours" }).click();
  await expect(page.getByRole("status")).toHaveText("Changes saved.");
  expect(state.business_hours[1].close_time).toBe("18:00");
  expect(state.business_hours[6].open_time).toBeNull();
  await page.getByRole("link", { name: "Services", exact: true }).click();
  await page.getByRole("button", { name: "+ Add Service" }).click();
  await page.getByLabel("Name", { exact: true }).fill("Wash & Fold");
  await page.getByLabel("Slug", { exact: true }).fill("wash-fold");
  await page.getByRole("combobox", { name: "Category", exact: true }).selectOption("1");
  await page.getByRole("combobox", { name: "Pricing type", exact: true }).selectOption("per_pound");
  await page.getByLabel("Price ($)").fill("2.25");
  await page.getByRole("button", { name: "Save Service" }).click();
  await expect(
    page.getByRole("cell", { name: "$2.25 / lb", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Disable", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Enable", exact: true }),
  ).toBeVisible();
  expect(state.services[0].active).toBe(false);
  await page.getByRole("button", { name: "Edit", exact: true }).first().click();
  await page.getByLabel("Price ($)").fill("2.75");
  await page.getByRole("button", { name: "Save Service" }).click();
  await expect(
    page.getByRole("cell", { name: "$2.75 / lb", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Banner", exact: true }).click();
  await page.getByLabel("Enabled", { exact: true }).check();
  await page
    .getByLabel("Message", { exact: true })
    .fill("Closing at 3 PM Friday");
  await page.getByRole("button", { name: "Save Banner" }).click();
  await expect(page.getByRole("status")).toHaveText("Changes saved.");
  expect(state.banner[0].enabled).toBe(true);
  await page.getByLabel("Enabled", { exact: true }).uncheck();
  await page.getByRole("button", { name: "Save Banner" }).click();
  await expect(page.getByRole("status")).toHaveText("Changes saved.");
  expect(state.banner[0].enabled).toBe(false);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("button", { name: "Save Banner" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Sign Out" }).click();
  await expect(
    page.getByRole("heading", { name: "Admin Login" }),
  ).toBeVisible();
});
test("save failures retain user input and show an error", async ({ page }) => {
  await backend(page);
  await login(page);
  await page.getByRole("link", { name: "Hours", exact: true }).click();
  await page.getByLabel("Monday closing").fill("18:00");
  await page.route("**/rest/v1/business_hours*", async (route) => {
    if (route.request().method() === "POST")
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ message: "Permission denied" }),
      });
    else await route.fallback();
  });
  await page.getByRole("button", { name: "Save Hours" }).click();
  await expect(page.getByRole("alert")).toContainText("couldn't complete");
  await expect(page.getByLabel("Monday closing")).toHaveValue("18:00");
});
