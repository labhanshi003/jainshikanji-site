import Head from "next/head";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { MenuItem, RestaurantTable, Order } from "@/types";

// TODO: replace with the restaurant's real UPI VPA before going live.
// This is a plain UPI deep link (upi://pay?...) — it works with any UPI app
// (GPay, PhonePe, Paytm) and needs no payment-gateway account or API key,
// which makes it a genuinely working "pay the restaurant" option for a
// prototype. It cannot auto-confirm payment though — see the "I've Paid"
// button below, which is a self-reported confirmation, clearly labelled as such.
const RESTAURANT_UPI_ID = "jainshikanji@upi";
const RESTAURANT_UPI_NAME = "Jain Shikanji";

function buildUpiLink(amount: number, orderId: string) {
  const params = new URLSearchParams({
    pa: RESTAURANT_UPI_ID,
    pn: RESTAURANT_UPI_NAME,
    am: String(amount),
    cu: "INR",
    tn: `Order ${orderId}`,
  });
  return `upi://pay?${params.toString()}`;
}

const CATEGORY_ICON: Record<string, string> = {
  "Signature Drinks": "🥤",
  "Legendary Snacks": "🍟",
  "Hearty Meals": "🍛",
};

function useReadyCountdown(estimatedReadyAt: string | undefined, allReady: boolean) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!estimatedReadyAt || allReady) return;
    function update() {
      const diffMs = new Date(estimatedReadyAt as string).getTime() - Date.now();
      const mins = Math.ceil(diffMs / 60000);
      setLabel(mins > 0 ? `~${mins} min` : "Any moment now");
    }
    update();
    const id = setInterval(update, 15000);
    return () => clearInterval(id);
  }, [estimatedReadyAt, allReady]);

  return label;
}

export default function TableOrderingPage() {
  const router = useRouter();
  const { tableId } = router.query as { tableId?: string };

  const [table, setTable] = useState<RestaurantTable | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [reviewOpen, setReviewOpen] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState<"cash" | "upi">("cash");
  const [submitting, setSubmitting] = useState(false);
  const [justPlaced, setJustPlaced] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadOrderStatus(id: string) {
    const orders: Order[] = await fetch("/api/orders?status=active").then((r) => r.json());
    setActiveOrder(orders.find((o) => o.tableId === id) ?? null);
  }

  useEffect(() => {
    if (!tableId) return;
    Promise.all([
      fetch("/api/admin/tables").then((r) => r.json()),
      fetch("/api/menu").then((r) => r.json()),
    ]).then(([tables, menuData]: [RestaurantTable[], MenuItem[]]) => {
      setTable(tables.find((t) => t.id === tableId) ?? null);
      setMenu(menuData.filter((m) => m.available));
      setLoading(false);
    });
    loadOrderStatus(tableId);

    // Poll for order status so the customer sees live kitchen + payment updates
    const interval = setInterval(() => loadOrderStatus(tableId), 5000);
    return () => clearInterval(interval);
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
    setCart((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) }));
  }

  const cartLines = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([menuItemId, quantity]) => {
      const item = menu.find((m) => m.id === menuItemId)!;
      return { menuItemId, name: item.name, price: item.price, quantity };
    });
  const cartCount = cartLines.reduce((sum, l) => sum + l.quantity, 0);
  const cartSubtotal = cartLines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const cartTax = Math.round(cartSubtotal * 0.05);
  const cartTotal = cartSubtotal + cartTax;

  async function placeOrder() {
    if (!table || cartCount === 0) return;
    setSubmitting(true);

    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableId: table.id,
        tableName: table.name,
        items: cartLines.map(({ menuItemId, quantity }) => ({ menuItemId, quantity })),
        source: "qr",
        paymentMethod: paymentChoice,
      }),
    });
    await fetch("/api/admin/tables", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: table.id, status: "occupied" }),
    });

    setCart({});
    setReviewOpen(false);
    setSubmitting(false);
    setJustPlaced(true);
    await loadOrderStatus(table.id);
    setTimeout(() => setJustPlaced(false), 4000);
  }

  async function markPaid() {
    if (!activeOrder) return;
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: activeOrder.id, paymentStatus: "paid" }),
    });
    loadOrderStatus(activeOrder.tableId);
  }

  function payViaUpi() {
    if (!activeOrder) return;
    window.location.href = buildUpiLink(activeOrder.total, activeOrder.id);
  }

  const allItemsReady = activeOrder ? activeOrder.items.every((i) => i.status === "ready") : false;
  const etaLabel = useReadyCountdown(activeOrder?.estimatedReadyAt, allItemsReady);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream">
        <p className="text-gray-500">Loading menu...</p>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-brand-cream px-6 text-center">
        <p className="text-xl font-bold text-brand-green">Table not found</p>
        <p className="text-sm text-gray-500">Please scan the QR code on your table again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pb-28">
      <Head>
        <title>Order — {table.name} — Jain Shikanji</title>
      </Head>

      <header className="bg-brand-green px-5 py-6 text-center text-white">
        <p className="text-xs uppercase tracking-wide text-white/70">Jain Shikanji</p>
        <h1 className="text-2xl font-bold">{table.name}</h1>
      </header>

      {justPlaced && (
        <div className="mx-4 mt-4 rounded-xl bg-green-100 p-4 text-center text-sm font-semibold text-green-700">
          Order placed! Your food is on its way to the kitchen. 🎉
        </div>
      )}

      {/* ---- Order tracking + bill + payment ---- */}
      {activeOrder && (
        <div className="mx-4 mt-4 rounded-xl border-2 border-brand-gold/40 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-brand-gold">Your current order</p>
            <p className={`text-sm font-bold ${allItemsReady ? "text-green-600" : "text-brand-orange"}`}>
              {allItemsReady ? "Ready! 🎉" : `Ready in ${etaLabel || "..."}`}
            </p>
          </div>

          <ul className="space-y-1 text-sm text-gray-600">
            {activeOrder.items.map((i) => (
              <li key={i.menuItemId} className="flex justify-between">
                <span>{i.name} ×{i.quantity}</span>
                <span className={i.status === "ready" ? "font-semibold text-green-600" : "text-gray-400"}>
                  {i.status === "ready" ? "Ready" : "Preparing"}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-3 space-y-1 border-t border-dashed border-gray-200 pt-3 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span><span>₹{activeOrder.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Taxes (5%)</span><span>₹{activeOrder.tax}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-800">
              <span>Total</span><span>₹{activeOrder.total}</span>
            </div>
          </div>

          <div className="mt-3 border-t border-dashed border-gray-200 pt-3">
            {activeOrder.paymentStatus === "paid" ? (
              <p className="text-center text-sm font-semibold text-green-600">✓ Paid</p>
            ) : activeOrder.paymentMethod === "upi" ? (
              <div className="flex gap-2">
                <button
                  onClick={payViaUpi}
                  className="flex-1 rounded-xl bg-brand-green py-2.5 text-sm font-bold text-white active:bg-brand-gold active:text-brand-green"
                >
                  Pay via UPI
                </button>
                <button
                  onClick={markPaid}
                  className="flex-1 rounded-xl border-2 border-brand-green py-2.5 text-sm font-bold text-brand-green"
                >
                  I've Paid
                </button>
              </div>
            ) : (
              <p className="text-center text-sm text-gray-500">Pay at the counter when your order arrives.</p>
            )}
          </div>
        </div>
      )}

      <div className="px-4 py-5">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="mb-6">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-green">
              {CATEGORY_ICON[category] ?? ""} {category}
            </h2>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                    <p className="mt-1 text-sm font-bold text-brand-gold">₹{item.price}</p>
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
                      className="h-9 w-9 rounded-full bg-brand-green text-lg font-bold text-white active:bg-brand-gold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ---- Floating "Review Order" bar ---- */}
      {cartCount > 0 && !reviewOpen && (
        <button
          onClick={() => setReviewOpen(true)}
          className="fixed bottom-4 left-4 right-4 rounded-2xl bg-brand-green py-4 text-lg font-bold text-white shadow-lg active:bg-brand-gold active:text-brand-green"
        >
          Review Order ({cartCount} items) · ₹{cartTotal}
        </button>
      )}

      {/* ---- Cart review / billing sheet ---- */}
      {reviewOpen && (
        <div className="fixed inset-0 z-20 flex items-end bg-black/40">
          <div className="w-full rounded-t-3xl bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-green">Your Bill</h2>
              <button onClick={() => setReviewOpen(false)} className="text-2xl leading-none text-gray-400">
                ×
              </button>
            </div>

            <ul className="max-h-40 space-y-1 overflow-y-auto text-sm">
              {cartLines.map((l) => (
                <li key={l.menuItemId} className="flex justify-between text-gray-700">
                  <span>{l.name} ×{l.quantity}</span>
                  <span>₹{l.price * l.quantity}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 space-y-1 border-t border-dashed border-gray-200 pt-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Taxes (5%)</span><span>₹{cartTax}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-800">
                <span>Total</span><span>₹{cartTotal}</span>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-gray-600">Pay with</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentChoice("cash")}
                  className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-bold ${
                    paymentChoice === "cash" ? "border-brand-green bg-brand-green/10 text-brand-green" : "border-gray-200 text-gray-500"
                  }`}
                >
                  Pay at Counter
                </button>
                <button
                  onClick={() => setPaymentChoice("upi")}
                  className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-bold ${
                    paymentChoice === "upi" ? "border-brand-green bg-brand-green/10 text-brand-green" : "border-gray-200 text-gray-500"
                  }`}
                >
                  Pay via UPI
                </button>
              </div>
            </div>

            <button
              onClick={placeOrder}
              disabled={submitting}
              className="mt-4 w-full rounded-2xl bg-brand-green py-4 text-lg font-bold text-white active:bg-brand-gold active:text-brand-green disabled:opacity-60"
            >
              {submitting ? "Placing order..." : `Confirm Order · ₹${cartTotal}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
