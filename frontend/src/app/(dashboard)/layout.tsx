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

// Mobilde sadece 4 ana item
const mobileNavItems = navItems.slice(0, 4);

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
      <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-black">S</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-none">SatıcıPilot</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{shopName ?? "Mağazam"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/ayarlar" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Masaüstü sidebar ──────────────────────────── */}
      <aside className="hidden md:flex w-60 bg-white border-r border-gray-100 flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-black">S</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-none">SatıcıPilot</p>
              <p className="text-[10px] text-gray-400 mt-0.5">AI Operasyon Asistanı</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                  active
                    ? "bg-orange-50 text-orange-600 font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={clsx("w-4 h-4 flex-shrink-0", active ? "text-orange-500" : "text-gray-400")} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Alt kısım */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-purple-600 hover:bg-purple-50 rounded-xl transition-colors w-full font-medium"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Paneli
            </Link>
          )}
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {shopName?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{shopName ?? "Mağazam"}</p>
              <p className="text-[10px] text-gray-400 truncate">{userEmail ?? "—"}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Çıkış Yap"
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── İçerik ───────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        {children}
      </main>

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

      {/* ── Mobil alt nav — sadece 4 item ────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-10 safe-area-pb">
        {mobileNavItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors",
                active ? "text-orange-500" : "text-gray-400"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
