"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, LogOut, ChevronRight, Mail,
  BarChart2, MessageSquare, TrendingUp, Activity, Megaphone,
} from "lucide-react";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
  { href: "/admin/saticilar", label: "Satıcılar", icon: Users, exact: false },
  { href: "/admin/gelir", label: "Gelir Takibi", icon: TrendingUp, exact: false },
  { href: "/admin/kampanyalar", label: "Kampanyalar", icon: BarChart2, exact: false },
  { href: "/admin/formlar", label: "Form Yanıtları", icon: MessageSquare, exact: false },
  { href: "/admin/toplu", label: "Toplu İşlemler", icon: Megaphone, exact: false },
  { href: "/admin/loglar", label: "Aktivite Logları", icon: Activity, exact: false },
  { href: "/admin/waitlist", label: "Waitlist", icon: Mail, exact: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/giris");
    router.refresh();
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-56 bg-gray-900 text-white flex flex-col flex-shrink-0 overflow-y-auto">
        <div className="p-5 border-b border-gray-700">
          <p className="font-bold text-white">SatıcıPilot</p>
          <p className="text-xs text-gray-400 mt-0.5">Admin Paneli</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-orange-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-700">
          <Link href="/genel" className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors mb-1">
            <ChevronRight className="w-3 h-3 rotate-180" />
            Satıcı Paneline Dön
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-800 transition-colors w-full">
            <LogOut className="w-3 h-3" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
