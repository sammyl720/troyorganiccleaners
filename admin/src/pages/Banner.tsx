import { useEffect, useState } from "react";
import { client } from "../lib/supabase";
import {
  bannerSchema,
  safeUrl,
  validationMessage,
  type Banner as Values,
} from "../lib/validation";
import { Status, useAction } from "../components/ui";
export default function Banner() {
  const [v, set] = useState<Values>({
      enabled: false,
      message: "",
      style: "info",
      link_text: "",
      link_url: "",
    }),
    [loaded, ready] = useState(false);
  const a = useAction();
  useEffect(() => {
    void a.run(async () => {
      const { data, error } = await client()
        .from("banner")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      if (data)
        set({
          ...data,
          message: data.message ?? "",
          link_text: data.link_text ?? "",
          link_url: data.link_url ?? "",
        });
      ready(true);
    }, "");
  }, []);
  return (
    <>
      <h1>Announcement banner</h1>
      <Status {...a} />
      {loaded && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const r = bannerSchema.safeParse(v);
            if (!r.success) {
              a.setError(validationMessage(r.error));
              return;
            }
            void a.run(async () => {
              const { data, error } = await client()
                .from("banner")
                .upsert({
                  ...r.data,
                  id: 1,
                  link_text: r.data.link_text || null,
                  link_url: r.data.link_url || null,
                })
                .select()
                .single();
              if (error || !data) throw error ?? new Error("No row saved");
            });
          }}
        >
          <fieldset disabled={a.busy}>
            <label className="check">
              <input
                type="checkbox"
                checked={v.enabled}
                onChange={(e) => set({ ...v, enabled: e.target.checked })}
              />
              Enabled
            </label>
            <label>
              Message
              <textarea
                maxLength={250}
                required={v.enabled}
                value={v.message}
                onChange={(e) => set({ ...v, message: e.target.value })}
              />
            </label>
            <small>{v.message.length}/250 characters · plain text only</small>
            <label>
              Style
              <select
                value={v.style}
                onChange={(e) =>
                  set({ ...v, style: e.target.value as Values["style"] })
                }
              >
                {["info", "success", "warning", "promotion"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Optional link text
              <input
                maxLength={50}
                value={v.link_text}
                onChange={(e) => set({ ...v, link_text: e.target.value })}
              />
            </label>
            <label>
              Optional URL
              <input
                type="url"
                placeholder="https://…"
                value={v.link_url}
                onChange={(e) => set({ ...v, link_url: e.target.value })}
              />
            </label>
            <h2>Live preview {v.enabled ? "" : "(disabled)"}</h2>
            <div className={`banner-preview ${v.style}`}>
              {v.message || "Your announcement will appear here."}{" "}
              {v.link_text && safeUrl(v.link_url) && (
                <a href={v.link_url} target="_blank" rel="noopener noreferrer">
                  {v.link_text}
                </a>
              )}
            </div>
            <button>{a.busy ? "Saving…" : "Save Banner"}</button>
          </fieldset>
        </form>
      )}
    </>
  );
}
