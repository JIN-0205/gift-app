import { SuccessCaseCard } from "@/components/SuccessCaseCard";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface SuccessCaseWithGift {
  id: string;
  gift_id: string;
  title: string;
  content: string;
  situation: string;
  created_at: string;
  updated_at: string;
  gift: {
    name: string;
  };
}

async function getSuccessCases() {
  try {
    const { data, error } = await supabase
      .from("success_cases")
      .select(
        `
        *,
        gift:gifts(name)
      `
      )
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return (data || []) as SuccessCaseWithGift[];
  } catch (error) {
    console.error("Error fetching success cases:", error);
    return [];
  }
}

export default async function CasesPage() {
  const cases = await getSuccessCases();

  return (
    <div className="container-custom py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          みんなの体験談
        </h1>
        <p className="text-gray-600">
          実際にギフトを贈った人たちの体験談を参考にしましょう
        </p>
      </div>

      {cases.length > 0 ? (
        <div className="space-y-6">
          {cases.map((successCase) => (
            <SuccessCaseCard
              key={successCase.id}
              {...successCase}
              giftName={successCase.gift?.name}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4 text-lg">
            まだ体験談が投稿されていません
          </p>
          <Link
            href="/post"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            最初の体験談を投稿する
          </Link>
        </div>
      )}
    </div>
  );
}
