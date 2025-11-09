import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { NextResponse } from "next/server";

// 管理者用: 既存ギフトのembeddingを一括生成
export async function POST(request: Request) {
  try {
    // セキュリティ: 本番環境では認証を追加してください
    const { adminKey } = await request.json();

    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // embeddingがないギフトを取得
    const gifts = await prisma.gift.findMany({
      where: {
        // Prismaではembeddingフィールドが存在しない場合があるので、
        // すべてのギフトを取得して後でフィルタリング
      },
    });

    console.log(`Found ${gifts.length} gifts to process`);

    let processedCount = 0;
    let errorCount = 0;

    // 各ギフトのembeddingを生成
    for (const gift of gifts) {
      try {
        // ギフト情報をテキスト化
        const text = `ギフト名: ${gift.name}${
          gift.description ? `\n説明: ${gift.description}` : ""
        }${gift.category ? `\nカテゴリー: ${gift.category}` : ""}${
          gift.price ? `\n価格: ${gift.price}円` : ""
        }`;

        console.log(`Processing gift: ${gift.name}`);

        // embeddingを生成
        const { embedding } = await embed({
          model: openai.embedding("text-embedding-3-small"),
          value: text,
        });

        // Supabaseに保存
        const { error } = await supabaseAdmin
          .from("gifts")
          .update({ embedding })
          .eq("id", gift.id);

        if (error) {
          console.error(`Error updating gift ${gift.id}:`, error);
          errorCount++;
        } else {
          processedCount++;
          console.log(`✓ Processed: ${gift.name}`);
        }

        // レート制限対策: 少し待機
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing gift ${gift.id}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Embeddings generated successfully`,
      processed: processedCount,
      errors: errorCount,
      total: gifts.length,
    });
  } catch (error: unknown) {
    console.error("Error generating embeddings:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
