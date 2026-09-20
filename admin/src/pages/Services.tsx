import { useEffect, useState } from "react";
import { client } from "../lib/supabase";
import {
  serviceSchema,
  categorySchema,
  priceLabel,
  validationMessage,
  type Service,
  type Category,
} from "../lib/validation";
import { Status, useAction } from "../components/ui";
const blank = {
  name: "",
  slug: "",
  description: "",
  category_id: null,
  price_type: "quote",
  price: null,
  display_order: 0,
  active: true,
} as Service;
export default function Services() {
  const [services, setServices] = useState<Service[]>([]),
    [categories, setCategories] = useState<Category[]>([]),
    [editing, edit] = useState<Service | null>(null),
    [category, setCategory] = useState<Category | null>(null),
    [loaded, ready] = useState(false);
  const a = useAction();
  async function load() {
    const [s, c] = await Promise.all([
      client().from("services").select("*").order("display_order").order("id"),
      client()
        .from("service_categories")
        .select("*")
        .order("display_order")
        .order("id"),
    ]);
    if (s.error || c.error) throw s.error || c.error;
    setServices(s.data);
    setCategories(c.data);
    ready(true);
  }
  useEffect(() => {
    void a.run(load, "");
  }, []);
  async function save(table: string, id: number | undefined, values: object) {
    const query = id
      ? client().from(table).update(values).eq("id", id)
      : client().from(table).insert(values);
    const { error, data } = await query.select().single();
    if (error || !data) throw error ?? new Error("No row changed");
  }
  async function remove(table: string, id: number) {
    const { data, error } = await client()
      .from(table)
      .delete()
      .eq("id", id)
      .select()
      .single();
    if (error || !data) throw error ?? new Error("No row deleted");
    await load();
  }
  return (
    <>
      <h1>Services & prices</h1>
      <Status {...a} />
      {loaded && (
        <>
          <button disabled={a.busy} onClick={() => edit({ ...blank })}>
            + Add Service
          </button>
          {editing && (
            <form
              className="card"
              onSubmit={(e) => {
                e.preventDefault();
                const r = serviceSchema.safeParse(editing);
                if (!r.success) {
                  a.setError(validationMessage(r.error));
                  return;
                }
                void a.run(async () => {
                  await save("services", editing.id, r.data);
                  edit(null);
                  await load();
                });
              }}
            >
              <h2>{editing.id ? "Edit" : "Add"} service</h2>
              <fieldset disabled={a.busy}>
                <label>
                  Name
                  <input
                    required
                    maxLength={100}
                    value={editing.name}
                    onChange={(e) => edit({ ...editing, name: e.target.value })}
                  />
                </label>
                <label>
                  Slug
                  <input
                    required
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    placeholder="wash-and-fold"
                    value={editing.slug}
                    onChange={(e) => edit({ ...editing, slug: e.target.value })}
                  />
                </label>
                <label>
                  Description
                  <textarea
                    maxLength={1000}
                    value={editing.description ?? ""}
                    onChange={(e) =>
                      edit({ ...editing, description: e.target.value })
                    }
                  />
                </label>
                <label>
                  Category
                  <select
                    value={editing.category_id ?? ""}
                    onChange={(e) =>
                      edit({
                        ...editing,
                        category_id: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.active ? "" : " (hidden)"}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Pricing type
                  <select
                    value={editing.price_type}
                    onChange={(e) =>
                      edit({
                        ...editing,
                        price_type: e.target.value as Service["price_type"],
                        price:
                          e.target.value === "quote" ? null : editing.price,
                      })
                    }
                  >
                    <option value="fixed">Fixed</option>
                    <option value="starting_at">Starting at</option>
                    <option value="per_pound">Per pound</option>
                    <option value="quote">Call for quote</option>
                  </select>
                </label>
                {editing.price_type !== "quote" && (
                  <label>
                    Price ($)
                    <input
                      type="number"
                      required
                      min="0"
                      max="99999999.99"
                      step="0.01"
                      value={editing.price ?? ""}
                      onChange={(e) =>
                        edit({
                          ...editing,
                          price:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                )}
                <label>
                  Display order
                  <input
                    type="number"
                    required
                    step="1"
                    value={editing.display_order}
                    onChange={(e) =>
                      edit({
                        ...editing,
                        display_order: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={editing.active}
                    onChange={(e) =>
                      edit({ ...editing, active: e.target.checked })
                    }
                  />
                  Active
                </label>
                <div className="actions">
                  <button>Save Service</button>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => edit(null)}
                  >
                    Cancel
                  </button>
                </div>
              </fieldset>
            </form>
          )}
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Order</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{priceLabel(s)}</td>
                    <td>
                      {categories.find((c) => c.id === s.category_id)?.name ??
                        "—"}
                    </td>
                    <td>{s.display_order}</td>
                    <td>{s.active ? "Yes" : "No"}</td>
                    <td>
                      <div className="actions">
                        <button disabled={a.busy} onClick={() => edit(s)}>
                          Edit
                        </button>
                        <button
                          disabled={a.busy}
                          className="secondary"
                          onClick={() =>
                            void a.run(async () => {
                              await save("services", s.id, {
                                active: !s.active,
                              });
                              await load();
                            })
                          }
                        >
                          {s.active ? "Disable" : "Enable"}
                        </button>
                        <button
                          disabled={a.busy}
                          className="danger"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete “${s.name}”? This cannot be undone.`,
                              )
                            )
                              void a.run(
                                () => remove("services", s.id),
                                "Service deleted.",
                              );
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!services.length && (
            <p>
              No services yet. Add a service with its actual price, or choose
              “Call for quote.”
            </p>
          )}
          <h2>Categories</h2>
          <p>
            Hidden categories also hide their services from public pricing.
            Lower order numbers appear first.
          </p>
          <button
            disabled={a.busy}
            onClick={() =>
              setCategory({
                name: "",
                slug: "",
                display_order: 0,
                active: true,
              } as Category)
            }
          >
            + Add Category
          </button>
          {category && (
            <form
              className="card"
              onSubmit={(e) => {
                e.preventDefault();
                const r = categorySchema.safeParse(category);
                if (!r.success) {
                  a.setError(validationMessage(r.error));
                  return;
                }
                void a.run(async () => {
                  await save("service_categories", category.id, r.data);
                  setCategory(null);
                  await load();
                });
              }}
            >
              <fieldset disabled={a.busy}>
                <label>
                  Category name
                  <input
                    required
                    value={category.name}
                    onChange={(e) =>
                      setCategory({ ...category, name: e.target.value })
                    }
                  />
                </label>
                <label>
                  Category slug
                  <input
                    required
                    value={category.slug}
                    onChange={(e) =>
                      setCategory({ ...category, slug: e.target.value })
                    }
                  />
                </label>
                <label>
                  Category order
                  <input
                    type="number"
                    required
                    value={category.display_order}
                    onChange={(e) =>
                      setCategory({
                        ...category,
                        display_order: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={category.active}
                    onChange={(e) =>
                      setCategory({ ...category, active: e.target.checked })
                    }
                  />
                  Active
                </label>
                <div className="actions">
                  <button>Save Category</button>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => setCategory(null)}
                  >
                    Cancel
                  </button>
                </div>
              </fieldset>
            </form>
          )}
          <ul className="category-list">
            {categories.map((c) => (
              <li key={c.id}>
                <span>
                  {c.name} · {c.active ? "Active" : "Hidden"} · order{" "}
                  {c.display_order}
                </span>
                <div className="actions">
                  <button disabled={a.busy} onClick={() => setCategory(c)}>
                    Edit
                  </button>
                  <button
                    disabled={a.busy}
                    className="danger"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete “${c.name}”? Its services will become uncategorized and active services may become public.`,
                        )
                      )
                        void a.run(
                          () => remove("service_categories", c.id),
                          "Category deleted.",
                        );
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
