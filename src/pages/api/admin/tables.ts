import type { NextApiRequest, NextApiResponse } from "next";
import { readAll, updateById, addRecord, deleteById } from "@/lib/adminStore";
import { RestaurantTable } from "@/types";

const FILE = "tables.json";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET": {
      return res.status(200).json(readAll<RestaurantTable>(FILE));
    }

    case "POST": {
      const { name, area, seats } = req.body ?? {};
      if (!name || !area || !seats) {
        return res.status(400).json({ error: "name, area and seats are required" });
      }
      const newTable: RestaurantTable = {
        id: `t${Date.now()}`,
        name,
        area,
        seats: Number(seats),
        status: "free",
      };
      const all = addRecord<RestaurantTable>(FILE, newTable);
      return res.status(201).json(all);
    }

    case "PUT": {
      const { id, ...patch } = req.body ?? {};
      if (!id) return res.status(400).json({ error: "id is required" });
      const all = updateById<RestaurantTable>(FILE, id, patch);
      return res.status(200).json(all);
    }

    case "DELETE": {
      const { id } = req.body ?? {};
      if (!id) return res.status(400).json({ error: "id is required" });
      const all = deleteById<RestaurantTable>(FILE, id);
      return res.status(200).json(all);
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}
