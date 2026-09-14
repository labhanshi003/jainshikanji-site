import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RestaurantTable } from "@/types";

// This page was the Phase 1 "Coming Soon" placeholder reserved for Vistona
// integration. Now that Phase 5 (QR Table Ordering) exists in-house, this
// doubles as the entry point for it: normally a customer reaches
// /table/[tableId] by scanning the physical QR code on their table, but this
// picker exists so the flow is reachable from the website too (and so it's
// testable without printed QR codes). If/when Vistona is connected later,
// this can instead redirect to Vistona's widget/link — see the note that
// used to live here.

export default function OrderNow() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/tables")
      .then((r) => r.json())
      .then((data) => {
        setTables(data);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Head>
        <title>Order Now — Jain Shikanji</title>
      </Head>

      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="mb-2 text-3xl font-bold text-brand-green">Order Now</h1>
        <p className="mb-10 text-gray-600">
          Dining in? Scan the QR code on your table — or pick your table below.
        </p>

        {loading ? (
          <p className="text-sm text-gray-500">Loading tables...</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {tables.map((t) => (
              <Link
                key={t.id}
                href={`/table/${t.id}`}
                className="rounded-2xl border-2 border-brand-green/20 bg-white p-5 shadow-sm transition hover:border-brand-gold hover:shadow-md"
              >
                <p className="text-lg font-bold text-brand-green">{t.name}</p>
                <p className="mt-1 text-xs text-gray-500">{t.area} · {t.seats} seats</p>
              </Link>
            ))}
          </div>
        )}

        <p className="mt-10 text-xs text-gray-400">
          Not at the restaurant? Full delivery ordering is coming soon through our partner
          platform, Vistona Global.
        </p>
      </section>
    </>
  );
}
