import Head from "next/head";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Order, AggregatedKOTItem } from "@/types";

const POLL_MS = 5000; // simple polling for now — swap for WebSocket later, see README

function aggregate(orders: Order[]): (AggregatedKOTItem & { oldestCreatedAt: string })[] {
  const map = new Map<string, AggregatedKOTItem & { oldestCreatedAt: string }>();

  for (const order of orders) {
    for (const item of order.items) {
      if (item.status !== "pending") continue; // only kitchen-pending items belong in the KOT queue
      const existing = map.get(item.menuItemId);
      const contribution = { orderId: order.id, tableName: order.tableName, quantity: item.quantity };
      if (existing) {
        existing.totalQuantity += item.quantity;
        existing.contributingOrders.push(contribution);
        if (order.createdAt < existing.oldestCreatedAt) existing.oldestCreatedAt = order.createdAt;
      } else {
        map.set(item.menuItemId, {
          menuItemId: item.menuItemId,
          name: item.name,
          totalQuantity: item.quantity,
          contributingOrders: [contribution],
          oldestCreatedAt: order.createdAt,
        });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => a.oldestCreatedAt.localeCompare(b.oldestCreatedAt));
}

// Waiting time drives both the label and the card's urgency colour — a
// kitchen screen's whole job is telling the cook what's getting late.
function useElapsedMinutes(sinceIso: string) {
  const [mins, setMins] = useState(0);
  useEffect(() => {
    function update() {
      setMins(Math.floor((Date.now() - new Date(sinceIso).getTime()) / 60000));
    }
    update();
    const id = setInterval(update, 15000);
    return () => clearInterval(id);
  }, [sinceIso]);
  return mins;
}

function urgencyStyle(mins: number) {
  if (mins >= 12) return { border: "border-red-500", badge: "bg-red-500 text-white", pulse: "animate-pulse" };
  if (mins >= 6) return { border: "border-amber-400", badge: "bg-amber-400 text-gray-950", pulse: "" };
  return { border: "border-gray-800", badge: "bg-gray-800 text-gray-300", pulse: "" };
}

const SOURCE_ICON: Record<Order["source"], string> = { qr: "📱", waiter: "🧾", manual: "✍️" };

function ElapsedBadge({ sinceIso }: { sinceIso: string }) {
  const mins = useElapsedMinutes(sinceIso);
  const { badge, pulse } = urgencyStyle(mins);
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badge} ${pulse}`}>
      {mins < 1 ? "just now" : `${mins}m`}
    </span>
  );
}

export default function KitchenScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [view, setView] = useState<"aggregated" | "individual">("aggregated");
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/orders?status=active");
    setOrders(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    function tick() {
      setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  async function markAggregatedReady(group: AggregatedKOTItem) {
    await Promise.all(
      group.contributingOrders.map((c) =>
        fetch("/api/orders", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: c.orderId, menuItemId: group.menuItemId, itemStatus: "ready" }),
        })
      )
    );
    load();
  }

  async function markItemReady(orderId: string, menuItemId: string) {
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, menuItemId, itemStatus: "ready" }),
    });
    load();
  }

  async function seedDemoOrders() {
    await fetch("/api/orders/seed", { method: "POST" });
    load();
  }

  const aggregated = useMemo(() => aggregate(orders), [orders]);
  const pendingItemCount = aggregated.reduce((sum, g) => sum + g.totalQuantity, 0);
  const activeTableCount = new Set(orders.filter((o) => o.items.some((i) => i.status === "pending")).map((o) => o.tableId)).size;
  const hasPendingWork = aggregated.length > 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Head>
        <title>Kitchen Screen — Jain Shikanji</title>
      </Head>

      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 px-8 py-5">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black tracking-tight">KITCHEN</h1>
          {hasPendingWork && (
            <div className="flex gap-2 text-xs font-bold">
              <span className="rounded-full bg-yellow-400 px-3 py-1.5 text-gray-950">
                {pendingItemCount} items pending
              </span>
              <span className="rounded-full bg-gray-800 px-3 py-1.5 text-gray-300">
                {activeTableCount} tables
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-gray-500">{clock}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setView("aggregated")}
              className={`rounded-lg px-5 py-2.5 text-base font-bold transition ${
                view === "aggregated" ? "bg-yellow-400 text-gray-950" : "bg-gray-800 text-gray-300"
              }`}
            >
              Aggregated
            </button>
            <button
              onClick={() => setView("individual")}
              className={`rounded-lg px-5 py-2.5 text-base font-bold transition ${
                view === "individual" ? "bg-yellow-400 text-gray-950" : "bg-gray-800 text-gray-300"
              }`}
            >
              By Table
            </button>
          </div>
        </div>
      </header>

      <main className="p-8">
        {loading ? (
          <p className="text-xl text-gray-400">Loading...</p>
        ) : !hasPendingWork ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <p className="text-3xl font-bold text-gray-500">All caught up 🎉</p>
            <button
              onClick={seedDemoOrders}
              className="rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-300 hover:bg-gray-700"
            >
              Load demo orders (for testing)
            </button>
          </div>
        ) : view === "aggregated" ? (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
            {aggregated.map((group) => {
              const mins = Math.floor((Date.now() - new Date(group.oldestCreatedAt).getTime()) / 60000);
              const { border, pulse } = urgencyStyle(mins);
              return (
                <div
                  key={group.menuItemId}
                  className={`rounded-2xl border-2 bg-gray-900 p-6 transition-colors ${border} ${pulse}`}
                >
                  <div className="flex items-start justify-between">
                    <h2 className="text-2xl font-black leading-tight">{group.name}</h2>
                    <ElapsedBadge sinceIso={group.oldestCreatedAt} />
                  </div>
                  <p className="mt-1 text-4xl font-black text-yellow-400">×{group.totalQuantity}</p>
                  <ul className="mt-3 space-y-1 text-sm text-gray-400">
                    {group.contributingOrders.map((c, i) => (
                      <li key={i}>{c.tableName} — ×{c.quantity}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => markAggregatedReady(group)}
                    className="mt-5 w-full rounded-xl bg-green-500 py-4 text-xl font-black text-gray-950 transition active:scale-95 active:bg-green-400"
                  >
                    MARK READY
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
            {orders
              .filter((o) => o.items.some((i) => i.status === "pending"))
              .map((order) => {
                const mins = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
                const { border, pulse } = urgencyStyle(mins);
                return (
                  <div key={order.id} className={`rounded-2xl border-2 bg-gray-900 p-6 transition-colors ${border} ${pulse}`}>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-xl font-black text-yellow-400">
                        {SOURCE_ICON[order.source]} {order.tableName}
                      </h2>
                      <ElapsedBadge sinceIso={order.createdAt} />
                    </div>
                    <ul className="space-y-3">
                      {order.items
                        .filter((i) => i.status === "pending")
                        .map((item) => (
                          <li key={item.menuItemId} className="flex items-center justify-between">
                            <span className="text-lg font-semibold">
                              {item.name} <span className="text-gray-400">×{item.quantity}</span>
                            </span>
                            <button
                              onClick={() => markItemReady(order.id, item.menuItemId)}
                              className="rounded-lg bg-green-500 px-3 py-1.5 text-sm font-bold text-gray-950 transition active:scale-95 active:bg-green-400"
                            >
                              Ready
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                );
              })}
          </div>
        )}
      </main>
    </div>
  );
}
