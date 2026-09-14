import Link from "next/link";
import { ReactNode } from "react";
import { staffLogout } from "@/lib/authClient";

export default function WaiterLayout({
  children,
  title,
  backHref,
}: {
  children: ReactNode;
  title: string;
  backHref?: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-teal-700 px-4 py-4 text-white shadow">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link href={backHref} className="text-2xl leading-none">
              ←
            </Link>
          )}
          <h1 className="text-lg font-bold">{title}</h1>
        </div>
        <button onClick={staffLogout} className="text-xs text-white/70 hover:text-white">
          Logout
        </button>
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}
