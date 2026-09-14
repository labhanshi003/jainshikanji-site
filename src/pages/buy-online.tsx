import Head from "next/head";

const PLATFORMS = [
  { name: "Blinkit", url: "https://blinkit.com" },
  { name: "Zepto", url: "https://zeptonow.com" },
  { name: "BigBasket", url: "https://bigbasket.com" },
  { name: "Instamart", url: "https://swiggy.com/instamart" },
  { name: "Reliance Smart", url: "https://relianceretail.com" },
];

export default function BuyOnline() {
  return (
    <>
      <Head>
        <title>Buy Online — Jain Shikanji</title>
      </Head>

      <section className="mx-auto max-w-4xl px-4 py-14 text-center">
        <h1 className="mb-3 text-3xl font-bold text-brand-green">Buy Online</h1>
        <p className="mb-10 text-gray-600">
          Bottled Jain Shikanji is available across 6 states on all leading
          quick-commerce platforms.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {PLATFORMS.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-gray-200 bg-white p-6 font-semibold text-brand-green shadow-sm transition hover:border-brand-gold hover:shadow-md"
            >
              {p.name}
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
