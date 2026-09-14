import { Outlet } from "@/types";

export default function OutletCard({ outlet }: { outlet: Outlet }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-brand-green">{outlet.name}</h3>
      <p className="mt-1 text-sm text-gray-600">{outlet.address}</p>
      <p className="mt-2 text-sm text-gray-500">📞 {outlet.phone}</p>
      <p className="text-sm text-gray-500">🕒 {outlet.hours}</p>
      <a
        href={outlet.mapLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-sm font-semibold text-brand-gold hover:underline"
      >
        Get Directions →
      </a>
    </div>
  );
}
