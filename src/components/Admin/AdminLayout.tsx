import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/menu-manager", label: "Menu Manager" },
  { href: "/admin/tables", label: "Tables" },
  { href: "/admin/staff-log", label: "Staff Log" },
];

export default function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      {/* Sidebar — dense, professional, unlike the customer site */}
      <aside className="w-56 shrink-0 bg-admin-navy text-white">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="text-sm font-bold uppercase tracking-wide text-admin-accent">Jain Shikanji</p>
          <p className="text-xs text-white/60">Admin Panel</p>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map((item) => {
            const active = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-admin-accent text-admin-navy" : "text-white/80 hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <Link href="/" className="block px-3 py-2 text-s text-white/50 hover:text-white/80">
            ← Back to website
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <header className="border-b border-gray-200 bg-white px-8 py-4">
          <h1 className="text-lg font-bold text-gray-800">{title}</h1>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
