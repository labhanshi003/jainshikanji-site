import Link from "next/link";
import { ReactNode } from "react";

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
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-teal-700 px-4 py-4 text-white shadow">
        {backHref && (
          <Link href={backHref} className="text-2xl leading-none">
            ←
          </Link>
        )}
        <h1 className="text-lg font-bold">{title}</h1>
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}
