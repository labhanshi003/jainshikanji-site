import type { NextApiRequest, NextApiResponse } from "next";
import { addOrder, buildOrder } from "@/lib/ordersStore";

// DEV/DEMO ONLY. Phases 4 (Waiter) and 5 (QR Ordering) create real orders
// through POST /api/orders instead. This exists purely so the Kitchen Screen
// (and now the billing/tracking UI) has something to display before a real
// order has been placed. Goes through the same buildOrder() as real orders,
// so demo orders get real prices, tax, total, and an estimated ready time too.

const DEMO_ORDERS = [
  {
    tableId: "t1", tableName: "Table 1", source: "manual" as const,
    items: [
      { menuItemId: "d1", quantity: 2 }, // Classic Jain Shikanji
      { menuItemId: "s1", quantity: 1 }, // Paneer Pakoda
    ],
  },
  {
    tableId: "t3", tableName: "Table 3", source: "manual" as const,
    items: [
      { menuItemId: "s1", quantity: 2 }, // Paneer Pakoda
      { menuItemId: "m1", quantity: 1 }, // Chole Bhature
    ],
  },
  {
    tableId: "t4", tableName: "Table 4", source: "manual" as const,
    items: [
      { menuItemId: "d1", quantity: 1 }, // Classic Jain Shikanji
      { menuItemId: "d2", quantity: 3 }, // Masala Shikanji
    ],
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let all;
  for (const demo of DEMO_ORDERS) {
    const order = buildOrder(demo);
    all = addOrder(order);
  }

  return res.status(201).json(all);
}
