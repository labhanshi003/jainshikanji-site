import type { NextApiRequest, NextApiResponse } from "next";
import { readAll } from "@/lib/adminStore";
import { readRecords } from "@/lib/storage";
import { getAllOrders } from "@/lib/ordersStore";
import { MenuItem, RestaurantTable, ContactLead, NewsletterSubscriber, DashboardStats } from "@/types";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const menu = readAll<MenuItem>("menu.json");
  const tables = readAll<RestaurantTable>("tables.json");
  const leads = readRecords<ContactLead>("contact-leads.json");
  const subscribers = readRecords<NewsletterSubscriber>("newsletter.json");
  const orders = getAllOrders();

  const today = new Date().toDateString();
  const todaysOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today);

  const stats: DashboardStats = {
    totalMenuItems: menu.length,
    activeMenuItems: menu.filter((m) => m.available).length,
    totalTables: tables.length,
    contactLeads: leads.length,
    newsletterSubscribers: subscribers.length,
    activeOrders: orders.filter((o) => o.status === "active").length,
    todaysRevenue: todaysOrders.reduce((sum, o) => sum + o.total, 0),
  };

  return res.status(200).json(stats);
}
