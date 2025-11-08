// "use client";

// import { useChat } from "@ai-sdk/react";
// import { useState } from "react";

// export default function Chat() {
//   const [input, setInput] = useState("");
//   const { messages, sendMessage } = useChat();
//   return (
//     <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
//       {messages.map((message) => (
//         <div key={message.id} className="whitespace-pre-wrap">
//           {message.role === "user" ? "User: " : "AI: "}
//           {message.parts.map((part, i) => {
//             switch (part.type) {
//               case "text":
//                 return <div key={`${message.id}-${i}`}>{part.text}</div>;
//             }
//           })}
//         </div>
//       ))}

//       <form
//         onSubmit={(e) => {
//           e.preventDefault();
//           sendMessage({ text: input });
//           setInput("");
//         }}
//       >
//         <input
//           className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
//           value={input}
//           placeholder="Say something..."
//           onChange={(e) => setInput(e.currentTarget.value)}
//         />
//       </form>
//     </div>
//   );
// }

//%-------------------------------------------------------------
// "use client";

// import { useChat } from "@ai-sdk/react";

// export default function ChatPage() {
//   const { messages, error } = useChat();

//   return (
//     <div className="container-custom py-8">
//       <div className="max-w-3xl mx-auto">
//         <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//           {/* ヘッダー */}
//           <div className="bg-blue-500 text-white p-6">
//             <h1 className="text-2xl font-bold">ギフト提案チャット</h1>
//             <p className="text-blue-100 mt-1">
//               どんなギフトをお探しですか？お気軽にご相談ください
//             </p>
//           </div>

//           {/* メッセージエリア */}
//           <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-50">
//             {messages.length === 0 && (
//               <div className="text-center text-gray-500 mt-20">
//                 <p className="mb-4">👋 こんにちは！</p>
//                 <p className="text-sm">
//                   例: 「30代の女性上司への昇進祝いを探しています」
//                 </p>
//               </div>
//             )}

//             {messages.map((message) => (
//               <div
//                 key={message.id}
//                 className={`flex ${
//                   message.role === "user" ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <div
//                   className={`max-w-[80%] rounded-lg p-4 ${
//                     message.role === "user"
//                       ? "bg-blue-500 text-white"
//                       : "bg-white text-gray-900 shadow"
//                   }`}
//                 >
//                   <div className="font-semibold mb-1 text-sm">
//                     {message.role === "user" ? "あなた" : "🤖 AI"}
//                   </div>
//                   <div className="whitespace-pre-wrap">{message.content}</div>
//                 </div>
//               </div>
//             ))}

//             {/* {isLoading && (
//               <div className="flex justify-start">
//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <div className="flex items-center gap-2">
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                     <div
//                       className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                       style={{ animationDelay: "0.1s" }}
//                     ></div>
//                     <div
//                       className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                       style={{ animationDelay: "0.2s" }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>
//             )} */}

//             {error && (
//               <div className="bg-red-100 text-red-800 p-4 rounded-lg">
//                 エラーが発生しました: {error.message}
//               </div>
//             )}
//           </div>

//           {/* 入力エリア */}
//           <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
//             <div className="flex gap-2">
//               <input
//                 value={input}
//                 onChange={handleInputChange}
//                 placeholder="例: 30代の女性上司への昇進祝いを探しています"
//                 className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 disabled={isLoading}
//               />
//               <button
//                 type="submit"
//                 disabled={isLoading || !input.trim()}
//                 className="btn-primary"
//               >
//                 送信
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

//%-------------------------------------------------------------
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
