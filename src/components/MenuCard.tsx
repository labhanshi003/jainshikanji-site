import { MenuItem } from "@/types";

export default function MenuCard({ item }: { item: MenuItem }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex h-40 items-center justify-center bg-brand-cream text-sm text-gray-400">
        {/* Swap for next/image once real product photos are added */}
        photo: {item.photo.split("/").pop()}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-brand-green">{item.name}</h3>
          <span className="font-bold text-brand-gold">₹{item.price}</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">{item.description}</p>
      </div>
    </div>
  );
}
