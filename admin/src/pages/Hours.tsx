import { useEffect, useState } from "react";
import { client } from "../lib/supabase";
import {
  dayNames,
  hoursSchema,
  validationMessage,
  type Hours as Day,
} from "../lib/validation";
import { Status, useAction } from "../components/ui";
export default function Hours() {
  const [days, setDays] = useState<Day[]>([]),
    [loaded, setLoaded] = useState(false);
  const a = useAction();
  useEffect(() => {
    void a.run(async () => {
      const { data, error } = await client()
        .from("business_hours")
        .select("*")
        .order("display_order");
      if (error) throw error;
      setDays(
        dayNames.map(
          (name, i) =>
            data.find((d) => d.day_of_week === i) ?? {
              day_of_week: i,
              day_name: name,
              is_open: false,
              open_time: null,
              close_time: null,
              display_order: i,
            },
        ),
      );
      setLoaded(true);
    }, "");
  }, []);
  function change(index: number, patch: Partial<Day>) {
    setDays((d) => d.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }
  return (
    <>
      <h1>Business hours</h1>
      <p>
        Update the weekly schedule. Changes appear when visitors refresh the
        website.
      </p>
      <Status {...a} />
      {loaded && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const result = hoursSchema.safeParse(days);
            if (!result.success) {
              a.setError(validationMessage(result.error));
              return;
            }
            void a.run(async () => {
              const rows = result.data.map(({ id, ...v }) => v);
              const { data, error } = await client()
                .from("business_hours")
                .upsert(rows, { onConflict: "day_of_week" })
                .select();
              if (error || data?.length !== 7)
                throw error ?? new Error("Incomplete save");
            });
          }}
        >
          <fieldset disabled={a.busy}>
            <div className="hours-grid">
              {days.map((d, i) => (
                <section className="card" key={d.day_of_week}>
                  <h2>{d.day_name}</h2>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={d.is_open}
                      onChange={(e) =>
                        change(i, {
                          is_open: e.target.checked,
                          open_time: e.target.checked ? "08:00" : null,
                          close_time: e.target.checked ? "19:00" : null,
                        })
                      }
                    />
                    Open
                  </label>
                  {d.is_open ? (
                    <div className="row">
                      <label>
                        Opening
                        <input
                          aria-label={`${d.day_name} opening`}
                          type="time"
                          required
                          value={d.open_time?.slice(0, 5) ?? ""}
                          onChange={(e) =>
                            change(i, { open_time: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Closing
                        <input
                          aria-label={`${d.day_name} closing`}
                          type="time"
                          required
                          value={d.close_time?.slice(0, 5) ?? ""}
                          onChange={(e) =>
                            change(i, { close_time: e.target.value })
                          }
                        />
                      </label>
                    </div>
                  ) : (
                    <p>Closed</p>
                  )}
                </section>
              ))}
            </div>
            <button>{a.busy ? "Saving…" : "Save Hours"}</button>
          </fieldset>
        </form>
      )}
    </>
  );
}
