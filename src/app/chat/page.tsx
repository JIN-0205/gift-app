"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputMessage,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
import { GiftCard } from "@/components/GiftCard";
import { Gift } from "@/lib/types";

import { useChat } from "@ai-sdk/react";
import { MessageSquareIcon } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

const Example = () => {
  const { messages, sendMessage, status } = useChat();
  console.log("Chat messages:", messages);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [recommendedGifts, setRecommendedGifts] = useState<Gift[]>([]);

  // メッセージからギフトIDを抽出し、ギフト情報を取得
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return;

    const textContent = lastMessage.parts
      ?.filter((p) => p.type === "text")
      .map((p) => (p.type === "text" ? p.text : ""))
      .join("");

    if (!textContent) return;

    // [RECOMMENDED_GIFTS:id1,id2,id3] のような形式からIDを抽出
    const match = textContent.match(/\[RECOMMENDED_GIFTS:(.*?)\]/);
    if (match && match[1]) {
      const giftIds = match[1].split(",").map((id) => id.trim());

      // ギフト情報を取得
      fetch("/api/gifts/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: giftIds }),
      })
        .then((res) => res.json())
        .then((gifts) => {
          setRecommendedGifts(gifts);
        })
        .catch((error) => {
          console.error("Failed to fetch gifts:", error);
        });
    }
  }, [messages]);

  const handleSubmit = (message: PromptInputMessage, e: FormEvent) => {
    e.preventDefault();
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) {
      return;
    }
    sendMessage({ text: message.text || "" });
    console.log("Submitting message:", message);
  };
  return (
    <>
      <Conversation className="relative size-full" style={{ height: "498px" }}>
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              description="Messages will appear here as the conversation progresses."
              icon={<MessageSquareIcon className="size-6" />}
              title="Start a conversation"
            />
          ) : (
            messages.map((m) => {
              const textContent = m.parts
                ?.filter((p) => p.type === "text")
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");

              // [RECOMMENDED_GIFTS:...] を除去したテキスト
              const displayText = textContent
                ?.replace(/\[RECOMMENDED_GIFTS:.*?\]/g, "")
                .trim();

              return (
                <Message from={m.role} key={m.id}>
                  <MessageContent>
                    <Response>{displayText}</Response>
                  </MessageContent>
                </Message>
              );
            })
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* おすすめギフトカードを表示 */}
      {recommendedGifts.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">おすすめのギフト</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedGifts.map((gift) => (
              <GiftCard key={gift.id} {...gift} />
            ))}
          </div>
        </div>
      )}
      <PromptInputProvider>
        <PromptInput
          globalDrop
          multiple
          onSubmit={(message, e) => handleSubmit(message, e)}
        >
          <PromptInputHeader>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea ref={textareaRef} />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools></PromptInputTools>
            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </PromptInputProvider>
    </>
  );
};

export default Example;
//%-------------------------------------------------------------
