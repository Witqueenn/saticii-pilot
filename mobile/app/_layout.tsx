import { useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { supabase } from "@/lib/supabase";
import { BadgeProvider } from "@/lib/BadgeContext";
import { ThemeProvider, useThemeContext } from "@/lib/ThemeContext";
import { requestNotificationPermission, setupNotificationHandler } from "@/lib/notifications";
import type { Session } from "@supabase/supabase-js";

setupNotificationHandler();

function ThemedApp() {
  const { isDark } = useThemeContext();
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
