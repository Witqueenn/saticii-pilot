import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Svg, Polyline, Line, Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Skeleton, SkeletonCard } from "@/lib/Skeleton";
import { useRealtimeReviews, useRealtimeReturns } from "@/lib/useRealtime";
import { useBadges } from "@/lib/BadgeContext";
import { SearchModal } from "@/lib/SearchModal";
import { useTheme } from "@/lib/theme";

interface KPI {
  label: string;
  value: string | number;
  color: string;
  bg: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  href: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  product_name: string;
  status: string;
  created_at: string;
}

interface DayCount { day: string; count: number }

function Sparkline({ data, color, lineColor }: { data: DayCount[]; color: string; lineColor: string }) {
  const W = 280, H = 56;
  if (data.length < 2) return null;
  const values = data.map((d) => d.count);
  const max = Math.max(...values, 1);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (d.count / max) * (H - 8) - 4;
    return `${x},${y}`;
  }).join(" ");
  const lastX = W;
  const lastY = H - (values[values.length - 1] / max) * (H - 8) - 4;

  return (
    <Svg width={W} height={H}>
      <Line x1={0} y1={H} x2={W} y2={H} stroke={lineColor} strokeWidth={1} />
      <Polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={lastX} cy={lastY} r={4} fill={color} />
    </Svg>
  );
}

export default function DashboardScreen() {
  const t = useTheme();
  const [shopName, setShopName] = useState("");
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [urgent, setUrgent] = useState<Review[]>([]);
  const [chartData, setChartData] = useState<DayCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sellerId, setSellerId] = useState("");
  const [pendingReturns, setPendingReturns] = useState(0);
  const [unreplied, setUnreplied] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const { refresh: refreshBadges } = useBadges();

  useRealtimeReviews(sellerId, () => { load(); refreshBadges(); });
  useRealtimeReturns(sellerId, () => { load(); refreshBadges(); });

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setShopName(user.user_metadata?.shop_name ?? user.email?.split("@")[0] ?? "Mağaza");
    setSellerId(user.id);

    const [reviewsRes, returnsRes, productsRes] = await Promise.all([
      supabase.from("reviews").select("id, rating, status, created_at").eq("seller_id", user.id),
      supabase.from("returns").select("id, status").eq("seller_id", user.id),
      supabase.from("products").select("id").eq("seller_id", user.id),
    ]);

    const reviews = reviewsRes.data ?? [];
    const returns = returnsRes.data ?? [];
    const products = productsRes.data ?? [];

    const avgRating = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "—";
    const pendingCount = returns.filter((r) => r.status === "beklemede").length;
    const unrepliedCount = reviews.filter((r) => r.status === "cevaplanmadi").length;
    setPendingReturns(pendingCount);
    setUnreplied(unrepliedCount);

    setKpis([
      { label: "Toplam Yorum", value: reviews.length, color: "#3b82f6", bg: "#eff6ff", icon: "chatbubble", href: "/(tabs)/yorumlar" },
      { label: "Ort. Puan", value: avgRating, color: "#f97316", bg: "#fff7ed", icon: "star", href: "/(tabs)/yorumlar" },
      { label: "Bekleyen İade", value: pendingCount, color: "#ef4444", bg: "#fef2f2", icon: "cube", href: "/(tabs)/iadeler" },
      { label: "Cevaplanmadı", value: unrepliedCount, color: "#8b5cf6", bg: "#f5f3ff", icon: "time", href: "/(tabs)/yorumlar" },
    ]);

    // Son 7 günlük yorum sayısı
    const last7: DayCount[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().slice(0, 10);
      const count = reviews.filter((r) => r.created_at?.startsWith(dayStr)).length;
      last7.push({ day: d.toLocaleDateString("tr-TR", { weekday: "short" }), count });
    }
    setChartData(last7);

    const { data: urgentData } = await supabase
      .from("reviews")
      .select("id, rating, comment, product_name, status, created_at")
      .eq("seller_id", user.id)
      .lte("rating", 2)
      .eq("status", "cevaplanmadi")
      .order("created_at", { ascending: false })
      .limit(3);

    setUrgent(urgentData ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const initials = shopName.slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={["top"]}>
        <View style={[styles.header, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
          <View>
            <Skeleton width={80} height={12} style={{ borderRadius: 6, marginBottom: 6 }} />
            <Skeleton width={140} height={22} style={{ borderRadius: 8 }} />
          </View>
          <Skeleton width={44} height={44} style={{ borderRadius: 22 }} />
        </View>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.kpiGrid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.kpiCard, { backgroundColor: t.input }]}>
                <Skeleton width={40} height={28} style={{ borderRadius: 6, marginBottom: 8 }} />
                <Skeleton width={80} height={12} style={{ borderRadius: 6 }} />
              </View>
            ))}
          </View>
          <Skeleton width="100%" height={100} style={{ borderRadius: 16, marginBottom: 20 }} />
          {[1, 2].map((i) => <SkeletonCard key={i} />)}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const totalReviews = chartData.reduce((s, d) => s + d.count, 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
        <View>
          <Text style={[styles.greeting, { color: t.textSub }]}>Merhaba 👋</Text>
          <Text style={[styles.shopName, { color: t.text }]}>{shopName}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.searchBtn, { backgroundColor: t.input }]} onPress={() => { Haptics.selectionAsync(); setSearchOpen(true); }}>
            <Ionicons name="search" size={20} color={t.textSub} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.avatar, { backgroundColor: t.orange }]} onPress={() => router.push("/(tabs)/ayarlar")}>
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <SearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.orange} />}
      >
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          {kpis.map((k) => (
            <TouchableOpacity
              key={k.label}
              style={[styles.kpiCard, { backgroundColor: t.card, borderColor: t.borderStrong }]}
              onPress={() => { Haptics.selectionAsync(); router.push(k.href as any); }}
              activeOpacity={0.8}
            >
              <View style={[styles.kpiIconWrap, { backgroundColor: k.bg }]}>
                <Ionicons name={k.icon} size={18} color={k.color} />
              </View>
              <View style={styles.kpiInfo}>
                <Text style={[styles.kpiLabel, { color: t.textMuted }]}>{k.label}</Text>
                <Text style={[styles.kpiValue, { color: t.text }]}>{k.value}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Urgency action strip */}
        {(unreplied > 0 || pendingReturns > 0) && (
          <View style={[styles.actionStrip, { backgroundColor: t.card, borderColor: t.borderStrong }]}>
            {unreplied > 0 && (
              <TouchableOpacity style={styles.actionItem} onPress={() => { Haptics.selectionAsync(); router.push("/(tabs)/yorumlar"); }}>
                <View style={[styles.actionDot, { backgroundColor: "#8b5cf6" }]} />
                <Text style={[styles.actionText, { color: t.text }]}>
                  <Text style={{ fontWeight: "800" }}>{unreplied}</Text> yorum bekliyor
                </Text>
                <Ionicons name="arrow-forward-circle" size={18} color="#8b5cf6" />
              </TouchableOpacity>
            )}
            {unreplied > 0 && pendingReturns > 0 && <View style={[styles.actionDivider, { backgroundColor: t.border }]} />}
            {pendingReturns > 0 && (
              <TouchableOpacity style={styles.actionItem} onPress={() => { Haptics.selectionAsync(); router.push("/(tabs)/iadeler"); }}>
                <View style={[styles.actionDot, { backgroundColor: "#ef4444" }]} />
                <Text style={[styles.actionText, { color: t.text }]}>
                  <Text style={{ fontWeight: "800" }}>{pendingReturns}</Text> iade işlem bekliyor
                </Text>
                <Ionicons name="arrow-forward-circle" size={18} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Hızlı erişim */}
        <View style={styles.quickGrid}>
          <TouchableOpacity style={[styles.quickCard, { backgroundColor: t.card, borderColor: t.borderStrong }]} onPress={() => router.push("/(tabs)/mesajlar")}>
            <View style={[styles.quickIcon, { backgroundColor: "#eff6ff" }]}>
              <Ionicons name="mail-outline" size={18} color="#3b82f6" />
            </View>
            <Text style={[styles.quickLabel, { color: t.text }]}>Mesajlar</Text>
            <Ionicons name="chevron-forward" size={14} color={t.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickCard, { backgroundColor: t.card, borderColor: t.borderStrong }]} onPress={() => router.push("/(tabs)/istatistik")}>
            <View style={[styles.quickIcon, { backgroundColor: "#f0fdf4" }]}>
              <Ionicons name="bar-chart-outline" size={18} color="#16a34a" />
            </View>
            <Text style={[styles.quickLabel, { color: t.text }]}>Analiz</Text>
            <Ionicons name="chevron-forward" size={14} color={t.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickCard, { backgroundColor: t.card, borderColor: t.borderStrong }]} onPress={() => router.push("/rakip")}>
            <View style={[styles.quickIcon, { backgroundColor: "#fef3c7" }]}>
              <Ionicons name="trending-up-outline" size={18} color="#d97706" />
            </View>
            <Text style={[styles.quickLabel, { color: t.text }]}>Rakip</Text>
            <Ionicons name="chevron-forward" size={14} color={t.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickCard, { backgroundColor: t.card, borderColor: t.borderStrong }]} onPress={() => router.push("/musteri")}>
            <View style={[styles.quickIcon, { backgroundColor: "#f5f3ff" }]}>
              <Ionicons name="people-outline" size={18} color="#6366f1" />
            </View>
            <Text style={[styles.quickLabel, { color: t.text }]}>Müşteriler</Text>
            <Ionicons name="chevron-forward" size={14} color={t.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Sparkline chart */}
        {totalReviews > 0 && (
          <View style={[styles.chartCard, { backgroundColor: t.card, borderColor: t.borderStrong }]}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: t.text }]}>Son 7 Gün — Yorumlar</Text>
              <Text style={[styles.chartTotal, { color: t.orange }]}>{totalReviews} yorum</Text>
            </View>
            <Sparkline data={chartData} color={t.orange} lineColor={t.border} />
            <View style={styles.chartLabels}>
              {chartData.map((d, i) => (
                <Text key={i} style={[styles.chartLabel, { color: t.textMuted }]}>{d.day}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Acil yorumlar */}
        {urgent.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.urgentDot} />
              <Text style={[styles.sectionTitle, { color: t.text }]}>Acil Yorumlar</Text>
              <Text style={styles.sectionCount}>{urgent.length}</Text>
            </View>
            {urgent.map((r) => (
              <View key={r.id} style={[styles.reviewCard, { backgroundColor: t.card, borderColor: t.borderStrong }]}>
                <View style={styles.reviewTop}>
                  <View style={{ flexDirection: "row", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Ionicons key={i} name={i <= r.rating ? "star" : "star-outline"} size={13} color="#ef4444" />
                    ))}
                  </View>
                  <Text style={[styles.reviewDate, { color: t.textMuted }]}>
                    {new Date(r.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                  </Text>
                </View>
                <Text style={[styles.reviewProduct, { color: t.text }]} numberOfLines={1}>{r.product_name}</Text>
                <Text style={[styles.reviewComment, { color: t.textSub }]} numberOfLines={2}>{r.comment}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyBox, { backgroundColor: t.card, borderColor: t.border }]}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={[styles.emptyTitle, { color: t.text }]}>Her şey yolunda!</Text>
            <Text style={[styles.emptySubtitle, { color: t.textSub }]}>Cevaplanmayı bekleyen acil yorum yok.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  searchBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  greeting: { fontSize: 13, fontWeight: "500" },
  shopName: { fontSize: 22, fontWeight: "800", marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  container: { padding: 16, paddingBottom: 40 },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  kpiCard: { flex: 1, minWidth: "47%", borderRadius: 14, padding: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  kpiIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  kpiInfo: { flex: 1 },
  kpiValue: { fontSize: 26, fontWeight: "800", marginTop: 2 },
  kpiLabel: { fontSize: 11, fontWeight: "600" },
  actionStrip: { borderRadius: 14, overflow: "hidden", marginBottom: 12, borderWidth: 1 },
  actionItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 13 },
  actionDot: { width: 7, height: 7, borderRadius: 4 },
  actionText: { flex: 1, fontSize: 13 },
  actionDivider: { height: 1, marginHorizontal: 16 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  quickCard: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, padding: 14, borderWidth: 1 },
  quickIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  quickLabel: { flex: 1, fontSize: 13, fontWeight: "600" },
  chartCard: { borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1 },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  chartTitle: { fontSize: 14, fontWeight: "700" },
  chartTotal: { fontSize: 13, fontWeight: "700" },
  chartLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  chartLabel: { fontSize: 10, fontWeight: "500" },
  section: { gap: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  urgentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444" },
  sectionTitle: { fontSize: 15, fontWeight: "700", flex: 1 },
  sectionCount: { fontSize: 13, color: "#ef4444", fontWeight: "700" },
  reviewCard: { borderRadius: 14, padding: 14, borderWidth: 1, borderLeftWidth: 3, borderLeftColor: "#ef4444" },
  reviewTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  reviewDate: { fontSize: 11 },
  reviewProduct: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  reviewComment: { fontSize: 13, lineHeight: 18 },
  emptyBox: { borderRadius: 16, padding: 32, alignItems: "center", gap: 6, borderWidth: 1 },
  emptyIcon: { fontSize: 36, marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  emptySubtitle: { fontSize: 13, textAlign: "center" },
});
