const fs = require("node:fs");
const path = require("node:path");
const out = path.resolve("dist");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const entry of ["index.html", "css", "imgs", "js", "content"])
  fs.cpSync(entry, path.join(out, entry), { recursive: true });
fs.cpSync("admin/dist", path.join(out, "admin"), { recursive: true });
// Production config is public; only explicit publishable keys are accepted.
const url = process.env.VITE_SUPABASE_URL,
  key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (url || key) {
  if (!url || !/^https:\/\//.test(url) || !key?.startsWith("sb_publishable_"))
    throw new Error("Provide an HTTPS Supabase URL and publishable key.");
  fs.writeFileSync(
    path.join(out, "js/config.js"),
    `window.TROY_CONFIG = ${JSON.stringify({ supabaseUrl: url, supabasePublishableKey: key })};\n`,
  );
}
fs.writeFileSync(
  path.join(out, "_redirects"),
  "/admin/* /admin/index.html 200\n",
);
