import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function NewsletterForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="Your email"
          className="w-full rounded-lg border-0 px-3 py-2 text-sm text-gray-800 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 rounded-lg bg-brand-gold px-3 py-2 text-sm font-semibold text-brand-green disabled:opacity-60"
        >
          Sign Up
        </button>
      </div>
      {status === "success" && (
        <p className="text-xs text-brand-gold">Subscribed — thank you!</p>
      )}
      {status === "error" && (
        <p className="text-xs text-red-300">Couldn't subscribe, try again.</p>
      )}
    </form>
  );
}
