import Head from "next/head";

export default function SocialBits() {
  return (
    <>
      <Head>
        <title>Social Bits — Jain Shikanji</title>
      </Head>

      <section className="mx-auto max-w-5xl px-4 py-14 text-center">
        <h1 className="mb-3 text-3xl font-bold text-brand-green">Social Bits</h1>
        <p className="mb-10 text-gray-600">
          Follow us for brand moments, press mentions, and everyday shikanji love.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
  {[
    "/images/instagram-1.jpg",
    "/images/instagram-2.jpg",
    "/images/instagram-3.jpg",
    "/images/instagram-4.jpg",
    "/images/instagram-5.jpg",
    "/images/instagram-6.jpg",
    "/images/instagram-7.jpg",
    "/images/instagram-8.jpg",
  ].map((image, i) => (
    <div
      key={i}
      className="aspect-square overflow-hidden rounded-lg"
    >
      <img
        src={image}
        alt={`Jain Shikanji ${i + 1}`}
        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
      />
    </div>
  ))}
</div>

        <div className="mt-8 flex justify-center gap-4">
          <a href="https://www.instagram.com/jainshikanjiofficial/" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-gold hover:underline">
            @jainshikanjiofficial on Instagram →
          </a>
        </div>
      </section>
    </>
  );
}
