import { buildRecommendationContext } from "@/lib/recommendations";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message }: { message?: string } = await request.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return Response.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    const { recommendedGiftIds } = await buildRecommendationContext(message);

    if (recommendedGiftIds.length === 0) {
      return Response.json([]);
    }

    console.log(
      "[gifts/recommendations] Recommended IDs:",
      recommendedGiftIds
    );

    const gifts = await prisma.gift.findMany({
      where: { id: { in: recommendedGiftIds } },
    });

    const giftsById = new Map(gifts.map((gift) => [gift.id, gift]));
    const orderedGifts = recommendedGiftIds
      .map((id) => giftsById.get(id))
      .filter((gift): gift is (typeof gifts)[number] => Boolean(gift));

    const missingIds = recommendedGiftIds.filter((id) => !giftsById.has(id));
    if (missingIds.length > 0) {
      console.warn("[gifts/recommendations] Missing gift IDs:", missingIds);
    }

    return Response.json(orderedGifts);
  } catch (error) {
    console.error("[gifts/recommendations] API error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
