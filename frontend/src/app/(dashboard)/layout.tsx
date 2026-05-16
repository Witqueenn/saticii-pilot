"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, Package, RotateCcw, LayoutDashboard, LogOut } from "lucide-react";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/genel", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/yorumlar", label: "Yorumlar", icon: MessageSquare },
  { href: "/urunler", label: "Ürünler", icon: Package },
  { href: "/iadeler", label: "İadeler", icon: RotateCcw },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? null);
        setShopName(user.user_metadata?.shop_name ?? null);
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
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

        {/* Kullanıcı bilgisi + çıkış */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">
                {shopName ?? "Mağazam"}
              </p>
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

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
