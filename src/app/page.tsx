import { GiftCard } from "@/components/GiftCard";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { Gift } from "@prisma/client";
import Link from "next/link";

type GiftWithCases = Gift & { casesCount: number };

async function getGifts(): Promise<GiftWithCases[]> {
  try {
    const gifts = await prisma.gift.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    if (gifts.length === 0) {
      return [];
    }

    const giftIds = gifts.map((gift) => gift.id);

    const successCaseCounts =
      await prisma.$queryRaw<
        { gift_id: string; cases_count: number | bigint }[]
      >(Prisma.sql`
        SELECT gift_id, COUNT(*)::int AS cases_count
        FROM success_cases
        WHERE gift_id IN (${Prisma.join(
          giftIds.map((giftId) => Prisma.sql`${giftId}::uuid`)
        )})
        GROUP BY gift_id
      `);

    const countsMap = new Map(
      successCaseCounts.map(({ gift_id, cases_count }) => [
        gift_id,
        Number(cases_count),
      ])
    );

    return gifts.map((gift) => ({
      ...gift,
      casesCount: countsMap.get(gift.id) ?? 0,
    }));
  } catch (error) {
    console.error("Error fetching gifts:", error);
    return [];
  }
}

export default async function HomePage() {
  const gifts = await getGifts();

  return (
    <div className="container-custom py-12">
      {/* ヒーローセクション */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Gift Finder</h1>
        <p className="text-xl text-gray-600 mb-8">
          AIがあなたに最適なギフトを提案します
        </p>
        <Link
          href="/chat"
          className="inline-block bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          💬 チャットで相談する
        </Link>
      </div>

      {/* ギフト一覧 */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">人気のギフト</h2>

        {gifts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gifts.map((gift) => (
              <GiftCard key={gift.id} {...gift} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">まだギフトが登録されていません</p>
            <Link href="/post" className="text-blue-600 hover:underline">
              最初の体験談を投稿する →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
