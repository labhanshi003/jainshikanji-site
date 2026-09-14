import type { NextApiRequest, NextApiResponse } from "next";
import { appendRecord } from "@/lib/storage";
import { ContactLead } from "@/types";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, phone, email, message } = req.body ?? {};
  if (!name || !phone || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const lead: ContactLead = {
    name,
    phone,
    email,
    message,
    submittedAt: new Date().toISOString(),
  };

  try {
    appendRecord<ContactLead>("contact-leads.json", lead);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not save your message" });
  }
}
