import fs from "fs";
import path from "path";
import { Order, OrderItem, MenuItem } from "@/types";
import { readAll } from "@/lib/adminStore";

// Orders are transactional runtime data (not site content), so — like
// src/lib/storage.ts — this reads/writes under /data, not src/data.
// Kept as its own file (rather than reusing adminStore.ts) because orders
// need nested updates (one item's status inside one order) that plain
// updateById can't express.

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "orders.json");
const TAX_RATE = 0.05; // 5% flat placeholder GST for the prototype bill

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]", "utf-8");
}

export function getAllOrders(): Order[] {
  ensureFile();
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

function saveAll(orders: Order[]) {
  fs.writeFileSync(FILE, JSON.stringify(orders, null, 2) + "\n", "utf-8");
}

export function addOrder(order: Order): Order[] {
  const all = getAllOrders();
  all.push(order);
  saveAll(all);
  return all;
}

// Builds a complete Order — looks up each item's live price from menu.json
// (never trusts a price the client might send), then computes the bill and
// an estimated ready time. Used by both the real order-creation endpoint and
// the demo seed endpoint, so billing/tracking logic lives in exactly one place.
export function buildOrder(input: {
  tableId: string;
  tableName: string;
  items: { menuItemId: string; quantity: number }[];
  source: Order["source"];
  paymentMethod?: Order["paymentMethod"];
}): Order {
  const menu = readAll<MenuItem>("menu.json");

  const items: OrderItem[] = input.items.map((i) => {
    const menuItem = menu.find((m) => m.id === i.menuItemId);
    return {
      menuItemId: i.menuItemId,
      name: menuItem?.name ?? "Unknown item",
      quantity: i.quantity,
      price: menuItem?.price ?? 0,
      status: "pending",
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  // Simple, transparent estimate: a base prep time plus a couple of minutes
  // per item ordered, capped so a huge order doesn't show a silly ETA.
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
  const estimateMinutes = Math.min(40, 8 + totalQty * 2);

  return {
    id: `o${Date.now()}`,
    tableId: input.tableId,
    tableName: input.tableName,
    items,
    status: "active",
    source: input.source,
    createdAt: new Date().toISOString(),
    subtotal,
    tax,
    total,
    estimatedReadyAt: new Date(Date.now() + estimateMinutes * 60000).toISOString(),
    paymentMethod: input.paymentMethod ?? "cash",
    paymentStatus: "pending",
  };
}

export function setOrderItemStatus(
  orderId: string,
  menuItemId: string,
  status: "pending" | "ready"
): Order[] {
  const all = getAllOrders();
  const updated = all.map((order) => {
    if (order.id !== orderId) return order;
    return {
      ...order,
      items: order.items.map((item) =>
        item.menuItemId === menuItemId ? { ...item, status } : item
      ),
    };
  });
  saveAll(updated);
  return updated;
}

export function setOrderStatus(orderId: string, status: "active" | "completed"): Order[] {
  const all = getAllOrders();
  const updated = all.map((order) => (order.id === orderId ? { ...order, status } : order));
  saveAll(updated);
  return updated;
}

export function setPaymentStatus(orderId: string, paymentStatus: "pending" | "paid"): Order[] {
  const all = getAllOrders();
  const updated = all.map((order) => (order.id === orderId ? { ...order, paymentStatus } : order));
  saveAll(updated);
  return updated;
}
