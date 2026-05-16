"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, Package, RotateCcw, LayoutDashboard, LogOut, ShieldCheck, Link2, Settings } from "lucide-react";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import OnboardingModal from "@/components/OnboardingModal";

const navItems = [
  { href: "/genel", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/yorumlar", label: "Yorumlar", icon: MessageSquare },
  { href: "/urunler", label: "Ürünler", icon: Package },
  { href: "/iadeler", label: "İadeler", icon: RotateCcw },
  { href: "/baglanti", label: "Bağlantılar", icon: Link2 },
  { href: "/ayarlar", label: "Ayarlar", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? null);
        setShopName(user.user_metadata?.shop_name ?? null);

        const [{ data: adminData }, { data: seller }] = await Promise.all([
          supabase.from("admin_users").select("id").eq("id", user.id).single(),
          supabase.from("sellers").select("onboarding_done").eq("id", user.id).single(),
        ]);

        setIsAdmin(!!adminData);
        if (seller && !seller.onboarding_done) setShowOnboarding(true);
      }
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/giris");
    router.refresh();
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 md:flex-row">

      {/* ── Mobil üst bar ─────────────────────────────── */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="font-bold text-gray-900 text-sm">SatıcıPilot</p>
          <p className="text-xs text-gray-400">{shopName ?? "Mağazam"}</p>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* ── Masaüstü sidebar ──────────────────────────── */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col flex-shrink-0">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">SatıcıPilot</h1>
          <p className="text-xs text-gray-500 mt-1">AI Operasyon Asistanı</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-orange-50 text-orange-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={clsx("w-4 h-4", active ? "text-orange-500" : "text-gray-400")} />
                {label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 text-xs text-purple-600 hover:bg-purple-50 rounded-lg transition-colors w-full"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Paneli
            </Link>
          )}
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{shopName ?? "Mağazam"}</p>
              <p className="text-xs text-gray-400 truncate">{userEmail ?? "—"}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Çıkış Yap"
              className="ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── İçerik ───────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        {children}
      </main>

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

      {/* ── Mobil alt nav bar ─────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-10">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-xs transition-colors",
                active ? "text-orange-600" : "text-gray-400"
              )}
            >
              <Icon className={clsx("w-5 h-5", active ? "text-orange-500" : "text-gray-400")} />
              <span className="text-[10px]">{label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
