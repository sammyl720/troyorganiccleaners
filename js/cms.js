/* The marketing website remains static. CMS failures leave its HTML intact. */
(() => {
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const safeUrl = (value) => {
    try {
      const url = new URL(value);
      return (
        /^https?:$/.test(url.protocol) &&
        !url.username &&
        !url.password &&
        !/[\s<>\\]/.test(value)
      );
    } catch {
      return false;
    }
  };
  const timeLabel = (value) => {
    if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value))
      throw new Error("Invalid time");
    const [hour, minute] = value.split(":").map(Number);
    return `${hour % 12 || 12}${minute ? `:${String(minute).padStart(2, "0")}` : ""}${hour < 12 ? "am" : "pm"}`;
  };
  const priceLabel = (service) => {
    if (service.price_type === "quote") return "Call for quote";
    if (
      service.price === null ||
      !Number.isFinite(Number(service.price)) ||
      Number(service.price) < 0
    )
      throw new Error("Invalid price");
    const price = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(service.price);
    return service.price_type === "starting_at"
      ? `Starting at ${price}`
      : service.price_type === "per_pound"
        ? `${price} / lb`
        : price;
  };
  async function loadBusinessHours(client) {
    const { data, error } = await client
      .from("business_hours")
      .select("*")
      .order("display_order");
    if (error) throw error;
    if (
      !data ||
      data.length !== 7 ||
      new Set(data.map((d) => d.day_of_week)).size !== 7
    )
      return;
    const fragment = document.createDocumentFragment();
    for (const day of data) {
      const row = element(
        "div",
        undefined,
        `dayofweek${day.is_open ? "" : " dayofweek-closed"}`,
      );
      row.append(
        element("span", day.day_name),
        element(
          "span",
          day.is_open
            ? `${timeLabel(day.open_time)} - ${timeLabel(day.close_time)}`
            : "Closed",
        ),
      );
      fragment.append(row);
    }
    document.getElementById("business-hours")?.replaceChildren(fragment);
    // Keep structured opening hours consistent with the visible CMS values.
    const schema = document.getElementById("schema-data");
    if (schema?.textContent) {
      try {
        const value = JSON.parse(schema.textContent);
        delete value.openingHours;
        value.openingHoursSpecification = data
          .filter((d) => d.is_open)
          .map((d) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: `https://schema.org/${d.day_name}`,
            opens: d.open_time.slice(0, 5),
            closes: d.close_time.slice(0, 5),
          }));
        schema.textContent = JSON.stringify(value);
      } catch (error) {
        console.warn("Unable to refresh structured hours", error);
      }
    }
  }
  async function loadServices(client) {
    const { data, error } = await client
      .from("services")
      .select(
        "id,name,slug,description,price,price_type,display_order,service_categories(name,slug,display_order)",
      )
      .eq("active", true)
      .order("display_order")
      .order("id");
    if (error) throw error;
    if (!data) return;
    const fragment = document.createDocumentFragment();
    const groups = new Map();
    for (const service of data) {
      const category = service.service_categories;
      const key = category?.slug || "";
      if (!groups.has(key))
        groups.set(key, {
          name: category?.name || "Other services",
          order: category?.display_order ?? 2147483647,
          services: [],
        });
      groups.get(key).services.push(service);
    }
    for (const group of [...groups.values()].sort(
      (a, b) => a.order - b.order,
    )) {
      const section = element("section", undefined, "price-category");
      section.append(element("h3", group.name));
      const list = element("dl");
      for (const service of group.services) {
        const row = element("div", undefined, "price-row");
        const term = element("dt", service.name);
        if (service.description) term.append(element("p", service.description));
        row.append(term, element("dd", priceLabel(service)));
        list.append(row);
      }
      section.append(list);
      fragment.append(section);
    }
    const container = document.getElementById("service-prices");
    container?.replaceChildren(fragment);
    if (container) container.closest("#pricing").hidden = data.length === 0;
  }
  async function loadBanner(client) {
    const { data, error } = await client
      .from("banner")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw error;
    const container = document.getElementById("site-banner");
    if (!container) return;
    container.hidden = true;
    if (!data?.enabled || !data.message) return;
    container.replaceChildren(element("span", data.message));
    container.dataset.style = [
      "info",
      "success",
      "warning",
      "promotion",
    ].includes(data.style)
      ? data.style
      : "info";
    if (data.link_text && safeUrl(data.link_url)) {
      const link = element("a", data.link_text);
      link.href = data.link_url;
      container.append(link);
    }
    container.hidden = false;
  }
  async function loadCmsContent() {
    const config = window.TROY_CONFIG;
    if (
      !config?.supabaseUrl ||
      !config.supabasePublishableKey?.startsWith("sb_publishable_")
    )
      return;
    try {
      // Load the SDK only when configured; marketing content never waits on the CDN.
      const { createClient } =
        await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.99.2/+esm");
      const client = createClient(
        config.supabaseUrl,
        config.supabasePublishableKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        },
      );
      await window.troyContentReady;
      const results = await Promise.allSettled([
        loadBusinessHours(client),
        loadServices(client),
        loadBanner(client),
      ]);
      results.forEach((result) => {
        if (result.status === "rejected")
          console.warn(
            "Unable to refresh CMS content; using static fallback.",
            result.reason,
          );
      });
    } catch (error) {
      console.warn("Unable to load CMS; using static fallback.", error);
    }
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", loadCmsContent, {
      once: true,
    });
  else void loadCmsContent();
})();
