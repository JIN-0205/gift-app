import { prisma } from "@/lib/prisma";
import { Gift } from "@prisma/client";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { ids }: { ids: string[] } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Response.json({ error: "Invalid gift IDs" }, { status: 400 });
    }

    console.log("[gifts/batch] Requested IDs:", ids);

    const gifts: Gift[] = await prisma.gift.findMany({
      where: { id: { in: ids } },
    });

    console.log("[gifts/batch] Found gifts:", gifts.length);

    const giftsById = new Map<string, Gift>(
      gifts.map((gift: Gift) => [gift.id, gift])
    );
    const orderedGifts = ids
      .map((id) => giftsById.get(id))
      .filter((gift): gift is (typeof gifts)[number] => Boolean(gift));

    const missingIds = ids.filter((id) => !giftsById.has(id));
    if (missingIds.length > 0) {
      console.warn("[gifts/batch] Missing gift IDs:", missingIds);
    }

    return Response.json(orderedGifts);
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
