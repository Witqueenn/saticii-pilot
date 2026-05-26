import { useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import { supabase } from "@/lib/supabase";
import { BadgeProvider } from "@/lib/BadgeContext";
import { ThemeProvider, useThemeContext } from "@/lib/ThemeContext";
import { requestNotificationPermission, setupNotificationHandler } from "@/lib/notifications";
import type { Session } from "@supabase/supabase-js";

setupNotificationHandler();

const SCREEN_ROUTES: Record<string, string> = {
  reviews:   "/(tabs)/yorumlar",
  questions: "/(tabs)/yorumlar",
  returns:   "/(tabs)/iadeler",
  products:  "/(tabs)/urunler",
};

function ThemedApp() {
  const { isDark } = useThemeContext();

  useEffect(() => {
    if (Constants.appOwnership === "expo") return;
    let sub: { remove: () => void } | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const N = require("expo-notifications");
      sub = N.addNotificationResponseReceivedListener(
        (response: { notification: { request: { content: { data?: Record<string, string> } } } }) => {
          const screen = response.notification.request.content.data?.screen ?? "";
          const route = SCREEN_ROUTES[screen] ?? "/(tabs)";
          router.push(route as never);
        }
      );
    } catch {}
    return () => { sub?.remove(); };
  }, []);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    requestNotificationPermission();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (session) {
      const onboarded = session.user.user_metadata?.onboarded;
      router.replace(onboarded ? "/(tabs)" : "/onboarding");
    } else {
      router.replace("/(auth)/login");
    }
  }, [ready, session]);

  return (
    <ThemeProvider>
      <BadgeProvider>
        <ThemedApp />
      </BadgeProvider>
    </ThemeProvider>
  );
}
