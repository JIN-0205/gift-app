import Link from "next/link";

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-4xl font-bold text-[#F08B71]">
            {/* <Image
              src="/logo_giftee.png"
              alt="giftee Logo"
              width={150}
              height={50}
            /> */}
            gift
          </Link>
          <div className="flex gap-6 items-center">
            <Link
              href="/"
              className="text-gray-600 font-bold hover:text-giftee transition-colors"
            >
              ギフト一覧
            </Link>
            <Link
              href="/cases"
              className="text-gray-600 font-bold hover:text-giftee transition-colors"
            >
              体験談
            </Link>
            <Link
              href="/post"
              className="text-gray-600 font-bold hover:text-giftee transition-colors"
            >
              投稿する
            </Link>
            <Link
              href="/chat"
              className="bg-giftee text-white font-bold px-4 py-2 rounded-lg hover:bg-giftee/80 transition-colors"
            >
              チャットで相談
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
