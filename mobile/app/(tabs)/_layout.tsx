import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useBadges } from "@/lib/BadgeContext";
import { useTheme } from "@/lib/theme";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({ focused, active, inactive, color }: { focused: boolean; active: IoniconsName; inactive: IoniconsName; color: string }) {
  return <Ionicons name={focused ? active : inactive} size={22} color={color} />;
}

export default function TabLayout() {
  const { badges } = useBadges();
  const t = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.orange,
        tabBarInactiveTintColor: t.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginBottom: 2 },
        tabBarStyle: {
          backgroundColor: t.tabBar,
          borderTopWidth: 1,
          borderTopColor: t.border,
          height: 84,
          paddingBottom: 20,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Özet", tabBarIcon: (p) => <TabIcon focused={p.focused} active="home" inactive="home-outline" color={p.color} /> }} />
      <Tabs.Screen name="yorumlar" options={{ title: "Yorumlar", tabBarBadge: badges.urgentReviews > 0 ? badges.urgentReviews : undefined, tabBarBadgeStyle: { backgroundColor: "#ef4444", fontSize: 10 }, tabBarIcon: (p) => <TabIcon focused={p.focused} active="chatbubble" inactive="chatbubble-outline" color={p.color} /> }} />
      <Tabs.Screen name="iadeler" options={{ title: "İadeler", tabBarBadge: badges.pendingReturns > 0 ? badges.pendingReturns : undefined, tabBarBadgeStyle: { backgroundColor: "#ef4444", fontSize: 10 }, tabBarIcon: (p) => <TabIcon focused={p.focused} active="cube" inactive="cube-outline" color={p.color} /> }} />
      <Tabs.Screen name="mesajlar" options={{ title: "Mesajlar", tabBarBadge: badges.unreadMessages > 0 ? badges.unreadMessages : undefined, tabBarBadgeStyle: { backgroundColor: "#ef4444", fontSize: 10 }, tabBarIcon: (p) => <TabIcon focused={p.focused} active="mail" inactive="mail-outline" color={p.color} /> }} />
      <Tabs.Screen name="ayarlar" options={{ title: "Ayarlar", tabBarIcon: (p) => <TabIcon focused={p.focused} active="settings" inactive="settings-outline" color={p.color} /> }} />
      <Tabs.Screen name="urunler" options={{ href: null }} />
      <Tabs.Screen name="istatistik" options={{ href: null }} />
    </Tabs>
  );
}
