const { defineConfig } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "tests/browser",
  use: { baseURL: "http://127.0.0.1:5178", headless: true, channel: "chrome" },
  webServer: {
    command:
      "VITE_SUPABASE_URL=https://cms-test.supabase.co VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_browser_test npm run dev --prefix admin -- --port 5178",
    url: "http://127.0.0.1:5178/admin/",
    reuseExistingServer: false,
  },
});
