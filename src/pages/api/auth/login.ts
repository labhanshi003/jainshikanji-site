import type { NextApiRequest, NextApiResponse } from "next";

const ROLE_PASSWORDS: Record<string, string | undefined> = {
  admin: process.env.ADMIN_PASSWORD,
  kitchen: process.env.KITCHEN_PASSWORD,
  waiter: process.env.WAITER_PASSWORD,
};

const SESSION_HOURS = 12;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { role, password } = req.body ?? {};
  const expected = ROLE_PASSWORDS[role];

  if (!expected) {
    return res.status(500).json({ error: `No password configured for role "${role}" — check .env.local` });
  }
  if (password !== expected) {
    return res.status(401).json({ error: "Wrong password" });
  }

  res.setHeader(
    "Set-Cookie",
    `staff_role=${role}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_HOURS * 60 * 60}`
  );
  return res.status(200).json({ success: true });
}
