import Head from "next/head";
import ContactForm from "@/components/ContactForm";

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact Us — Jain Shikanji</title>
      </Head>

      <section className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="mb-3 text-center text-3xl font-bold text-brand-green">Get In Touch</h1>
        <p className="mb-10 text-center text-gray-600">
          Questions, franchise enquiries, or feedback — we'd love to hear from you.
        </p>
        <ContactForm />
      </section>
    </>
  );
}
