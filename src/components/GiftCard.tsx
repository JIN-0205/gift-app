import Image from "next/image";

import { Gift } from "@/lib/types";
import Link from "next/link";

interface GiftCardProps extends Gift {
  casesCount?: number;
}

export function GiftCard({
  name,
  category,
  price,
  imageUrl,
  url,
  casesCount = 0,
}: GiftCardProps) {
  return (
    <Link
      href={url ?? "#"}
      target="_blank"
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      {imageUrl && (
        <div className="relative w-full h-40 mb-4 overflow-hidden rounded-md border border-gray-100">
          <Image
            src={imageUrl + "?auto=format&fit=max&w=1200&q=80"}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            // priority={false}
            loading="eager"
          />
        </div>
      )}

      <h3 className="text-xl font-semibold text-gray-900 mb-2">{name}</h3>

      {category && (
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
          {category}
        </span>
      )}

      {price && (
        <p className="text-2xl font-bold text-blue-600 mb-2">
          ¥{price.toLocaleString()}
        </p>
      )}

      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-gray-500">📝 {casesCount}件の体験談</p>
      </div>
    </Link>
  );
}
