import Head from "next/head";
import { useEffect, useState, FormEvent } from "react";
import AdminLayout from "@/components/Admin/AdminLayout";
import { RestaurantTable } from "@/types";

const AREAS: RestaurantTable["area"][] = ["Indoor", "Outdoor", "AC Hall", "Counter"];

export default function Tables() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", area: AREAS[0], seats: "4" });

  async function load() {
    const res = await fetch("/api/admin/tables");
    setTables(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleStatus(t: RestaurantTable) {
    const nextStatus = t.status === "free" ? "occupied" : "free";
    setTables((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: nextStatus } : x)));
    await fetch("/api/admin/tables", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id, status: nextStatus }),
    });
  }

  async function removeTable(id: string) {
    if (!confirm("Remove this table?")) return;
    await fetch("/api/admin/tables", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    await fetch("/api/admin/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", area: AREAS[0], seats: "4" });
    load();
  }

  return (
    <AdminLayout title="Tables">
      <Head>
        <title>Tables — Admin</title>
      </Head>

      <form onSubmit={handleAdd} className="mb-6 grid gap-3 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-4">
        <input
          placeholder="Table name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <select
          value={form.area}
          onChange={(e) => setForm({ ...form, area: e.target.value as RestaurantTable["area"] })}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          {AREAS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Seats"
          value={form.seats}
          onChange={(e) => setForm({ ...form, seats: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded bg-admin-navy px-4 py-2 text-sm font-semibold text-white hover:bg-admin-accent hover:text-admin-navy"
        >
          + Add Table
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((t) => (
            <div key={t.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">{t.name}</h3>
                <button
                  onClick={() => toggleStatus(t)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    t.status === "free" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {t.status === "free" ? "Free" : "Occupied"}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">{t.area} · {t.seats} seats</p>
              <button
                onClick={() => removeTable(t.id)}
                className="mt-3 text-xs font-medium text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
