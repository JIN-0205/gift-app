import { SuccessCase } from "@/lib/types";

interface SuccessCaseCardProps extends SuccessCase {
  giftName?: string;
}

export function SuccessCaseCard({
  title,
  content,
  situation,
  giftName,
  created_at,
}: SuccessCaseCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>

      <div className="flex gap-2 mb-3 flex-wrap">
        {giftName && (
          <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
            🎁 {giftName}
          </span>
        )}
        <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
          📍 {situation}
        </span>
      </div>

      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{content}</p>

      <time className="text-sm text-gray-500">
        {new Date(created_at).toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </time>
    </article>
  );
}
