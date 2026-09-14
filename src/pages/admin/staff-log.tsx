import Head from "next/head";
import { useEffect, useState, FormEvent } from "react";
import AdminLayout from "@/components/Admin/AdminLayout";
import { StaffLogEntry } from "@/types";

export default function StaffLog() {
  const [logs, setLogs] = useState<StaffLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ staffName: "", action: "" });

  async function load() {
    const res = await fetch("/api/admin/staff-log");
    setLogs(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!form.staffName || !form.action) return;
    await fetch("/api/admin/staff-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ staffName: "", action: "" });
    load();
  }

  return (
    <AdminLayout title="Staff Activity Log">
      <Head>
        <title>Staff Log — Admin</title>
      </Head>

      <form onSubmit={handleAdd} className="mb-6 grid gap-3 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-3">
        <input
          placeholder="Staff name"
          value={form.staffName}
          onChange={(e) => setForm({ ...form, staffName: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          placeholder="Action (e.g. 'Closed cash register')"
          value={form.action}
          onChange={(e) => setForm({ ...form, action: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded bg-admin-navy px-4 py-2 text-sm font-semibold text-white hover:bg-admin-accent hover:text-admin-navy"
        >
          + Log Entry
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-gray-500">No activity logged yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">{log.staffName}</td>
                  <td className="px-4 py-3 text-gray-600">{log.action}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(log.loggedAt).toLocaleString()}
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
