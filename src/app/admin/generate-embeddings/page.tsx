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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

export default function GenerateEmbeddingsPage() {
  const [adminKey, setAdminKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    processed?: number;
    errors?: number;
    total?: number;
    error?: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!adminKey) {
      setResult({
        success: false,
        error: "管理者キーを入力してください",
      });
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch("/api/gifts/generate-embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "生成に失敗しました");
      }

      setResult(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "生成に失敗しました";
      setResult({ success: false, error: errorMessage });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Embedding一括生成</CardTitle>
            <CardDescription>
              既存のギフトデータに対してembeddingを一括生成します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="adminKey">管理者キー</Label>
              <Input
                id="adminKey"
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="管理者キーを入力してください"
                disabled={isGenerating}
              />
              <p className="text-sm text-muted-foreground">
                .envファイルに設定されたADMIN_SECRET_KEYを入力してください
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !adminKey}
                className="w-full"
                size="lg"
              >
                {isGenerating ? "生成中..." : "Embeddingを生成"}
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <Progress value={undefined} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    処理中です。しばらくお待ちください...
                  </p>
                </div>
              )}
            </div>

            {result && (
              <Alert
                variant={result.success ? "default" : "destructive"}
                className="mt-6"
              >
                {result.success ? (
                  <div className="space-y-2">
                    <p className="font-semibold">✅ {result.message}</p>
                    <div className="text-sm space-y-1">
                      <p>処理済み: {result.processed}件</p>
                      <p>エラー: {result.errors}件</p>
                      <p>合計: {result.total}件</p>
                    </div>
                  </div>
                ) : (
                  <p>⚠️ {result.error}</p>
                )}
              </Alert>
            )}

            <div className="border-t pt-6 mt-6">
              <h3 className="font-semibold mb-2">注意事項</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>この処理には時間がかかる場合があります</li>
                <li>OpenAI APIの使用料が発生します</li>
                <li>既にembeddingが存在するギフトも再生成されます</li>
                <li>本番環境では必ず認証を追加してください</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
