import { Gift } from "@/lib/types";

interface GiftCardProps extends Gift {
  casesCount?: number;
}

export function GiftCard({
  name,
  category,
  price,
  casesCount = 0,
}: GiftCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
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
    </div>
  );
}
