import { useState } from "react";
import Image from "next/image";
import { MenuItem } from "@/types";

export default function MenuCard({ item }: { item: MenuItem }) {
  // Falls back to a plain placeholder block if the photo file listed in
  // menu.json hasn't been added to /public yet — drop the real file in at
  // that exact path and this switches over automatically, no code change.
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-40 bg-brand-cream">
        {!imgFailed ? (
          <Image
            src={item.photo}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            photo coming soon
          </div>
        )}
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
