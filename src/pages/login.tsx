import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "kitchen", label: "Kitchen" },
  { value: "waiter", label: "Waiter" },
];

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, password }),
    });

    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Wrong password. Try again.");
      return;
    }

    const next = (router.query.next as string) || `/${role}`;
    router.push(next);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Head>
        <title>Staff Login — Jain Shikanji</title>
      </Head>
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-gray-800">Staff Login</h1>
        <p className="mb-6 text-sm text-gray-500">Jain Shikanji internal access</p>

        <label className="mb-1 block text-sm font-semibold text-gray-600">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>

        <label className="mb-1 block text-sm font-semibold text-gray-600">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2"
          required
          autoFocus
        />

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gray-900 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
