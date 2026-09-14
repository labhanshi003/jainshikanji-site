import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import WaiterLayout from "@/components/Waiter/WaiterLayout";
import { RestaurantTable, Order } from "@/types";

const AREA_ICON: Record<RestaurantTable["area"], string> = {
  Indoor: "🏠",
  Outdoor: "🌳",
  "AC Hall": "❄️",
  Counter: "🛎️",
};

export default function WaiterHome() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function load() {
      Promise.all([
        fetch("/api/admin/tables").then((r) => r.json()),
        fetch("/api/orders?status=active").then((r) => r.json()),
      ]).then(([tableData, orderData]) => {
        setTables(tableData);
        setOrders(orderData);
        setLoading(false);
      });
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const orderByTableId = new Map(orders.map((o) => [o.tableId, o]));
  const readyToServeTableIds = new Set(
    orders.filter((o) => o.items.some((i) => i.status === "ready")).map((o) => o.tableId)
  );
  const readyCount = readyToServeTableIds.size;

  return (
    <WaiterLayout title="Select a Table">
      <Head>
        <title>Waiter — Jain Shikanji</title>
      </Head>

      {readyCount > 0 && (
        <div className="mb-4 animate-pulse rounded-xl bg-green-500 px-4 py-3 text-center text-sm font-bold text-white">
          🔔 {readyCount} table{readyCount > 1 ? "s" : ""} ready to serve!
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {tables.map((t) => {
            const readyToServe = readyToServeTableIds.has(t.id);
            const order = orderByTableId.get(t.id);
            const servedCount = order ? order.items.filter((i) => i.status === "served").length : 0;
            const totalCount = order ? order.items.length : 0;

            return (
              <Link
                key={t.id}
                href={`/waiter/order/${t.id}`}
                className={`relative rounded-2xl p-5 text-center shadow-sm transition active:scale-95 ${
                  readyToServe
                    ? "border-2 border-green-500 bg-green-50"
                    : t.status === "free"
                    ? "border-2 border-teal-600 bg-white"
                    : "border-2 border-orange-400 bg-orange-100"
                }`}
              >
                {readyToServe && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 animate-pulse rounded-full bg-green-500 ring-4 ring-green-100" />
                )}
                <p className="text-2xl">{AREA_ICON[t.area]}</p>
                <p className="mt-1 text-xl font-bold text-gray-800">{t.name}</p>
                <p className="mt-1 text-xs text-gray-500">{t.area} · {t.seats} seats</p>
                <p
                  className={`mt-2 text-sm font-semibold ${
                    readyToServe ? "text-green-600" : t.status === "free" ? "text-teal-700" : "text-orange-600"
                  }`}
                >
                  {readyToServe ? "Ready to serve!" : t.status === "free" ? "Free" : "Occupied"}
                </p>

                {order && (
                  <div className="mt-2 space-y-1 border-t border-black/5 pt-2">
                    <p className="text-xs font-medium text-gray-500">
                      Order placed · {servedCount}/{totalCount} served
                    </p>
                    <p
                      className={`text-xs font-semibold ${
                        order.paymentStatus === "paid" ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {order.paymentStatus === "paid" ? "Paid ✓" : `Unpaid · ${order.paymentMethod}`}
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </WaiterLayout>
  );
}
