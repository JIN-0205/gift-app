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
  giftName: z
    .string()
    .min(2, { message: "ギフト名は2文字以上で入力してください" })
    .max(50, { message: "ギフト名は50文字以内で入力してください" }),
  title: z
    .string()
    .min(2, { message: "タイトルは2文字以上で入力してください" })
    .max(100, { message: "タイトルは100文字以内で入力してください" }),
  situation: z
    .string()
    .min(5, { message: "シチュエーションは5文字以上で入力してください" })
    .max(100, { message: "シチュエーションは100文字以内で入力してください" }),
  content: z
    .string()
    .min(10, { message: "体験談は10文字以上で入力してください" })
    .max(1000, { message: "体験談は1000文字以内で入力してください" }),
});

export default function PostPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      giftName: "",
      title: "",
      situation: "",
      content: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/success-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "投稿に失敗しました");
      }

      alert("✅ " + data.message);
      form.reset();
      router.push("/cases");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "投稿に失敗しました";
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
            <CardTitle className="text-3xl">体験談を投稿</CardTitle>
            <CardDescription>
              あなたのギフト体験を共有して、他の人の参考にしましょう
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
                  name="giftName"
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>タイトル</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例: 上司への感謝の気持ちが伝わりました"
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
                  name="situation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>シチュエーション</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例: 30代女性上司への異動の際のお礼"
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
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>体験談</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="どんな反応があったか、なぜそれを選んだかなど詳しく書いてください"
                          rows={8}
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      {/* <FormDescription>
                        詳しく書くほど、AIの提案精度が上がります
                      </FormDescription> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-giftee hover:bg-giftee/90 text-lg "
                >
                  {isSubmitting ? "投稿中..." : "投稿する"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
