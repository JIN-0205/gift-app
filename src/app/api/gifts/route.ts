import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "12");

    const gifts = await prisma.gift.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ data: gifts });
  } catch (error: unknown) {
    console.error("Error fetching gifts:", error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: 新しいギフトを作成（embeddingも自動生成）
export async function POST(request: Request) {
  try {
    const { name, description, category, price, imageUrl } =
      await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "ギフト名は必須です" },
        { status: 400 }
      );
    }

    // 1. Prismaでギフトを作成
    const gift = await prisma.gift.create({
      data: {
        name,
        description,
        category,
        price,
        imageUrl,
      },
    });

    // 2. embeddingを生成
    const text = `ギフト名: ${name}${
      description ? `\n説明: ${description}` : ""
    }${category ? `\nカテゴリー: ${category}` : ""}${
      price ? `\n価格: ${price}円` : ""
    }`;

    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: text,
    });

    // 3. Supabaseでembeddingを更新
    const { error: updateError } = await supabaseAdmin
      .from("gifts")
      .update({ embedding })
      .eq("id", gift.id);

    if (updateError) {
      console.error("Error updating embedding:", updateError);
      // embeddingの保存に失敗してもギフト自体は作成されている
    }

    return NextResponse.json({
      success: true,
      data: gift,
      message: "ギフトが作成されました",
    });
  } catch (error: unknown) {
    console.error("Error creating gift:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
