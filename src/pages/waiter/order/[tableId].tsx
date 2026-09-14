import Head from "next/head";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import WaiterLayout from "@/components/Waiter/WaiterLayout";
import { MenuItem, RestaurantTable, Order } from "@/types";

export default function WaiterOrderEntry() {
  const router = useRouter();
  const { tableId } = router.query as { tableId?: string };

  const [table, setTable] = useState<RestaurantTable | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (id: string) => {
    const [tables, orders]: [RestaurantTable[], Order[]] = await Promise.all([
      fetch("/api/admin/tables").then((r) => r.json()),
      fetch("/api/orders?status=active").then((r) => r.json()),
    ]);
    setTable(tables.find((t) => t.id === id) ?? null);
    setActiveOrder(orders.find((o) => o.tableId === id) ?? null);
  }, []);

  useEffect(() => {
    if (!tableId) return;
    fetch("/api/menu")
      .then((r) => r.json())
      .then((menuData: MenuItem[]) => setMenu(menuData.filter((m) => m.available)));
    refresh(tableId).then(() => setLoading(false));

    // Poll so the waiter sees kitchen updates (item ready) without refreshing
    const interval = setInterval(() => refresh(tableId), 5000);
    return () => clearInterval(interval);
  }, [tableId, refresh]);

  const grouped = useMemo(() => {
    const byCategory: Record<string, MenuItem[]> = {};
    for (const item of menu) {
      byCategory[item.category] = byCategory[item.category] ?? [];
      byCategory[item.category].push(item);
    }
    return byCategory;
  }, [menu]);

  function updateQty(id: string, delta: number) {
    setCart((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      return { ...prev, [id]: next };
    });
  }

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  async function placeOrder() {
    if (!table || cartCount === 0) return;
    setSubmitting(true);

    const items = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([menuItemId, quantity]) => ({ menuItemId, quantity }));

    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId: table.id, tableName: table.name, items, source: "waiter" }),
    });
    await fetch("/api/admin/tables", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: table.id, status: "occupied" }),
    });

    setCart({});
    setSubmitting(false);
    refresh(table.id);
  }

  async function markServed(menuItemId: string) {
    if (!activeOrder) return;
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: activeOrder.id, menuItemId, itemStatus: "served" }),
    });
    refresh(activeOrder.tableId);
  }

  async function completeAndFreeTable() {
    if (!activeOrder || !table) return;
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: activeOrder.id, orderStatus: "completed" }),
    });
    await fetch("/api/admin/tables", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: table.id, status: "free" }),
    });
    router.push("/waiter");
  }

  if (loading) {
    return (
      <WaiterLayout title="Loading..." backHref="/waiter">
        <p className="text-sm text-gray-500">Loading table...</p>
      </WaiterLayout>
    );
  }

  if (!table) {
    return (
      <WaiterLayout title="Table not found" backHref="/waiter">
        <p className="text-sm text-gray-500">This table doesn't exist. Go back and pick another.</p>
      </WaiterLayout>
    );
  }

  const allServed = activeOrder ? activeOrder.items.every((i) => i.status === "served") : false;
  const isPaid = activeOrder?.paymentStatus === "paid";
  const canFreeTable = activeOrder && allServed && isPaid;

  return (
    <WaiterLayout title={table.name} backHref="/waiter">
      <Head>
        <title>Order — {table.name}</title>
      </Head>

      {activeOrder && (
        <div className="mb-5 rounded-xl border-2 border-orange-300 bg-orange-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold text-orange-700">Current order</p>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                isPaid ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
              }`}
            >
              {isPaid ? "Paid" : `Unpaid · ${activeOrder.paymentMethod}`}
            </span>
          </div>

          <ul className="space-y-2 text-sm text-gray-700">
            {activeOrder.items.map((i) => (
              <li key={i.menuItemId} className="flex items-center justify-between">
                <span>{i.name} ×{i.quantity}</span>
                {i.status === "served" ? (
                  <span className="text-xs font-semibold text-gray-400">Served ✓</span>
                ) : i.status === "ready" ? (
                  <button
                    onClick={() => markServed(i.menuItemId)}
                    className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-bold text-white active:bg-green-600"
                  >
                    Mark Served
                  </button>
                ) : (
                  <span className="text-xs text-gray-400">Preparing</span>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-3 flex items-center justify-between border-t border-dashed border-orange-200 pt-3 text-sm">
            <span className="text-gray-600">Total</span>
            <span className="font-bold text-gray-800">₹{activeOrder.total}</span>
          </div>

          {canFreeTable ? (
            <button
              onClick={completeAndFreeTable}
              className="mt-3 w-full rounded-xl bg-teal-700 py-3 text-sm font-bold text-white active:bg-teal-800"
            >
              Complete Order &amp; Free Table
            </button>
          ) : (
            <p className="mt-3 text-center text-xs text-gray-500">
              {!allServed ? "Serve all items" : "Waiting for payment"} before this table can be freed.
            </p>
          )}
        </div>
      )}

      <p className="mb-3 text-sm font-semibold text-gray-500">Add a new order for this table</p>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-teal-700">{category}</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3"
              >
                <div>
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="h-9 w-9 rounded-full bg-gray-100 text-lg font-bold text-gray-600 active:bg-gray-200"
                  >
                    −
                  </button>
                  <span className="w-5 text-center font-bold">{cart[item.id] ?? 0}</span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="h-9 w-9 rounded-full bg-teal-700 text-lg font-bold text-white active:bg-teal-800"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {cartCount > 0 && (
        <button
          onClick={placeOrder}
          disabled={submitting}
          className="fixed bottom-4 left-4 right-4 rounded-2xl bg-teal-700 py-4 text-lg font-bold text-white shadow-lg active:bg-teal-800 disabled:opacity-60"
        >
          {submitting ? "Placing order..." : `Place Order (${cartCount} items)`}
        </button>
      )}
    </WaiterLayout>
  );
}
