import { z } from "zod";
const slug = z
  .string()
  .trim()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and hyphens.",
  );
export const serviceSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    slug,
    description: z.string().trim().max(1000).nullable(),
    category_id: z.number().int().positive().nullable(),
    price_type: z.enum(["fixed", "starting_at", "per_pound", "quote"]),
    price: z.number().min(0).max(99999999.99).nullable(),
    display_order: z.number().int().min(-2147483648).max(2147483647),
    active: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.price_type !== "quote" && v.price === null)
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "Enter a price.",
      });
    if (v.price_type === "quote" && v.price !== null)
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "Quote services cannot have a price.",
      });
    if (
      v.price !== null &&
      Math.abs(v.price * 100 - Math.round(v.price * 100)) > 0.00001
    )
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "Use at most two decimal places.",
      });
  });
export const categorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug,
  display_order: z.number().int().min(-2147483648).max(2147483647),
  active: z.boolean(),
});
export function safeUrl(value: string) {
  try {
    const u = new URL(value);
    return (
      /^https?:$/.test(u.protocol) &&
      !u.username &&
      !u.password &&
      !/[\s<>\\]/.test(value)
    );
  } catch {
    return false;
  }
}
export const bannerSchema = z
  .object({
    enabled: z.boolean(),
    message: z
      .string()
      .trim()
      .max(250)
      .refine((v) => !/[<>]/.test(v), "Use plain text, without HTML."),
    style: z.enum(["info", "success", "warning", "promotion"]),
    link_text: z
      .string()
      .trim()
      .max(50)
      .refine((v) => !/[<>]/.test(v), "Use plain text."),
    link_url: z.string().trim().max(2048),
  })
  .superRefine((v, c) => {
    if (v.enabled && !v.message)
      c.addIssue({
        code: "custom",
        path: ["message"],
        message: "An enabled banner needs a message.",
      });
    if (Boolean(v.link_text) !== Boolean(v.link_url))
      c.addIssue({
        code: "custom",
        path: ["link_url"],
        message: "Enter both link text and URL, or leave both blank.",
      });
    if (v.link_url && !safeUrl(v.link_url))
      c.addIssue({
        code: "custom",
        path: ["link_url"],
        message: "Use a complete HTTP or HTTPS URL without credentials.",
      });
  });
export type Service = z.infer<typeof serviceSchema> & { id: number };
export type Category = z.infer<typeof categorySchema> & { id: number };
export type Banner = z.infer<typeof bannerSchema>;
export type Hours = {
  id?: number;
  day_of_week: number;
  day_name: string;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  display_order: number;
};
export const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/);
export const hoursSchema = z
  .array(
    z
      .object({
        id: z.number().optional(),
        day_of_week: z.number().int().min(0).max(6),
        day_name: z.string(),
        is_open: z.boolean(),
        open_time: time.nullable(),
        close_time: time.nullable(),
        display_order: z.number().int().min(-32768).max(32767),
      })
      .superRefine((v, c) => {
        if (v.day_name !== dayNames[v.day_of_week])
          c.addIssue({ code: "custom", message: "Invalid day name." });
        if (
          v.is_open
            ? !v.open_time || !v.close_time || v.close_time <= v.open_time
            : v.open_time !== null || v.close_time !== null
        )
          c.addIssue({
            code: "custom",
            message: `Check opening and closing times for ${v.day_name}.`,
          });
      }),
  )
  .length(7)
  .refine(
    (v) => new Set(v.map((d) => d.day_of_week)).size === 7,
    "All seven days are required.",
  );
export function validationMessage(error: z.ZodError) {
  return error.issues.map((i) => i.message).join(" ");
}
export function priceLabel(s: Pick<Service, "price" | "price_type">) {
  if (s.price_type === "quote") return "Call for quote";
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(s.price ?? 0);
  return s.price_type === "starting_at"
    ? `Starting at ${amount}`
    : s.price_type === "per_pound"
      ? `${amount} / lb`
      : amount;
}
