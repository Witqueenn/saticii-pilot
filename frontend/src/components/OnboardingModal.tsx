"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Link2, LayoutDashboard, ChevronRight, X, CheckCircle, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const steps = [
  {
    id: "hosgeldin",
    icon: Store,
    title: "SatıcıPilot'a hoş geldin!",
    desc: "Pazaryeri operasyonlarını AI ile yönetmeye hazır mısın? Başlamak için sadece 2 adım kaldı.",
    cta: "Hadi Başlayalım",
    skip: false,
  },
  {
    id: "baglanti",
    icon: Link2,
    title: "Verilerini bağla",
    desc: "Trendyol, Hepsiburada veya N11 mağazanı API ile bağla — ya da mevcut yorumlarını CSV olarak yükle ve hemen analiz başlat.",
    cta: "API ile Bağla",
    skip: true,
    skipLabel: "Sonra Bağlarım",
    href: "/baglanti",
    csvHref: "/yorumlar?csv=1",
  },
  {
    id: "hazir",
    icon: LayoutDashboard,
    title: "Her şey hazır!",
    desc: "Dashboard'un aktif. Yorumları analiz et, iadeleri takip et, ürünlerini optimize et.",
    cta: "Panele Git",
    skip: false,
  },
];

interface Props {
  onClose: () => void;
}

export default function OnboardingModal({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  async function markDone() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("sellers").update({ onboarding_done: true }).eq("id", user.id);
    }
    onClose();
  }

  function handleCta() {
    if (isLast) { markDone(); return; }
    if (current.href) { markDone(); router.push(current.href); return; }
    setStep((s) => s + 1);
  }

  function handleSkip() {
    if (isLast) { markDone(); return; }
    setStep((s) => s + 1);
  }

  function handleCsv() {
    markDone();
    router.push((current as { csvHref?: string }).csvHref ?? "/yorumlar?csv=1");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-orange-500 transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-8 space-y-6">
          {/* Icon */}
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center">
            <Icon className="w-7 h-7 text-orange-500" />
          </div>

          {/* Adım göstergesi */}
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full flex-1 transition-all ${i <= step ? "bg-orange-500" : "bg-gray-200"}`}
              />
            ))}
          </div>

          {/* İçerik */}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{current.title}</h2>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">{current.desc}</p>
          </div>

          {/* Butonlar */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleCta}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              {current.cta}
              {!isLast && <ChevronRight className="w-4 h-4" />}
              {isLast && <CheckCircle className="w-4 h-4" />}
            </button>

            {/* CSV seçeneği — sadece "baglanti" adımında */}
            {current.id === "baglanti" && (
              <button
                onClick={handleCsv}
                className="w-full border border-gray-200 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-gray-400" />
                CSV ile Hızlı Başla
              </button>
            )}

            {current.skip && (
              <button
                onClick={handleSkip}
                className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                {current.skipLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
