import Link from "next/link";
import { CheckCircle } from "lucide-react";

const benefits = [
  "Tüm pazaryerlerini tek panelde yönet",
  "AI ile yorum analizi ve cevap taslakları",
  "İade kalıplarını tespit et, oranını düşür",
  "Ürün açıklamalarını optimize et",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Sol panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 flex-col justify-between p-12">
        <Link href="/" className="text-white font-bold text-xl">SatıcıPilot</Link>

        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Pazaryeri operasyonlarını<br />
              <span className="text-orange-400">AI ile kolaylaştır</span>
            </h2>
            <p className="text-gray-400 mt-4 leading-relaxed">
              Yorumlar, iadeler, ürün optimizasyonu — hepsi tek panelde.
            </p>
          </div>
          <ul className="space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-gray-300 text-sm">
                <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-gray-600 text-xs">© 2026 SatıcıPilot</p>
      </div>

      {/* Sağ panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="font-bold text-gray-900 text-xl">SatıcıPilot</Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
