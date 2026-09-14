import type { NextApiRequest, NextApiResponse } from "next";
import { appendRecord, readRecords } from "@/lib/storage";
import { StaffLogEntry } from "@/types";

const FILE = "staff-log.json";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const logs = readRecords<StaffLogEntry>(FILE).sort(
      (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
    );
    return res.status(200).json(logs);
  }

  if (req.method === "POST") {
    const { staffName, action } = req.body ?? {};
    if (!staffName || !action) {
      return res.status(400).json({ error: "staffName and action are required" });
    }
    const entry: StaffLogEntry = { staffName, action, loggedAt: new Date().toISOString() };
    appendRecord<StaffLogEntry>(FILE, entry);
    return res.status(201).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
