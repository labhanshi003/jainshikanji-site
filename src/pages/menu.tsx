import Head from "next/head";
import { useState } from "react";
import MenuCard from "@/components/MenuCard";
import menuData from "@/data/menu.json";
import { MenuItem } from "@/types";

const CATEGORIES: MenuItem["category"][] = [
  "Signature Drinks",
  "Legendary Snacks",
  "Hearty Meals",
];

export default function Menu() {
  const [active, setActive] = useState<MenuItem["category"]>("Signature Drinks");
  const items = (menuData as MenuItem[]).filter((i) => i.category === active);

  return (
    <>
      <Head>
        <title>Menu — Jain Shikanji</title>
      </Head>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="mb-8 text-center text-3xl font-bold text-brand-green">
          Things We Make
        </h1>

        <div className="mb-8 flex justify-center gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                active === cat
                  ? "bg-brand-green text-white"
                  : "bg-brand-cream text-brand-green hover:bg-brand-gold/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </>
  );
}
