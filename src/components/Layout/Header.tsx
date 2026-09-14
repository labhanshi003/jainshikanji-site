import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/menu", label: "Menu" },
  { href: "/find-us", label: "Find Us" },
  { href: "/buy-online", label: "Buy Online" },
  { href: "/social-bits", label: "Social Bits" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-brand-green text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-wide">
          Jain Shikanji
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/90 transition hover:text-brand-gold"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/order-now"
            className="rounded-full bg-brand-gold px-4 py-1.5 text-sm font-semibold text-brand-green transition hover:bg-white"
          >
            Order Now
          </Link>
        </nav>

        <button
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          <span className="block h-0.5 w-6 bg-white mb-1.5" />
          <span className="block h-0.5 w-6 bg-white mb-1.5" />
          <span className="block h-0.5 w-6 bg-white" />
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/90"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/order-now"
            className="w-fit rounded-full bg-brand-gold px-4 py-1.5 text-sm font-semibold text-brand-green"
            onClick={() => setOpen(false)}
          >
            Order Now
          </Link>
        </div>
      )}
    </header>
  );
}
