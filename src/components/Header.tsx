import Link from "next/link";

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            🎁 Gift Finder
          </Link>
          <div className="flex gap-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              ギフト一覧
            </Link>
            <Link
              href="/cases"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              体験談
            </Link>
            <Link
              href="/post"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              投稿する
            </Link>
            <Link
              href="/chat"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              チャットで相談
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
