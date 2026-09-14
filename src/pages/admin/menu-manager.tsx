import Head from "next/head";
import { useEffect, useState, FormEvent } from "react";
import AdminLayout from "@/components/Admin/AdminLayout";
import { MenuItem } from "@/types";

const CATEGORIES: MenuItem["category"][] = ["Signature Drinks", "Legendary Snacks", "Hearty Meals"];

export default function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category: CATEGORIES[0], name: "", description: "", price: "" });

  async function load() {
    const res = await fetch("/api/admin/menu");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleAvailable(item: MenuItem) {
    // Optimistic update — flip immediately, then confirm with the server
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, available: !i.available } : i)));
    await fetch("/api/admin/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, available: !item.available }),
    });
  }

  async function deleteItem(id: string) {
    if (!confirm("Remove this item from the menu?")) return;
    await fetch("/api/admin/menu", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price) return;
    await fetch("/api/admin/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price) }),
    });
    setForm({ category: CATEGORIES[0], name: "", description: "", price: "" });
    load();
  }

  return (
    <AdminLayout title="Menu Manager">
      <Head>
        <title>Menu Manager — Admin</title>
      </Head>

      <form onSubmit={handleAdd} className="mb-6 grid gap-3 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-5">
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as MenuItem["category"] })}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          placeholder="Item name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded bg-admin-navy px-4 py-2 text-sm font-semibold text-white hover:bg-admin-accent hover:text-admin-navy"
        >
          + Add Item
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                  <td className="px-4 py-3 text-gray-500">{item.category}</td>
                  <td className="px-4 py-3 text-gray-500">₹{item.price}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAvailable(item)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.available
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {item.available ? "Available" : "Out of stock"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-xs font-medium text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
