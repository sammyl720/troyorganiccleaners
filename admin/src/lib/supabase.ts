import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const configured = Boolean(
  url && /^https?:\/\//.test(url) && key?.startsWith("sb_publishable_"),
);
export const supabase = configured ? createClient(url, key) : null;
export function client() {
  if (!supabase) throw new Error("CMS configuration is missing.");
  return supabase;
}
