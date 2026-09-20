const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { JSDOM } = require("jsdom");
const source = fs
  .readFileSync("js/cms.js", "utf8")
  .replace(
    /const\s+\{\s*createClient\s*\}\s*=\s*await import\([\s\S]*?\);/,
    "const createClient=window.createClient;",
  );
const week = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
].map((name, i) => ({
  day_of_week: i,
  day_name: name,
  is_open: i !== 6,
  open_time: "08:00:00",
  close_time: "19:00:00",
}));
async function run(responses, ready = Promise.resolve()) {
  const dom = new JSDOM(
    '<div id="business-hours">Static hours</div><div id="site-banner" hidden></div><section id="pricing" hidden><div id="service-prices"></div></section>',
    { runScripts: "outside-only", url: "https://troyorganiccleaners.com" },
  );
  const w = dom.window;
  w.console.warn = () => {};
  w.TROY_CONFIG = {
    supabaseUrl: "https://example.supabase.co",
    supabasePublishableKey: "sb_publishable_test",
  };
  w.troyContentReady = ready;
  w.createClient = () => ({
    from(table) {
      const result = responses[table] ?? { data: [], error: null };
      const q = {
        select() {
          return q;
        },
        order() {
          return q;
        },
        eq() {
          return q;
        },
        maybeSingle() {
          return q;
        },
        then(resolve, reject) {
          return Promise.resolve(result).then(resolve, reject);
        },
      };
      return q;
    },
  });
  w.eval(source);
  await new Promise((r) => setTimeout(r, 20));
  return dom;
}
test("outages preserve static hours while independent banner succeeds", async () => {
  const d = await run({
    business_hours: { error: new Error("Offline") },
    services: { error: new Error("Offline") },
    banner: {
      data: { enabled: true, message: "Closing early", style: "warning" },
    },
  });
  assert.equal(
    d.window.document.querySelector("#business-hours").textContent,
    "Static hours",
  );
  assert.equal(d.window.document.querySelector("#site-banner").hidden, false);
  d.window.close();
});
test("incomplete week preserves fallback", async () => {
  const d = await run({ business_hours: { data: week.slice(1) } });
  assert.equal(
    d.window.document.querySelector("#business-hours").textContent,
    "Static hours",
  );
  d.window.close();
});
test("renders prices and untrusted strings as text and rejects unsafe banner URLs", async () => {
  const d = await run({
    business_hours: { data: week },
    services: {
      data: [
        {
          name: "<img src=x onerror=alert(1)>",
          description: "<script>x</script>",
          price: 2.25,
          price_type: "per_pound",
          service_categories: {
            name: "Laundry",
            slug: "laundry",
            display_order: 0,
          },
        },
      ],
    },
    banner: {
      data: {
        enabled: true,
        message: "<img src=x>",
        link_text: "Click",
        link_url: "javascript:alert(1)",
      },
    },
  });
  const doc = d.window.document;
  assert.equal(doc.querySelectorAll("#business-hours .dayofweek").length, 7);
  assert.equal(
    doc.querySelectorAll("#business-hours .dayofweek-closed").length,
    1,
  );
  assert.match(
    doc.querySelector("#service-prices").textContent,
    /\$2.25 \/ lb/,
  );
  assert.equal(doc.querySelectorAll("img,script,#site-banner a").length, 0);
  assert.equal(doc.querySelector("#pricing").hidden, false);
  d.window.close();
});
test("empty services and disabled banner remain hidden", async () => {
  const d = await run({
    banner: { data: { enabled: false, message: "Private" } },
  });
  assert.equal(d.window.document.querySelector("#site-banner").hidden, true);
  assert.equal(d.window.document.querySelector("#pricing").hidden, true);
  d.window.close();
});
test("waits for legacy content render before replacing hours", async () => {
  let release;
  const ready = new Promise((r) => (release = r));
  const d = await run({ business_hours: { data: week } }, ready);
  const target = d.window.document.querySelector("#business-hours");
  assert.equal(target.textContent, "Static hours");
  target.textContent = "Legacy JSON hours";
  release();
  await new Promise((r) => setTimeout(r, 20));
  assert.match(target.textContent, /Sunday8am - 7pm/);
  d.window.close();
});
