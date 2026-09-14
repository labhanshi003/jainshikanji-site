import type { NextApiRequest, NextApiResponse } from "next";
import {
  getAllOrders,
  addOrder,
  buildOrder,
  setOrderItemStatus,
  setOrderStatus,
  setPaymentStatus,
} from "@/lib/ordersStore";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET": {
      const { status } = req.query;
      const all = getAllOrders();
      const filtered = status ? all.filter((o) => o.status === status) : all;
      return res.status(200).json(filtered);
    }

    case "POST": {
      // Used by Waiter (Phase 4) and QR Ordering (Phase 5) to create new orders.
      // Only menuItemId + quantity are trusted from the client — buildOrder looks
      // up the real name/price from menu.json and computes the bill server-side.
      const { tableId, tableName, items, source, paymentMethod } = req.body ?? {};
      if (!tableId || !tableName || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "tableId, tableName and items[] are required" });
      }
      const order = buildOrder({
        tableId,
        tableName,
        items,
        source: source ?? "manual",
        paymentMethod,
      });
      const all = addOrder(order);
      return res.status(201).json(all);
    }

    case "PUT": {
      // Three update shapes:
      //  { orderId, menuItemId, itemStatus }  → mark one item within an order ready/pending
      //  { orderId, orderStatus }             → mark the whole order active/completed
      //  { orderId, paymentStatus }           → mark the bill paid/pending
      const { orderId, menuItemId, itemStatus, orderStatus, paymentStatus } = req.body ?? {};
      if (!orderId) return res.status(400).json({ error: "orderId is required" });

      if (menuItemId && itemStatus) {
        return res.status(200).json(setOrderItemStatus(orderId, menuItemId, itemStatus));
      }
      if (orderStatus) {
        return res.status(200).json(setOrderStatus(orderId, orderStatus));
      }
      if (paymentStatus) {
        return res.status(200).json(setPaymentStatus(orderId, paymentStatus));
      }
      return res.status(400).json({
        error: "Provide (menuItemId + itemStatus), orderStatus, or paymentStatus",
      });
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}
