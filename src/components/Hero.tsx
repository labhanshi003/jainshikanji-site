import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-cream">
      {/* Subtle decorative backdrop — large soft circles, not imagery, so it
          stays lightweight and works before real product photography exists */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-green/5" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-gold/10" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-7 px-4 py-28 text-center">
        <span className="rounded-full border border-brand-green/20 bg-white/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-green">
          Est. 1957 · Modinagar
        </span>

        <h1 className="text-5xl leading-tight text-brand-green md:text-6xl">
          Crazy About Quality
        </h1>

        <div className="h-px w-16 bg-brand-gold" />

        <p className="max-w-lg text-lg text-gray-600">
          The original Jain Shikanji — a family recipe of spiced lemonade and
          legendary pakodas, loved across Delhi NCR for over 60 years.
        </p>

        <div className="mt-2 flex flex-wrap justify-center gap-4">
          <Link
            href="/menu"
            className="rounded-full bg-brand-green px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-gold hover:text-brand-green hover:shadow-md"
          >
            See Our Menu
          </Link>
          <Link
            href="/order-now"
            className="rounded-full border-2 border-brand-green px-7 py-3 font-semibold text-brand-green transition hover:bg-brand-green hover:text-white"
          >
            Order Now
          </Link>
        </div>
      </div>
    </section>
  );
}
