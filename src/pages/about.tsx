import Head from "next/head";

const MILESTONES = [
  { year: "1957", text: "Founded by Late Shri Parmatma Sharan Ji & Late Smt. Shakuntala Jain at a 4×4 paan counter in Modinagar." },
  { year: "1993", text: "Satish Jain expands the business with a new outlet in Kadrabad." },
  { year: "1996", text: "Paneer pakodas introduced — pairing with shikanji becomes the brand's most loved identity." },
  { year: "2001", text: "First air-conditioned restaurant in Delhi NCR opens in Kadrabad." },
  { year: "2022", text: "Jain Shikanji launches in PET bottles, now available across 6 states." },
];

export default function About() {
  return (
    <>
      <Head>
        <title>About Us — Jain Shikanji</title>
      </Head>

      <section className="bg-brand-cream py-14 text-center">
        <h1 className="text-3xl font-bold text-brand-green">A Legacy of Refreshment</h1>
        <p className="mt-2 text-gray-600">Est. 1957 · Modinagar</p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14">
        <ol className="space-y-8 border-l-2 border-brand-gold pl-6">
          {MILESTONES.map((m) => (
            <li key={m.year}>
              <span className="mb-1 block text-lg font-bold text-brand-gold">{m.year}</span>
              <p className="text-gray-700">{m.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-brand-green py-14 text-white">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-6 text-center text-2xl font-bold">Why Are We So Popular?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ["Jambiri Lemon", "Acidic, digestive, and refreshing — the chosen lemon for our masala."],
              ["Black Pepper", "Aids digestion and adds a gentle warming depth to every glass."],
              ["Cumin Seeds", "Boosts digestive power and relieves bloating."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-xl bg-white/10 p-5">
                <h3 className="mb-2 font-semibold text-brand-gold">{title}</h3>
                <p className="text-sm text-white/80">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
