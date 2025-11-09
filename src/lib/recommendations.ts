import { supabaseAdmin } from "@/lib/supabase";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

export interface SimilarCase {
  id: string;
  gift_id: string | null;
  title: string;
  content: string;
  situation: string;
  similarity: number;
}

export interface SimilarGift {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  similarity: number;
}

export interface RecommendationContext {
  context: string;
  recommendedGiftIds: string[];
  similarCases: SimilarCase[];
  similarGifts: SimilarGift[];
}

type RecommendationCandidate = {
  id: string;
  similarity: number;
};

const DEFAULT_FALLBACK_MESSAGE =
  "まだ参考になる体験談やギフト情報がありません。一般的な知識から提案します。";

export async function buildRecommendationContext(
  userText: string
): Promise<RecommendationContext> {
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: userText,
  });

  const { data: similarCases, error: caseSearchError } =
    await supabaseAdmin.rpc("match_success_cases", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 5,
    });

  if (caseSearchError) {
    console.error("Success cases search error:", caseSearchError);
  }

  const typedSimilarCases = (similarCases || []) as SimilarCase[];
  console.log(`Found ${typedSimilarCases.length} similar cases`);

  const recommendationMap = new Map<string, RecommendationCandidate>();
  const upsertCandidate = (id?: string | null, similarity = 0) => {
    if (!id) return;
    const existing = recommendationMap.get(id);
    if (!existing || similarity > existing.similarity) {
      recommendationMap.set(id, { id, similarity });
    }
  };

  typedSimilarCases.forEach((c) => upsertCandidate(c.gift_id, c.similarity));

  let giftContext = "";
  let typedSimilarGifts: SimilarGift[] = [];

  if (typedSimilarCases.length < 3) {
    console.log("Searching gifts as fallback...");

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
      typedSimilarGifts = similarGifts as SimilarGift[];
      console.log(`Found ${typedSimilarGifts.length} similar gifts`);

      typedSimilarGifts.forEach((g) => upsertCandidate(g.id, g.similarity));

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

  const recommendedGiftIds = Array.from(recommendationMap.values())
    .sort((a, b) => b.similarity - a.similarity)
    .map((candidate) => candidate.id);

  const context =
    casesContext || giftContext ? casesContext + giftContext : DEFAULT_FALLBACK_MESSAGE;

  console.log("Final context length:", context.length);
  console.log("Final context:", context);

  return {
    context,
    recommendedGiftIds,
    similarCases: typedSimilarCases,
    similarGifts: typedSimilarGifts,
  };
}
