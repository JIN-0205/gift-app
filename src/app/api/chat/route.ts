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

import { buildRecommendationContext } from "@/lib/recommendations";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, UIMessage } from "ai";

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

    const { context, recommendedGiftIds } = await buildRecommendationContext(
      userText
    );

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
