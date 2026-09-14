import Head from "next/head";
import Hero from "@/components/Hero";
import MenuCard from "@/components/MenuCard";
import menuData from "@/data/menu.json";
import { MenuItem } from "@/types";
import Link from "next/link";

export default function Home() {
  const featured = (menuData as MenuItem[]).slice(0, 3);

  return (
    <>
      <Head>
        <title>Jain Shikanji — Crazy About Quality</title>
      </Head>

      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
            Handpicked
          </p>
          <h2 className="text-3xl text-brand-green">Fan Favourites</h2>
          <div className="mx-auto mt-3 h-px w-16 bg-brand-gold" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {featured.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/menu"
            className="font-semibold text-brand-gold underline decoration-brand-gold/40 underline-offset-4 transition hover:text-brand-green"
          >
            View Full Menu →
          </Link>
        </div>
      </section>

      <section className="bg-brand-green py-20 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
            Our Heritage
          </p>
          <h2 className="text-3xl">A Legacy Since 1957</h2>
          <div className="mx-auto mt-3 h-px w-16 bg-brand-gold" />
          <p className="mt-5 text-white/80">
            From a 4×4 paan counter in Modinagar to a brand loved across 6 states —
            read the full story of Jain Shikanji.
          </p>
          <Link
            href="/about"
            className="mt-7 inline-block rounded-full bg-brand-gold px-7 py-3 font-semibold text-brand-green transition hover:bg-white"
          >
            Our Story
          </Link>
        </div>
      </section>
    </>
  );
}
