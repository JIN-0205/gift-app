// import { openai } from "@ai-sdk/openai";
// import { convertToModelMessages, streamText, UIMessage } from "ai";

// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30;

// export async function POST(req: Request) {
//   const { messages }: { messages: UIMessage[] } = await req.json();

//   const result = streamText({
//     model: openai("gpt-4o"),
//     messages: convertToModelMessages(messages),
//   });

//   return result.toUIMessageStreamResponse();
// }

import { supabaseAdmin } from "@/lib/supabase";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, embed, streamText, UIMessage } from "ai";

// 型定義: Supabase関数 match_success_cases の戻り値
interface SimilarCase {
  id: string;
  gift_id: string;
  title: string;
  content: string;
  situation: string;
  similarity: number;
}

// 型定義: Giftテーブルのベクトル検索結果
interface SimilarGift {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  similarity: number;
}

// ヘルパー関数: UIMessageからテキストを安全に取得
function getTextFromMessage(message: UIMessage): string {
  const textPart = message.parts?.find((part) => part.type === "text");
  if (textPart && textPart.type === "text") {
    return textPart.text;
  }
  return "";
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "メッセージが空です" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const lastMessage = messages[messages.length - 1];
    const userText = getTextFromMessage(lastMessage);

    if (!userText) {
      return new Response(
        JSON.stringify({ error: "テキストメッセージが見つかりません" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("User message:", userText);

    // RAG: ユーザーメッセージをembedding化
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: userText,
    });

    // ステップ1: 類似体験談を検索
    const { data: similarCases, error: searchError } = await supabaseAdmin.rpc(
      "match_success_cases",
      {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 5,
      }
    );

    if (searchError) {
      console.error("Success cases search error:", searchError);
    }

    const typedSimilarCases = (similarCases || []) as SimilarCase[];
    console.log(`Found ${typedSimilarCases.length} similar cases`);

    // ステップ2: 体験談が少ない場合、giftテーブルからも検索
    let giftContext = "";
    const recommendedGiftIdSet = new Set<string>();

    // 類似体験談からギフトIDを収集
    typedSimilarCases.forEach((c) => {
      if (c.gift_id) {
        recommendedGiftIdSet.add(c.gift_id);
      }
    });

    if (typedSimilarCases.length < 3) {
      console.log("Searching gifts as fallback...");

      // giftsテーブル用の検索関数を呼び出し（存在する場合）
      const { data: similarGifts, error: giftSearchError } =
        await supabaseAdmin.rpc("match_gifts", {
          query_embedding: embedding,
          match_threshold: 0.5,
          match_count: 5,
        });
      console.log("Similar gifts data:", similarGifts);

      if (giftSearchError) {
        console.log(
          "Gift search not available or error:",
          giftSearchError.message
        );
      } else if (similarGifts && similarGifts.length > 0) {
        const typedSimilarGifts = similarGifts as SimilarGift[];
        console.log(`Found ${typedSimilarGifts.length} similar gifts`);

        // ギフトIDを保存
        typedSimilarGifts.forEach((g) => recommendedGiftIdSet.add(g.id));

        giftContext =
          "\n\n【関連するギフト】\n" +
          typedSimilarGifts
            .map(
              (g: SimilarGift, index: number) =>
                `${index + 1}. ${g.name}${
                  g.description ? `: ${g.description}` : ""
                } (類似度: ${(g.similarity * 100).toFixed(1)}%)`
            )
            .join("\n");
      }
    }

    // コンテキストを構築
    const casesContext =
      typedSimilarCases.length > 0
        ? typedSimilarCases
            .map(
              (c: SimilarCase, index: number) =>
                `【体験談${index + 1}: ${c.title}】\nシチュエーション: ${
                  c.situation
                }\n内容: ${c.content}\n(類似度: ${(c.similarity * 100).toFixed(
                  1
                )}%)`
            )
            .join("\n\n")
        : "";

    const recommendedGiftIds = Array.from(recommendedGiftIdSet);

    const context =
      casesContext || giftContext
        ? casesContext + giftContext
        : "まだ参考になる体験談やギフト情報がありません。一般的な知識から提案します。";

    console.log("Final context length:", context.length);
    console.log("Final context:", context);

    // LLMでストリーミング応答（ギフトIDを含めて返す）
    const result = streamText({
      model: openai("gpt-3.5-turbo"),
      system: `あなたはギフト提案の専門家です。以下の実際の体験談を参考に、ユーザーに最適なギフトを提案してください。

【参考になる体験談】
${context}

提案する際は以下の点に注意してください：
- 具体的なギフト名を提案する
- なぜそのギフトが適しているか理由を説明する
- 予算や相手との関係性を考慮する
- 体験談がある場合は、それを引用して説得力を持たせる
- 日本語で自然な会話口調で回答する
${
  recommendedGiftIds.length > 0
    ? "\n\n回答の最後に、以下のような形式でおすすめギフトIDを追加してください（ユーザーには見えません）：\n[RECOMMENDED_GIFTS:" +
      recommendedGiftIds.join(",") +
      "]"
    : ""
}`,
      messages: convertToModelMessages(messages),
      temperature: 0.7,
      onFinish: async ({ text }) => {
        try {
          // TODO: 会話履歴の保存機能を実装する場合はここに追加
          console.log("Assistant response completed:", text.substring(0, 100));
          console.log("Recommended gift IDs:", recommendedGiftIds);
        } catch (error) {
          console.error("Error in onFinish:", error);
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
