import { describe, it, expect } from "vitest";
import {
  serviceSchema,
  bannerSchema,
  hoursSchema,
  dayNames,
  safeUrl,
} from "./validation";
describe("CMS integrity", () => {
  const service = {
    name: "Dress",
    slug: "dress",
    description: "",
    category_id: null,
    price_type: "fixed",
    price: 14,
    display_order: 0,
    active: true,
  };
  it("requires nonnegative actual prices and rejects fractional cents", () => {
    for (const price of [null, -1, 1.001])
      expect(serviceSchema.safeParse({ ...service, price }).success).toBe(
        false,
      );
    expect(serviceSchema.safeParse(service).success).toBe(true);
  });
  it("quotes cannot carry a price", () => {
    expect(
      serviceSchema.safeParse({ ...service, price_type: "quote" }).success,
    ).toBe(false);
    expect(
      serviceSchema.safeParse({ ...service, price_type: "quote", price: null })
        .success,
    ).toBe(true);
  });
  it("rejects unsafe links", () => {
    for (const url of [
      "javascript:alert(1)",
      "data:text/html,x",
      "//evil.test",
      "https://user:pass@example.com",
      "https://example.com\\@evil.test",
      "https://example.com/ x",
    ])
      expect(safeUrl(url)).toBe(false);
    expect(safeUrl("https://example.com/?a=1")).toBe(true);
  });
  it("validates banner text, links, and limits", () => {
    const banner = {
      enabled: true,
      message: "Closing early",
      style: "info",
      link_text: "",
      link_url: "",
    };
    expect(bannerSchema.safeParse(banner).success).toBe(true);
    for (const patch of [
      { message: "" },
      { message: "<b>hello</b>" },
      { message: "x".repeat(251) },
      { link_text: "Click" },
      { link_text: "Click", link_url: "javascript:alert(1)" },
    ])
      expect(bannerSchema.safeParse({ ...banner, ...patch }).success).toBe(
        false,
      );
  });
  it("requires a full week and valid opening intervals", () => {
    const week = dayNames.map((name, i) => ({
      day_of_week: i,
      day_name: name,
      is_open: true,
      open_time: "08:00",
      close_time: "19:00",
      display_order: i,
    }));
    expect(hoursSchema.safeParse(week).success).toBe(true);
    expect(hoursSchema.safeParse(week.slice(1)).success).toBe(false);
    expect(
      hoursSchema.safeParse(week.map((d) => ({ ...d, close_time: "07:00" })))
        .success,
    ).toBe(false);
    expect(
      hoursSchema.safeParse(
        week.map((d) => ({
          ...d,
          is_open: false,
          open_time: null,
          close_time: null,
        })),
      ).success,
    ).toBe(true);
  });
});
