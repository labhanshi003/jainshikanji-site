import type { NextApiRequest, NextApiResponse } from "next";
import { readAll, updateById, addRecord, deleteById } from "@/lib/adminStore";
import { MenuItem } from "@/types";

const FILE = "menu.json";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET": {
      return res.status(200).json(readAll<MenuItem>(FILE));
    }

    case "POST": {
      const { category, name, description, price, photo } = req.body ?? {};
      if (!category || !name || price == null) {
        return res.status(400).json({ error: "category, name and price are required" });
      }
      const newItem: MenuItem = {
        id: `${category.slice(0, 1).toLowerCase()}${Date.now()}`,
        category,
        name,
        description: description ?? "",
        price: Number(price),
        photo: photo ?? "/images/menu/placeholder.jpg",
        available: true,
      };
      const all = addRecord<MenuItem>(FILE, newItem);
      return res.status(201).json(all);
    }

    case "PUT": {
      const { id, ...patch } = req.body ?? {};
      if (!id) return res.status(400).json({ error: "id is required" });
      const all = updateById<MenuItem>(FILE, id, patch);
      return res.status(200).json(all);
    }

    case "DELETE": {
      const { id } = req.body ?? {};
      if (!id) return res.status(400).json({ error: "id is required" });
      const all = deleteById<MenuItem>(FILE, id);
      return res.status(200).json(all);
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}
