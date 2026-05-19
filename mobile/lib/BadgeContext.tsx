import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface Badges {
  urgentReviews: number;
  pendingReturns: number;
  unreadMessages: number;
}

const BadgeContext = createContext<{ badges: Badges; refresh: () => void }>({
  badges: { urgentReviews: 0, pendingReturns: 0, unreadMessages: 0 },
  refresh: () => {},
});

export function BadgeProvider({ children }: { children: ReactNode }) {
  const [badges, setBadges] = useState<Badges>({ urgentReviews: 0, pendingReturns: 0, unreadMessages: 0 });

  async function refresh() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [reviewsRes, returnsRes, messagesRes] = await Promise.all([
      supabase.from("reviews").select("id", { count: "exact" })
        .eq("seller_id", user.id).lte("rating", 2).eq("status", "cevaplanmadi"),
      supabase.from("returns").select("id", { count: "exact" })
        .eq("seller_id", user.id).eq("status", "beklemede"),
      supabase.from("messages").select("id", { count: "exact" })
        .eq("seller_id", user.id).eq("status", "okunmadi"),
    ]);

    setBadges({
      urgentReviews: reviewsRes.count ?? 0,
      pendingReturns: returnsRes.count ?? 0,
      unreadMessages: messagesRes.count ?? 0,
    });
  }

  useEffect(() => { refresh(); }, []);

  return (
    <BadgeContext.Provider value={{ badges, refresh }}>
      {children}
    </BadgeContext.Provider>
  );
}

export const useBadges = () => useContext(BadgeContext);
