"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Gift {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export default function GiftsPage() {
  const router = useRouter();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      const response = await fetch("/api/gifts?limit=100");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ギフトの取得に失敗しました");
      }

      setGifts(data.data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "ギフトの取得に失敗しました";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">ギフト管理</h1>
            <p className="text-muted-foreground mt-2">
              登録されているギフトの一覧です
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/admin/gifts/new")} size="lg">
              + 新規ギフト作成
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/generate-embeddings")}
              size="lg"
            >
              Embedding生成
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            ⚠️ {error}
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        ) : gifts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                まだギフトが登録されていません
              </p>
              <Button onClick={() => router.push("/admin/gifts/new")}>
                最初のギフトを作成
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gifts.map((gift) => (
              <Card key={gift.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{gift.name}</CardTitle>
                  {gift.category && (
                    <CardDescription>{gift.category}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {gift.imageUrl && (
                    <div className="relative w-full h-48 mb-4">
                      <Image
                        src={gift.imageUrl}
                        alt={gift.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                  {gift.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {gift.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    {gift.price && (
                      <p className="font-semibold text-lg">
                        ¥{gift.price.toLocaleString()}
                      </p>
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        gift.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {gift.isActive ? "有効" : "無効"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    作成日:{" "}
                    {new Date(gift.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-muted-foreground">
          合計 {gifts.length} 件のギフト
        </div>
      </div>
    </div>
  );
}
