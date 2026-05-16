import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-8xl font-black text-orange-100">404</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sayfa bulunamadı</h1>
          <p className="text-gray-500 mt-2">Aradığın sayfa mevcut değil veya taşınmış olabilir.</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link
            href="/genel"
            className="bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            Panele Dön
          </Link>
          <Link
            href="/"
            className="border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Ana Sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
