import { Lock, CheckCircle } from "lucide-react";

const tierConfig = {
  pro: {
    label: "Pro Plan",
    price: "₺599",
    yearly: "Yıllık ödemede ₺499/ay",
    features: [
      "Rakip Fiyat Analizi",
      "Müşteri Takibi & QR Form",
      "AI Yorum Yanıtlama",
      "Haftalık E-posta Raporu",
      "WooCommerce & Shopify Bağlantısı",
      "Instagram Mention Takibi",
    ],
  },
  marketing: {
    label: "Marketing Plan",
    price: "₺999",
    yearly: "Yıllık ödemede ₺799/ay",
    features: [
      "Pro planın her şeyi",
      "Kampanya Planlayıcı",
      "Müşteri E-posta Kampanyaları",
      "İndirim Kodu Üretici",
      "AI Kampanya Önerisi",
    ],
  },
};

export default function ProGate({
  feature,
  tier = "pro",
}: {
  feature: string;
  tier?: "pro" | "marketing";
}) {
  const config = tierConfig[tier];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-sm w-full space-y-6 text-center">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${tier === "marketing" ? "bg-indigo-100" : "bg-purple-100"}`}>
          <Lock className={`w-7 h-7 ${tier === "marketing" ? "text-indigo-600" : "text-purple-600"}`} />
        </div>

        <div>
          <p className="text-lg font-bold text-gray-900">{feature}</p>
          <p className="text-gray-500 text-sm mt-1">{config.label}'a dahildir.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-left space-y-4">
          <div>
            <p className="font-bold text-gray-900">{config.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-gray-900">{config.price}</span>
              <span className="text-gray-400 text-sm">/ay</span>
            </div>
            <p className="text-xs text-green-600 font-medium mt-0.5">{config.yearly}</p>
          </div>

          <ul className="space-y-2">
            {config.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <a
            href={`mailto:destek@saticipilot.com?subject=${config.label} - Yükseltme Talebi`}
            className={`block w-full text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
              tier === "marketing"
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
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
