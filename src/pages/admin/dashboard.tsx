import Head from "next/head";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/Admin/AdminLayout";
import StatCard from "@/components/Admin/StatCard";
import { DashboardStats } from "@/types";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    function load() {
      fetch("/api/admin/stats").then((r) => r.json()).then(setStats).catch(() => setStats(null));
    }
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <Head>
        <title>Admin Dashboard — Jain Shikanji</title>
      </Head>

      {!stats ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            <StatCard label="Active Orders" value={stats.activeOrders} icon="🔥" accent="text-brand-orange" />
            <StatCard label="Today's Revenue" value={`₹${stats.todaysRevenue}`} icon="💰" accent="text-green-600" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Menu Items" value={stats.totalMenuItems} icon="🍽️" />
            <StatCard label="Active Items" value={stats.activeMenuItems} icon="✅" />
            <StatCard label="Tables" value={stats.totalTables} icon="🪑" />
            <StatCard label="Contact Leads" value={stats.contactLeads} icon="✉️" />
            <StatCard label="Newsletter Subs" value={stats.newsletterSubscribers} icon="📰" />
          </div>
        </>
      )}

      <div className="mt-8 rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
        Kitchen throughput and payment-method breakdown charts are natural next additions here
        once there's a larger order history to chart.
      </div>
    </AdminLayout>
  );
}
