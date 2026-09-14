import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";

export default function Footer() {
  return (
    <footer className="bg-brand-green text-white/90">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <h3 className="mb-3 text-lg font-bold text-white">Jain Shikanji</h3>
          <p className="text-sm text-white/70">
            Est. 1957, Modinagar. Crazy about quality — refreshing since generations.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-brand-gold">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/menu">Menu</Link></li>
            <li><Link href="/find-us">Find Us</Link></li>
            <li><Link href="/buy-online">Buy Online</Link></li>
            <li><Link href="/social-bits">Social Bits</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-brand-gold">Contact</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li>+91-9219448748</li>
            <li>Kadrabad, Modinagar, Ghaziabad – 201201</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-brand-gold">Newsletter</h4>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Jain Shikanji — Website prototype
      </div>
    </footer>
  );
}
