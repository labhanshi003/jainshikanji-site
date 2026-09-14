import type { NextApiRequest, NextApiResponse } from "next";
import { appendRecord } from "@/lib/storage";
import { NewsletterSubscriber } from "@/types";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body ?? {};
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const subscriber: NewsletterSubscriber = {
    email,
    subscribedAt: new Date().toISOString(),
  };

  try {
    appendRecord<NewsletterSubscriber>("newsletter.json", subscriber);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not subscribe" });
  }
}
