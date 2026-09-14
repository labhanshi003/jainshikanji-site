import { NextRequest, NextResponse } from "next/server";

// Prototype-level auth: one shared password per role (set via env vars),
// checked here on every request to a protected section. No per-staff
// accounts yet — that's a natural Phase 6 addition once there's a real
// database to store staff users in (see README).
const PROTECTED_PREFIXES: { prefix: string; role: string }[] = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/kitchen", role: "kitchen" },
  { prefix: "/waiter", role: "waiter" },
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const match = PROTECTED_PREFIXES.find((p) => pathname.startsWith(p.prefix));
  if (!match) return NextResponse.next();

  const role = req.cookies.get("staff_role")?.value;
  // Admin can also open Kitchen/Waiter (an owner should be able to check on
  // any section); Kitchen/Waiter logins can only open their own section.
  if (role === match.role || role === "admin") {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/kitchen/:path*", "/waiter/:path*"],
};
