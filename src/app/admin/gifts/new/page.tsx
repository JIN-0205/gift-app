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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "ギフト名は2文字以上で入力してください" })
    .max(100, { message: "ギフト名は100文字以内で入力してください" }),
  description: z
    .string()
    .max(500, { message: "説明は500文字以内で入力してください" })
    .optional(),
  category: z
    .string()
    .max(50, { message: "カテゴリーは50文字以内で入力してください" })
    .optional(),
  price: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "価格は数値で入力してください",
    }),
  imageUrl: z
    .url({ message: "有効なURLを入力してください" })
    .optional()
    .or(z.literal("")),
  url: z
    .url({ message: "有効なURLを入力してください" })
    .optional()
    .or(z.literal("")),
});

export default function NewGiftPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: "",
      imageUrl: "",
      url: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          description: values.description || undefined,
          category: values.category || undefined,
          price: values.price ? Number(values.price) : undefined,
          imageUrl: values.imageUrl || undefined,
          url: values.url || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ギフトの作成に失敗しました");
      }

      alert("✅ " + data.message);
      form.reset();
      router.push("/admin/gifts");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "ギフトの作成に失敗しました";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">新規ギフト作成</CardTitle>
            <CardDescription>
              新しいギフト情報を登録します。Embeddingは自動生成されます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                ⚠️ {error}
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ギフト名</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例: スターバックスギフトカード"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>説明（任意）</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="例: コーヒー好きに最適なギフトカード。全国のスターバックス店舗で使用できます。"
                          rows={4}
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        詳しく書くほど、AIの提案精度が上がります
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>カテゴリー（任意）</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例: グルメ・ドリンク"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>価格（任意）</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="例: 3000"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>円単位で入力</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>画像URL（任意）</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="例: https://example.com/image.jpg"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>参照URL（任意）</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="例: https://example.com"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? "作成中..." : "ギフトを作成"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    キャンセル
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
