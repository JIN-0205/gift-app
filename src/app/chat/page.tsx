"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
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
  usePromptInputController,
} from "@/components/ai-elements/prompt-input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Gift } from "@/lib/types";
import { useChat } from "@ai-sdk/react";
import { MessageSquareIcon } from "lucide-react";
import Image from "next/image";
import {
  FormEvent,
  type RefObject,
  useCallback,
  useRef,
  useState,
} from "react";

const statusConfigs = {
  ready: {
    label: "待機中",
    badgeClass: "bg-emerald-50 text-emerald-700",
    dotClass: "bg-emerald-500",
  },
  streaming: {
    label: "回答中",
    badgeClass: "bg-blue-50 text-blue-700",
    dotClass: "bg-blue-500",
  },
  submitted: {
    label: "送信済み",
    badgeClass: "bg-amber-50 text-amber-700",
    dotClass: "bg-amber-500",
  },
  error: {
    label: "エラー",
    badgeClass: "bg-rose-50 text-rose-700",
    dotClass: "bg-rose-500",
  },
} as const;

type SuggestionButtonsProps = {
  suggestions: string[];
  textareaRef: RefObject<HTMLTextAreaElement | null>;
};

const SuggestionButtons = ({
  suggestions,
  textareaRef,
}: SuggestionButtonsProps) => {
  const controller = usePromptInputController();

  return (
    <div className="mt-4 space-y-3">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm text-gray-700 transition hover:border-giftee/40 hover:bg-white"
          onClick={() => {
            controller.textInput.setInput(suggestion);
            textareaRef.current?.focus();
          }}
          type="button"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [recommendedGifts, setRecommendedGifts] = useState<Gift[]>([]);
  const recommendationRequestIdRef = useRef(0);

  const fetchRecommendedGifts = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setRecommendedGifts([]);
      return;
    }

    const requestId = ++recommendationRequestIdRef.current;
    try {
      const response = await fetch("/api/gifts/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`Failed to load recommendations: ${response.status}`);
      }

      const gifts: Gift[] = await response.json();
      if (requestId === recommendationRequestIdRef.current) {
        setRecommendedGifts(gifts);
      }
    } catch (error) {
      if (requestId === recommendationRequestIdRef.current) {
        setRecommendedGifts([]);
      }
      console.error("Failed to fetch recommended gifts:", error);
    }
  }, []);

  const handleSubmit = (message: PromptInputMessage, e: FormEvent) => {
    e.preventDefault();
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) {
      return;
    }
    if (message.text) {
      void fetchRecommendedGifts(message.text);
    } else {
      setRecommendedGifts([]);
    }

    sendMessage({ text: message.text || "" });
  };

  const statusStyle = statusConfigs[status] ?? statusConfigs.ready;
  const promptSuggestions = [
    "抹茶が好きな上司に、5,000円以内で贈れるお礼ギフトが知りたいです。",
    "1歳の甥っ子への誕生日プレゼントで実用的なものを探しています。",
    "コーヒー好きの友人夫婦に、引っ越し祝いとして贈れるギフトを教えてください。",
  ];
  const lastAssistantMessageId = [...messages]
    .reverse()
    .find((message) => message.role === "assistant")?.id;
  const canRenderRecommendations =
    recommendedGifts.length > 0 && Boolean(lastAssistantMessageId);
  const formatPrice = (price?: number | null) =>
    typeof price === "number" ? `¥${price.toLocaleString()}` : null;

  const suggestionPanel = (
    <div className="space-y-6 rounded-3xl border border-gray-100 bg-white/90 p-6 shadow-sm backdrop-blur">
      <div>
        <p className="text-base font-semibold text-gray-900">
          相談をスムーズにするコツ
        </p>
        <ul className="mt-4 space-y-4 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="text-giftee font-semibold">01</span>
            <span>
              贈りたい相手の情報（年齢や関係性、好み）を添えると、より個別感のある提案になります。
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-giftee font-semibold">02</span>
            <span>
              予算帯や渡し方（手渡し・配送など）を共有すると、現実的な候補を絞りやすくなります。
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-giftee font-semibold">03</span>
            <span>
              迷っているポイントや不安を正直に書くと、フォローの角度が定まりやすくなります。
            </span>
          </li>
        </ul>
      </div>

      <div className="border-t border-dashed border-gray-200 pt-6">
        <div>
          <p className="text-base font-semibold text-gray-900">相談の例</p>
          <p className="mt-1 text-xs text-gray-500">
            そのままコピペして使えます。タップすると入力欄に反映されます。
          </p>
        </div>
        <SuggestionButtons
          suggestions={promptSuggestions}
          textareaRef={textareaRef}
        />
      </div>
    </div>
  );

  return (
    <PromptInputProvider>
      <div className="container-custom py-12">
        <div className="mb-10 text-center">
          {/* <p className="inline-flex items-center gap-2 rounded-full bg-giftee/10 px-4 py-2 text-sm font-semibold text-giftee">
            <MessageSquareIcon className="size-4" />
            AIギフトコンシェルジュ
          </p> */}
          <h1 className="mt-4 text-4xl font-bold text-giftee">
            チャットでギフトの相談をする
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            相手の好みやシーンを伝えるだけで、ぴったりのギフト候補を提案します。
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500">
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
                  <MessageSquareIcon className="size-4" />
                  ヒントを開く
                </SheetTrigger>
                <SheetContent
                  side="bottom"
                  className="max-h-[80vh] overflow-y-auto rounded-t-3xl"
                >
                  <SheetHeader>
                    <SheetTitle>相談サポート</SheetTitle>
                    <SheetDescription>
                      ヒントやテンプレートを参考に相談内容をまとめてみましょう。
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-4">{suggestionPanel}</div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1">
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    あなた専属のギフトコンシェルジュ
                  </p>
                  <p className="text-sm text-gray-500">
                    気になる相手や予算、贈るシーンなどを気軽にご入力ください。
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${statusStyle.badgeClass}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${statusStyle.dotClass}`}
                  />
                  {statusStyle.label}
                </span>
              </div>

              <div className="px-6 py-6">
                <div className="h-[420px]">
                  <Conversation
                    className="relative size-full"
                    style={{ height: "100%" }}
                  >
                    <ConversationContent>
                      {messages.length === 0 ? (
                        <ConversationEmptyState
                          description="贈りたい相手のことを伝えると、チャット上でおすすめをご案内します。"
                          icon={<MessageSquareIcon className="size-6" />}
                          title="まずは気になるギフトシーンを教えてください"
                        />
                      ) : (
                        messages.map((m) => {
                          const textContent = m.parts
                            ?.filter((p) => p.type === "text")
                            .map((p) => (p.type === "text" ? p.text : ""))
                            .join("");

                          const displayText = textContent
                            ?.replace(/\[RECOMMENDED_GIFTS:.*?\]/g, "")
                            .trim();
                          const showEmbeddedRecommendations =
                            canRenderRecommendations &&
                            m.id === lastAssistantMessageId;

                          return (
                            <Message from={m.role} key={m.id}>
                              <MessageContent>
                                <MessageResponse>{displayText}</MessageResponse>
                                {showEmbeddedRecommendations && (
                                  <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-semibold text-gray-700">
                                        おすすめのギフト
                                      </p>
                                      <span className="text-xs font-semibold text-giftee">
                                        {recommendedGifts.length} 件
                                      </span>
                                    </div>
                                    <Carousel
                                      className="mt-3"
                                      opts={{
                                        align: "start",
                                        containScroll: "trimSnaps",
                                      }}
                                    >
                                      <CarouselContent>
                                        {recommendedGifts.map((gift) => {
                                          const priceLabel = formatPrice(
                                            gift.price
                                          );
                                          return (
                                            <CarouselItem
                                              key={gift.id}
                                              className=""
                                            >
                                              <div className="h-full rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-100">
                                                <div className="relative mb-3 h-36 w-full overflow-hidden rounded-lg bg-gray-100">
                                                  {gift.imageUrl ? (
                                                    <Image
                                                      alt={gift.name}
                                                      className="object-cover"
                                                      fill
                                                      sizes="230px"
                                                      src={gift.imageUrl}
                                                    />
                                                  ) : (
                                                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                                      画像はありません
                                                    </div>
                                                  )}
                                                </div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                  {gift.name}
                                                </p>
                                                {gift.description && (
                                                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                                    {gift.description}
                                                  </p>
                                                )}
                                                <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-gray-500">
                                                  <span>
                                                    {gift.category ?? "ギフト"}
                                                  </span>
                                                  {priceLabel && (
                                                    <span className="text-sm font-semibold text-gray-900">
                                                      {priceLabel}
                                                    </span>
                                                  )}
                                                </div>
                                                {gift.url && (
                                                  <a
                                                    className="mt-3 inline-flex items-center text-xs font-semibold text-giftee hover:underline"
                                                    href={gift.url}
                                                    rel="noreferrer"
                                                    target="_blank"
                                                  >
                                                    詳細を見る →
                                                  </a>
                                                )}
                                              </div>
                                            </CarouselItem>
                                          );
                                        })}
                                      </CarouselContent>
                                      <div className="mt-3 flex justify-end gap-2">
                                        <CarouselPrevious className="static h-8 w-8 translate-y-0 border-gray-200 text-gray-700" />
                                        <CarouselNext className="static h-8 w-8 translate-y-0 border-gray-200 text-gray-700" />
                                      </div>
                                    </Carousel>
                                  </div>
                                )}
                              </MessageContent>
                            </Message>
                          );
                        })
                      )}
                    </ConversationContent>
                    <ConversationScrollButton />
                  </Conversation>
                </div>
              </div>

              <div className="border-t border-gray-100 bg-gray-50 px-6 py-5">
                <PromptInput
                  className="bg-white"
                  globalDrop
                  multiple
                  onSubmit={(message, e) => handleSubmit(message, e)}
                >
                  <PromptInputHeader>
                    <PromptInputAttachments>
                      {(attachment) => (
                        <PromptInputAttachment data={attachment} />
                      )}
                    </PromptInputAttachments>
                  </PromptInputHeader>
                  <PromptInputBody>
                    <PromptInputTextarea
                      placeholder="例）和菓子が好きな祖母に、敬老の日の贈り物を探しています。"
                      ref={textareaRef}
                    />
                  </PromptInputBody>
                  <PromptInputFooter>
                    <PromptInputTools />
                    <PromptInputSubmit
                      status={status}
                      className="bg-giftee hover:bg-giftee/80"
                    />
                  </PromptInputFooter>
                </PromptInput>
              </div>
            </div>
          </div>

          <aside className="hidden w-full max-w-sm shrink-0 lg:block">
            {suggestionPanel}
          </aside>
        </div>
      </div>
    </PromptInputProvider>
  );
}
