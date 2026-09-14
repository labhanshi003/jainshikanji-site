import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const payload = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-4">
      <input
        name="name"
        required
        placeholder="Your name"
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-green focus:outline-none"
      />
      <input
        name="phone"
        required
        placeholder="Phone number"
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-green focus:outline-none"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Email address"
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-green focus:outline-none"
      />
      <textarea
        name="message"
        required
        rows={4}
        placeholder="Your message"
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-green focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-brand-green px-6 py-2.5 font-semibold text-white transition hover:bg-brand-gold hover:text-brand-green disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>

      {status === "success" && (
        <p className="text-sm font-medium text-green-600">
          Thanks! We've received your message.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm font-medium text-red-600">
          Something went wrong — please try again.
        </p>
      )}
    </form>
  );
}
