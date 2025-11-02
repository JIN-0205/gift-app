import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { NextResponse } from "next/server";

// GET: 体験談一覧取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const { data, error } = await supabaseAdmin
      .from("success_cases")
      .select(
        `
        *,
        gift:gifts(name)
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: unknown) {
    console.error("Error fetching success cases:", error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: 体験談投稿
export async function POST(request: Request) {
  try {
    const { giftName, title, situation, content } = await request.json();

    if (!giftName || !title || !situation || !content) {
      return NextResponse.json(
        { error: "全ての項目を入力してください" },
        { status: 400 }
      );
    }

    // 1. ギフトを取得または作成
    let gift = await prisma.gift.findFirst({
      where: { name: giftName },
    });

    if (!gift) {
      gift = await prisma.gift.create({
        data: { name: giftName },
      });
    }

    // 2. embeddingを生成
    const text = `タイトル: ${title}\n内容: ${content}\nシチュエーション: ${situation}\nギフト: ${giftName}`;

    const { embedding, usage, response } = await embed({
      model: openai.textEmbeddingModel("text-embedding-3-small"),
      value: text,
    });
    console.log("Embedding usage:", usage);
    console.log("Generated embedding:", response);

    // 3. Supabaseに保存
    const { data: successCase, error } = await supabaseAdmin
      .from("success_cases")
      .insert({
        gift_id: gift.id,
        title,
        content,
        situation,
        embedding: embedding,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: successCase,
      message: "体験談が投稿されました！",
    });
  } catch (error: unknown) {
    console.error("Error creating success case:", error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";
    return NextResponse.json(
      { error: message || "投稿に失敗しました" },
      { status: 500 }
    );
  }
}
