"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Package, RotateCcw, LayoutDashboard } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/genel", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/yorumlar", label: "Yorumlar", icon: MessageSquare },
  { href: "/urunler", label: "Ürünler", icon: Package },
  { href: "/iadeler", label: "İadeler", icon: RotateCcw },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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

        <div className="p-4 border-t border-gray-200 space-y-1">
          <p className="text-xs font-medium text-gray-700">Mira'nın Mağazası</p>
          <p className="text-xs text-gray-400">Profesyonel Plan</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
