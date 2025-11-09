import { Header } from "@/components/Header";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gift Finder - AI ギフト提案アプリ",
  description: "AIがあなたに最適なギフトを提案します",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body
        className={inter.className + " min-h-screen flex flex-col bg-gray-50"}
      >
        <Header />
        <main className="grow bg-gray-50">{children}</main>
      </body>
    </html>
  );
}
