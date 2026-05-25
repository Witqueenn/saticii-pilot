import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface Badges {
  urgentReviews: number;
  pendingReturns: number;
  unreadMessages: number;
  pendingQuestions: number;
}

const BadgeContext = createContext<{ badges: Badges; refresh: () => void }>({
  badges: { urgentReviews: 0, pendingReturns: 0, unreadMessages: 0, pendingQuestions: 0 },
  refresh: () => {},
});

export function BadgeProvider({ children }: { children: ReactNode }) {
  const [badges, setBadges] = useState<Badges>({
    urgentReviews: 0,
    pendingReturns: 0,
    unreadMessages: 0,
    pendingQuestions: 0,
  });

  async function refresh() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [reviewsRes, returnsRes, messagesRes, questionsRes] = await Promise.all([
      supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .eq("is_urgent", true)
        .eq("is_replied", false),
      supabase
        .from("returns")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .gte("returned_at", new Date(Date.now() - 7 * 86400000).toISOString()),
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .eq("status", "okunmadi"),
      supabase
        .from("questions")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .eq("is_answered", false),
    ]);

    setBadges({
      urgentReviews: reviewsRes.count ?? 0,
      pendingReturns: returnsRes.count ?? 0,
      unreadMessages: messagesRes.count ?? 0,
      pendingQuestions: questionsRes.count ?? 0,
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
