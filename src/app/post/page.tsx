"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/success-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftName: formData.get("giftName"),
          title: formData.get("title"),
          situation: formData.get("situation"),
          content: formData.get("content"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "投稿に失敗しました");
      }

      alert("✅ " + data.message);
      e.currentTarget.reset();
      router.push("/cases");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "投稿に失敗しました";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            体験談を投稿
          </h1>
          <p className="text-gray-600 mb-8">
            あなたのギフト体験を共有して、他の人の参考にしましょう
          </p>

          {error && (
            <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="giftName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                ギフト名 <span className="text-red-500">*</span>
              </label>
              <input
                id="giftName"
                name="giftName"
                type="text"
                required
                className="input-field"
                placeholder="例: スターバックスギフトカード"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="input-field"
                placeholder="例: 上司への感謝の気持ちが伝わりました"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="situation"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                シチュエーション <span className="text-red-500">*</span>
              </label>
              <input
                id="situation"
                name="situation"
                type="text"
                required
                className="input-field"
                placeholder="例: 30代女性上司への異動の際のお礼"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                体験談 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={8}
                className="textarea-field"
                placeholder="どんな反応があったか、なぜそれを選んだかなど詳しく書いてください"
                disabled={isSubmitting}
              />
              <p className="text-sm text-gray-500 mt-1">
                詳しく書くほど、AIの提案精度が上がります
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary"
            >
              {isSubmitting ? "投稿中..." : "投稿する"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
