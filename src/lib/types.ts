import { Conversation, Gift, Message } from "@prisma/client";

// Prismaの型をそのまま使用
export type { Conversation, Gift, Message };

// 会話とメッセージを含む型
export type ConversationWithMessages = Conversation & {
  messages: Message[];
};

// Supabaseの体験談型（手動定義）
export interface SuccessCase {
  id: string;
  gift_id: string;
  title: string;
  content: string;
  situation: string;
  created_at: string;
  updated_at: string;
}

// RAG検索結果型
export interface SuccessCaseWithSimilarity extends SuccessCase {
  similarity: number;
}
