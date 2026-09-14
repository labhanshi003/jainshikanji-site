import Head from "next/head";
import { useEffect, useState, useMemo } from "react";
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

  useEffect(() => {
    if (!tableId) return;
    Promise.all([
      fetch("/api/admin/tables").then((r) => r.json()),
      fetch("/api/menu").then((r) => r.json()),
      fetch("/api/orders?status=active").then((r) => r.json()),
    ]).then(([tables, menuData, orders]: [RestaurantTable[], MenuItem[], Order[]]) => {
      setTable(tables.find((t) => t.id === tableId) ?? null);
      setMenu(menuData.filter((m) => m.available));
      setActiveOrder(orders.find((o) => o.tableId === tableId) ?? null);
      setLoading(false);
    });
  }, [tableId]);

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
      .map(([menuItemId, quantity]) => {
        const item = menu.find((m) => m.id === menuItemId)!;
        return { menuItemId, name: item.name, quantity };
      });

    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId: table.id, tableName: table.name, items, source: "waiter" }),
    });

    // Mark the table occupied now that an order has been placed
    await fetch("/api/admin/tables", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: table.id, status: "occupied" }),
    });

    setCart({});
    setSubmitting(false);
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

  return (
    <WaiterLayout title={table.name} backHref="/waiter">
      <Head>
        <title>Order — {table.name}</title>
      </Head>

      {activeOrder && (
        <div className="mb-5 rounded-xl border-2 border-orange-300 bg-orange-50 p-4">
          <p className="mb-2 text-sm font-bold text-orange-700">Current order in progress</p>
          <ul className="space-y-1 text-sm text-gray-700">
            {activeOrder.items.map((i) => (
              <li key={i.menuItemId} className="flex justify-between">
                <span>{i.name} ×{i.quantity}</span>
                <span className={i.status === "ready" ? "text-green-600" : "text-gray-400"}>
                  {i.status === "ready" ? "Ready" : "Preparing"}
                </span>
              </li>
            ))}
          </ul>
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
