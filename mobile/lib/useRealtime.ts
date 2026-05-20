import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { scheduleLocalNotification } from "@/lib/notifications";

export function useRealtimeReviews(sellerId: string, onNew: () => void) {
  // Ref pattern: subscription only re-creates when sellerId changes;
  // onNew always calls the latest version without causing churn.
  const onNewRef = useRef(onNew);
  useEffect(() => { onNewRef.current = onNew; });

  useEffect(() => {
    if (!sellerId) return;

    const channel = supabase
      .channel(`reviews:${sellerId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reviews", filter: `seller_id=eq.${sellerId}` },
        async (payload) => {
          onNewRef.current();
          const r = payload.new as { rating: number; product_name: string };
          if (r.rating <= 2) {
            await scheduleLocalNotification(
              "⚠️ Acil Yorum",
              `${r.product_name} için ${r.rating} yıldız aldın — hemen yanıtla!`,
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sellerId]);
}

export function useRealtimeReturns(sellerId: string, onNew: () => void) {
  const onNewRef = useRef(onNew);
  useEffect(() => { onNewRef.current = onNew; });

  useEffect(() => {
    if (!sellerId) return;

    const channel = supabase
      .channel(`returns:${sellerId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "returns", filter: `seller_id=eq.${sellerId}` },
        async (payload) => {
          onNewRef.current();
          const r = payload.new as { product_name: string };
          await scheduleLocalNotification(
            "📦 Yeni İade Talebi",
            `${r.product_name} için iade talebi oluşturuldu.`,
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sellerId]);
}
