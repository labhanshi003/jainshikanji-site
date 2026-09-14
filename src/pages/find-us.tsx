import Head from "next/head";
import OutletCard from "@/components/OutletCard";
import outletsData from "@/data/outlets.json";
import { Outlet } from "@/types";

export default function FindUs() {
  const outlets = outletsData as Outlet[];

  return (
    <>
      <Head>
        <title>Find Us — Jain Shikanji</title>
      </Head>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <h1 className="mb-8 text-center text-3xl font-bold text-brand-green">Find Us</h1>
        <div className="grid gap-6 sm:grid-cols-2">
          {outlets.map((o) => (
            <OutletCard key={o.id} outlet={o} />
          ))}
        </div>
      </section>
    </>
  );
}
