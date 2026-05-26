import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
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
import { setupNotificationHandler, registerForPushTokenAsync } from "@/lib/notifications";

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
  is_replied: boolean;
  is_urgent: boolean;
  created_at: string;
}

interface DayCount { day: string; count: number }

const QUICK_ITEMS = [
  { label: "Analiz",     href: "/(tabs)/istatistik", icon: "bar-chart-outline",    color: "#16a34a", bg: "#f0fdf4" },
  { label: "Rakip",      href: "/rakip",              icon: "trending-up-outline",  color: "#d97706", bg: "#fef3c7" },
  { label: "Müşteriler", href: "/musteri",             icon: "people-outline",       color: "#6366f1", bg: "#f5f3ff" },
  { label: "Kampanya",   href: "/kampanya",            icon: "megaphone-outline",    color: "#ec4899", bg: "#fdf2f8" },
  { label: "Mesajlar",   href: "/(tabs)/mesajlar",    icon: "mail-outline",         color: "#3b82f6", bg: "#eff6ff" },
];

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
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [briefItems, setBriefItems] = useState<string[]>([]);
  const [briefLoading, setBriefLoading] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState<number | null>(null);
  const [weekRevenue, setWeekRevenue] = useState(0);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalInputVal, setGoalInputVal] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);
  const { refresh: refreshBadges } = useBadges();

  useRealtimeReviews(sellerId, () => { load(); refreshBadges(); });
  useRealtimeReturns(sellerId, () => { load(); refreshBadges(); });

  async function saveGoalMobile() {
    const val = parseFloat(goalInputVal.replace(/\./g, "").replace(",", "."));
    if (isNaN(val) || val <= 0) return;
    setSavingGoal(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("sellers").upsert({ id: user.id, weekly_revenue_goal: val });
        setWeeklyGoal(val);
      }
    } finally {
      setSavingGoal(false);
      setGoalModalOpen(false);
      setGoalInputVal("");
    }
  }

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setShopName(user.user_metadata?.shop_name ?? user.email?.split("@")[0] ?? "Mağaza");
    setSellerId(user.id);

    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    const [reviewsRes, returnsRes, productsRes, weekOrdersRes, sellerRes] = await Promise.all([
      supabase.from("reviews").select("id, rating, is_replied, is_urgent, created_at").eq("seller_id", user.id),
      supabase.from("returns").select("id, returned_at").eq("seller_id", user.id),
      supabase.from("products").select("description_score").eq("seller_id", user.id),
      supabase.from("orders").select("id, total_price").eq("seller_id", user.id).gte("ordered_at", weekAgo),
      supabase.from("sellers").select("weekly_revenue_goal").eq("id", user.id).single(),
    ]);

    const reviews = reviewsRes.data ?? [];
    const returns = returnsRes.data ?? [];
    const products = productsRes.data ?? [];
    const weekOrders = weekOrdersRes.data ?? [];
    if (sellerRes.data?.weekly_revenue_goal) setWeeklyGoal(sellerRes.data.weekly_revenue_goal);
    const wRevenue = weekOrders.reduce((s: number, o: { total_price: number | null }) => s + (o.total_price ?? 0), 0);
    setWeekRevenue(wRevenue);

    const avgRating = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "—";
    const returnsCount = returns.length;
    const unrepliedCount = reviews.filter((r: any) => !r.is_replied).length;
    const urgentCount = reviews.filter((r: any) => r.is_urgent && !r.is_replied).length;
    const lowScoreProducts = products.filter((p: any) => (p.description_score ?? 100) < 60).length;
    const weekReturns = returns.filter((r: any) => r.returned_at >= weekAgo).length;

    setPendingReturns(returnsCount);
    setUnreplied(unrepliedCount);

    // Sağlık skoru hesapla
    const replyScore = reviews.length > 0
      ? Math.round(((reviews.length - unrepliedCount) / reviews.length) * 30) : 30;
    const urgentScore = Math.max(0, 25 - urgentCount * 5);
    const productScore = products.length > 0
      ? Math.round(((products.length - lowScoreProducts) / products.length) * 25) : 25;
    let returnScore = 20;
    if (weekOrders.length > 0) {
      const rate = weekReturns / weekOrders.length;
      returnScore = rate <= 0.05 ? 20 : rate <= 0.10 ? 15 : rate <= 0.20 ? 8 : 0;
    }
    setHealthScore(Math.min(100, replyScore + urgentScore + productScore + returnScore));

    // AI Brief (async, non-blocking)
    setBriefLoading(true);
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/ai/daily-brief`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urgentReviews: urgentCount,
        pendingReviews: unrepliedCount,
        pendingQuestions: 0,
        weekReturns,
        lowScoreProducts,
        weekOrders: weekOrders.length,
        weekRevenue: wRevenue,
      }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.items) setBriefItems(d.items.slice(0, 3)); })
      .catch(() => {})
      .finally(() => setBriefLoading(false));

    setKpis([
      { label: "Toplam Yorum", value: reviews.length, color: "#3b82f6", bg: "#eff6ff", icon: "chatbubble", href: "/(tabs)/yorumlar" },
      { label: "Ort. Puan", value: avgRating, color: "#f97316", bg: "#fff7ed", icon: "star", href: "/(tabs)/yorumlar" },
      { label: "Toplam İade", value: returnsCount, color: "#ef4444", bg: "#fef2f2", icon: "cube", href: "/(tabs)/iadeler" },
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
      .select("id, rating, comment, product_name, is_replied, is_urgent, created_at")
      .eq("seller_id", user.id)
      .lte("rating", 2)
      .eq("is_replied", false)
      .order("created_at", { ascending: false })
      .limit(3);

    setUrgent(urgentData ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    setupNotificationHandler();
    registerForPushTokenAsync();
  }, []);

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

        {/* Sağlık Skoru */}
        {healthScore !== null && (() => {
          const sc = healthScore;
          const color = sc >= 80 ? "#16a34a" : sc >= 60 ? "#ca8a04" : sc >= 40 ? "#ea580c" : "#dc2626";
          const bg   = sc >= 80 ? "#f0fdf4"  : sc >= 60 ? "#fefce8"  : sc >= 40 ? "#fff7ed"  : "#fef2f2";
          const lbl  = sc >= 80 ? "Mükemmel" : sc >= 60 ? "İyi"       : sc >= 40 ? "Orta"     : "Dikkat";
          return (
            <View style={[styles.scoreCard, { backgroundColor: bg, borderColor: color + "40" }]}>
              <View style={styles.scoreLeft}>
                <Text style={[styles.scoreNum, { color }]}>{sc}</Text>
                <Text style={[styles.scoreMax, { color: color + "99" }]}>/100</Text>
              </View>
              <View style={styles.scoreMid} />
              <View style={styles.scoreRight}>
                <Text style={[styles.scoreTitle, { color: t.text }]}>Mağaza Sağlık Skoru</Text>
                <View style={[styles.scoreBadge, { backgroundColor: color + "20" }]}>
                  <Text style={[styles.scoreBadgeText, { color }]}>{lbl}</Text>
                </View>
                <View style={[styles.scoreBar, { backgroundColor: t.border }]}>
                  <View style={[styles.scoreBarFill, { width: `${sc}%` as any, backgroundColor: color }]} />
                </View>
              </View>
            </View>
          );
        })()}

        {/* Haftalık Hedef */}
        {weeklyGoal === null && (
          <TouchableOpacity
            style={[styles.goalCTA, { backgroundColor: t.card, borderColor: t.borderStrong }]}
            onPress={() => { setGoalInputVal(""); setGoalModalOpen(true); }}
          >
            <Ionicons name="flag-outline" size={16} color={t.orange} />
            <Text style={[styles.goalCTAText, { color: t.text }]}>Haftalık gelir hedefi belirle</Text>
            <Ionicons name="chevron-forward" size={14} color={t.textMuted} />
          </TouchableOpacity>
        )}

        {weeklyGoal !== null && (() => {
          const pct = Math.min(100, Math.round((weekRevenue / weeklyGoal) * 100));
          const dow = new Date().getDay();
          const daysIntoWeek = dow === 0 ? 7 : dow;
          const weekPct = Math.round((daysIntoWeek / 7) * 100);
          const isAhead = pct >= weekPct;
          const isComplete = pct >= 100;
          const color = isComplete ? "#16a34a" : isAhead ? "#16a34a" : "#ea580c";
          const bg    = isComplete ? "#f0fdf4"  : isAhead ? "#f0fdf4"  : "#fff7ed";
          const remaining = Math.max(0, weeklyGoal - weekRevenue);
          return (
            <View style={[styles.goalCard, { backgroundColor: bg, borderColor: color + "40" }]}>
              <View style={styles.goalHeader}>
                <Ionicons name="flag" size={14} color={color} />
                <Text style={[styles.goalTitle, { color: t.text }]}>Haftalık Gelir Hedefi</Text>
                <View style={[styles.goalBadge, { backgroundColor: color + "20" }]}>
                  <Text style={[styles.goalBadgeText, { color }]}>%{pct}</Text>
                </View>
                <TouchableOpacity onPress={() => { setGoalInputVal(String(weeklyGoal ?? "")); setGoalModalOpen(true); }} hitSlop={8}>
                  <Ionicons name="pencil-outline" size={14} color={t.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={styles.goalAmounts}>
                <Text style={[styles.goalCurrent, { color }]}>
                  {weekRevenue.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₺
                </Text>
                <Text style={[styles.goalTarget, { color: t.textMuted }]}>
                  / {weeklyGoal.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₺
                </Text>
              </View>
              <View style={[styles.goalBar, { backgroundColor: t.border }]}>
                <View style={[styles.goalBarFill, { width: `${pct}%` as any, backgroundColor: color }]} />
              </View>
              <Text style={[styles.goalMsg, { color: t.textMuted }]}>
                {isComplete
                  ? "Tebrikler! Hedefinize ulaştınız 🎉"
                  : isAhead
                  ? `${remaining.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ₺ kaldı, harika gidiyorsunuz!`
                  : `Hedefin gerisinde. ${remaining.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ₺ kaldı`}
              </Text>
            </View>
          );
        })()}

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
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={QUICK_ITEMS}
          keyExtractor={(item) => item.label}
          contentContainerStyle={styles.quickList}
          style={styles.quickScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: t.card, borderColor: t.borderStrong }]}
              onPress={() => { Haptics.selectionAsync(); router.push(item.href as any); }}
            >
              <View style={[styles.quickIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <Text style={[styles.quickLabel, { color: t.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={14} color={t.textMuted} />
            </TouchableOpacity>
          )}
        />

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

        {/* AI Günlük Brief */}
        {(briefLoading || briefItems.length > 0) && (
          <View style={[styles.briefCard, { backgroundColor: t.card, borderColor: t.borderStrong }]}>
            <View style={styles.briefHeader}>
              <Ionicons name="sparkles" size={16} color={t.orange} />
              <Text style={[styles.briefTitle, { color: t.text }]}>AI Günlük Analizi</Text>
              <View style={[styles.briefBadge, { backgroundColor: "#fff7ed" }]}>
                <Text style={{ fontSize: 10, color: t.orange, fontWeight: "700" }}>Bugün için</Text>
              </View>
            </View>
            {briefLoading ? (
              <View style={styles.briefLoading}>
                <Ionicons name="reload" size={14} color={t.textMuted} />
                <Text style={[styles.briefLoadingText, { color: t.textMuted }]}>Analiz ediliyor…</Text>
              </View>
            ) : (
              briefItems.map((item, i) => (
                <View key={i} style={styles.briefItem}>
                  <View style={[styles.briefNum, { backgroundColor: t.orange }]}>
                    <Text style={styles.briefNumText}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.briefText, { color: t.textSub }]}>{item}</Text>
                </View>
              ))
            )}
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

      {/* Hedef Düzenleme Modalı */}
      <Modal visible={goalModalOpen} transparent animationType="fade" onRequestClose={() => setGoalModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setGoalModalOpen(false)} />
          <View style={[styles.modalBox, { backgroundColor: t.card }]}>
            <Text style={[styles.modalTitle, { color: t.text }]}>Haftalık Gelir Hedefi</Text>
            <Text style={[styles.modalSub, { color: t.textMuted }]}>Bu haftaki ciro hedefinizi girin (₺)</Text>
            <View style={[styles.modalInputRow, { backgroundColor: t.input, borderColor: t.border }]}>
              <Text style={[styles.modalCurrency, { color: t.textMuted }]}>₺</Text>
              <TextInput
                style={[styles.modalInput, { color: t.text }]}
                value={goalInputVal}
                onChangeText={setGoalInputVal}
                keyboardType="numeric"
                placeholder="Örn: 10000"
                placeholderTextColor={t.textMuted}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={saveGoalMobile}
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalCancel, { borderColor: t.border }]} onPress={() => setGoalModalOpen(false)}>
                <Text style={[styles.modalCancelText, { color: t.textSub }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, { backgroundColor: t.orange, opacity: savingGoal ? 0.6 : 1 }]}
                onPress={saveGoalMobile}
                disabled={savingGoal}
              >
                <Text style={styles.modalSaveText}>{savingGoal ? "Kaydediliyor…" : "Kaydet"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  quickScroll: { marginHorizontal: -16, marginBottom: 12 },
  quickList: { paddingHorizontal: 16, gap: 10 },
  quickCard: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, padding: 14, borderWidth: 1, width: 160 },
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
  scoreCard: { flexDirection: "row", alignItems: "center", gap: 16, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1 },
  scoreLeft: { alignItems: "center", width: 64 },
  scoreNum: { fontSize: 40, fontWeight: "900", lineHeight: 44 },
  scoreMax: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  scoreMid: { width: 1, alignSelf: "stretch", backgroundColor: "#e5e7eb" },
  scoreRight: { flex: 1, gap: 6 },
  scoreTitle: { fontSize: 13, fontWeight: "700" },
  scoreBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  scoreBadgeText: { fontSize: 11, fontWeight: "700" },
  scoreBar: { height: 6, borderRadius: 3, overflow: "hidden", marginTop: 2 },
  scoreBarFill: { height: 6, borderRadius: 3 },
  briefCard: { borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1 },
  briefHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  briefTitle: { fontSize: 14, fontWeight: "700", flex: 1 },
  briefBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  briefLoading: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  briefLoadingText: { fontSize: 13 },
  briefItem: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  briefNum: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  briefNumText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  briefText: { flex: 1, fontSize: 13, lineHeight: 19 },
  goalCard: { borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1 },
  goalHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  goalTitle: { fontSize: 13, fontWeight: "700", flex: 1 },
  goalBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  goalBadgeText: { fontSize: 11, fontWeight: "700" },
  goalAmounts: { flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 8 },
  goalCurrent: { fontSize: 28, fontWeight: "900" },
  goalTarget: { fontSize: 13, fontWeight: "500" },
  goalBar: { height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 6 },
  goalBarFill: { height: 6, borderRadius: 3 },
  goalMsg: { fontSize: 12, lineHeight: 17 },
  goalCTA: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1 },
  goalCTAText: { flex: 1, fontSize: 13, fontWeight: "600" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", paddingBottom: 32, paddingHorizontal: 16 },
  modalBox: { borderRadius: 20, padding: 24, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: -4 }, elevation: 10 },
  modalTitle: { fontSize: 17, fontWeight: "800", marginBottom: 4 },
  modalSub: { fontSize: 13, marginBottom: 18 },
  modalInputRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, marginBottom: 20, height: 52 },
  modalCurrency: { fontSize: 18, fontWeight: "700", marginRight: 6 },
  modalInput: { flex: 1, fontSize: 20, fontWeight: "700" },
  modalActions: { flexDirection: "row", gap: 10 },
  modalCancel: { flex: 1, borderWidth: 1, borderRadius: 12, height: 48, alignItems: "center", justifyContent: "center" },
  modalCancelText: { fontSize: 15, fontWeight: "600" },
  modalSave: { flex: 2, borderRadius: 12, height: 48, alignItems: "center", justifyContent: "center" },
  modalSaveText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
