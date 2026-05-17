import { Lock, CheckCircle } from "lucide-react";

const proFeatures = [
  "Rakip Fiyat Analizi",
  "Müşteri Takibi & QR Form",
  "AI Yorum Yanıtlama",
  "Haftalık E-posta Raporu",
  "WooCommerce & Shopify Bağlantısı",
  "Instagram Mention Takibi",
];

export default function ProGate({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-sm w-full space-y-6 text-center">
        <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7 text-purple-600" />
        </div>

        <div>
          <p className="text-lg font-bold text-gray-900">{feature}</p>
          <p className="text-gray-500 text-sm mt-1">Bu özellik Pro plana dahildir.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-left space-y-4">
          <div>
            <p className="font-bold text-gray-900">Pro Plan</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-gray-900">₺599</span>
              <span className="text-gray-400 text-sm">/ay</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Yıllık ödemede ₺499/ay</p>
          </div>

          <ul className="space-y-2">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <a
            href="mailto:destek@saticipilot.com?subject=Pro Plan - Yükseltme Talebi"
            className="block w-full text-center bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
          >
            Planını Yükselt →
          </a>
          <p className="text-xs text-gray-400 text-center">
            14 gün ücretsiz deneme · İstediğin zaman iptal
          </p>
        </div>
      </div>
    </div>
  );
}
