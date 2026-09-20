import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { client } from "../lib/supabase";
import { Status, useAction } from "../components/ui";
export default function Dashboard() {
  const [count, setCount] = useState<number | null>(null),
    [enabled, setEnabled] = useState<boolean | null>(null);
  const a = useAction();
  useEffect(() => {
    void a.run(async () => {
      const [s, b] = await Promise.all([
        client()
          .from("services")
          .select("id", { count: "exact", head: true })
          .eq("active", true),
        client().from("banner").select("enabled").eq("id", 1).maybeSingle(),
      ]);
      if (s.error || b.error) throw s.error || b.error;
      setCount(s.count);
      setEnabled(b.data?.enabled ?? false);
    }, "");
  }, []);
  return (
    <>
      <h1>Website content</h1>
      <p>Keep your business details current.</p>
      <Status {...a} />
      <div className="dashboard">
        <section className="card">
          <h2>Business hours</h2>
          <p>Edit weekly opening hours.</p>
          <Link to="/hours">Edit Hours →</Link>
        </section>
        <section className="card">
          <h2>Services & prices</h2>
          <p>{count === null ? "Loading…" : `${count} active services`}</p>
          <Link to="/services">Manage Services →</Link>
        </section>
        <section className="card">
          <h2>Announcement</h2>
          <p>
            {enabled === null
              ? "Loading…"
              : enabled
                ? "Currently enabled"
                : "Currently disabled"}
          </p>
          <Link to="/banner">Edit Banner →</Link>
        </section>
      </div>
    </>
  );
}
