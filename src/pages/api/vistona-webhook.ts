import type { NextApiRequest, NextApiResponse } from "next";

// FUTURE INTEGRATION POINT
// Once Vistona Global is connected, this endpoint will receive order/status
// webhooks (e.g. new order placed, order ready, payment confirmed) and can
// forward them to the CRM, trigger notifications, etc.
// For now it just validates the shape and logs — safe to call, does nothing yet.

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("[vistona-webhook] received (stub):", req.body);

  return res.status(200).json({ received: true, note: "Stub endpoint — not yet wired to Vistona." });
}
