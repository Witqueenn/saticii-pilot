import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Svg, G, Path, Circle, Polyline, Line, Text as SvgText } from "react-native-svg";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/lib/Skeleton";
import { useTheme } from "@/lib/theme";

interface Review { rating: number; created_at: string; is_replied: boolean; }
interface Return { created_at: string; reason: string; }
interface Order { ordered_at: string; total_price: number | null; }

// Basit pie chart — 5 dilim (1-5 yıldız)
function PieChart({ data, centerFill, textColor }: { data: { value: number; color: string }[]; centerFill: string; textColor: string }) {
  const SIZE = 160, R = 68, CX = 80, CY = 80;
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  let cumAngle = -Math.PI / 2;
  const paths: { d: string; color: string }[] = [];

  data.forEach(({ value, color }) => {
    if (value === 0) return;
    const angle = (value / total) * 2 * Math.PI;
    const x1 = CX + R * Math.cos(cumAngle);
    const y1 = CY + R * Math.sin(cumAngle);
    const x2 = CX + R * Math.cos(cumAngle + angle);
    const y2 = CY + R * Math.sin(cumAngle + angle);
    const large = angle > Math.PI ? 1 : 0;
    paths.push({
      d: `M${CX},${CY} L${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} Z`,
      color,
    });
    cumAngle += angle;
  });

  return (
    <Svg width={SIZE} height={SIZE}>
      <G>
        {paths.map((p, i) => <Path key={i} d={p.d} fill={p.color} stroke={centerFill} strokeWidth={2} />)}
        <Circle cx={CX} cy={CY} r={36} fill={centerFill} />
        <SvgText x={CX} y={CY + 5} textAnchor="middle" fontSize={14} fontWeight="bold" fill={textColor}>
          {total}
        </SvgText>
      </G>
    </Svg>
  );
}

function MiniSparkline({ values, color, lineColor }: { values: number[]; color: string; lineColor: string }) {
  const W = 200, H = 40;
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - (v / max) * (H - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  return (
    <Svg width={W} height={H}>
      <Line x1={0} y1={H} x2={W} y2={H} stroke={lineColor} strokeWidth={1} />
      <Polyline points={points} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const STAR_COLORS = ["#dc2626", "#f97316", "#eab308", "#22c55e", "#3b82f6"];

export default function IstatistikScreen() {
  const t = useTheme();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [returns, setReturns] = useState<Return[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const since8w = new Date(Date.now() - 56 * 86400000).toISOString();
    const [rRes, retRes, ordRes] = await Promise.all([
      supabase.from("reviews").select("rating, created_at, is_replied").eq("seller_id", user.id),
      supabase.from("returns").select("created_at, reason").eq("seller_id", user.id),
      supabase.from("orders").select("ordered_at, total_price").eq("seller_id", user.id).gte("ordered_at", since8w),
    ]);
    setReviews(rRes.data ?? []);
    setReturns(retRes.data ?? []);
    setOrders(ordRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={["top"]}>
        <View style={[styles.header, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
          <Text style={[styles.title, { color: t.text }]}>İstatistikler</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={160} style={{ borderRadius: 16 }} />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Yıldız dağılımı
  const starCounts = [1, 2, 3, 4, 5].map((star) => reviews.filter((r) => r.rating === star).length);
  const pieData = starCounts.map((v, i) => ({ value: v, color: STAR_COLORS[i] }));
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  // Son 8 hafta yorum trendi
  const weeklyReviews: number[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = new Date(); start.setDate(start.getDate() - i * 7);
    const end = new Date(); end.setDate(end.getDate() - (i - 1) * 7);
    weeklyReviews.push(
      reviews.filter((r) => {
        const d = new Date(r.created_at);
        return d >= start && d < end;
      }).length
    );
  }

  // Yanıt oranı
  const replied = reviews.filter((r) => r.is_replied).length;
  const replyRate = reviews.length ? Math.round((replied / reviews.length) * 100) : 0;

  // 8 haftalık gelir verisi
  const weeklyRevenue: { label: string; revenue: number; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = new Date(); start.setDate(start.getDate() - i * 7);
    const end   = new Date(); end.setDate(end.getDate() - (i - 1) * 7);
    const week = orders.filter((o) => {
      const d = new Date(o.ordered_at);
      return d >= start && d < end;
    });
    const revenue = week.reduce((s, o) => s + (o.total_price ?? 0), 0);
    const weekNum = 8 - i;
    weeklyRevenue.push({
      label: i === 0 ? "Bu" : `H${weekNum}`,
      revenue,
      count: week.length,
    });
  }
  const thisWeekRev  = weeklyRevenue[7].revenue;
  const lastWeekRev  = weeklyRevenue[6].revenue;
  const thisWeekOrders = weeklyRevenue[7].count;
  const lastWeekOrders = weeklyRevenue[6].count;
  const revDiff = lastWeekRev > 0 ? Math.round(((thisWeekRev - lastWeekRev) / lastWeekRev) * 100) : null;
  const maxRev   = Math.max(...weeklyRevenue.map((w) => w.revenue), 1);

  // İade özeti (son 30 gün)
  const since30 = new Date(); since30.setDate(since30.getDate() - 30);
  const recentReturns = returns.filter((r) => new Date(r.created_at) >= since30).length;
  const topReasonEntry = Object.entries(
    returns.reduce((acc: Record<string, number>, r) => { acc[r.reason] = (acc[r.reason] ?? 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1])[0];
  const topReasonPct = topReasonEntry && returns.length ? Math.round((topReasonEntry[1] / returns.length) * 100) : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
        <Text style={[styles.title, { color: t.text }]}>İstatistikler</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.orange} />}
      >
        {/* Haftalık Gelir */}
        <View style={[styles.card, { backgroundColor: t.card }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: t.text }]}>Haftalık Gelir Trendi</Text>
            <Text style={[styles.cardSub, { color: t.textMuted }]}>Son 8 hafta</Text>
          </View>

          {/* Bar chart */}
          <View style={styles.barChart}>
            {weeklyRevenue.map((w, i) => {
              const barH = Math.max((w.revenue / maxRev) * 72, w.revenue > 0 ? 8 : 2);
              const isThis = i === 7;
              return (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, {
                      height: barH,
                      backgroundColor: isThis ? t.orange : (t.orange + "55"),
                      borderRadius: 4,
                    }]} />
                  </View>
                  <Text style={[styles.barLabel, { color: isThis ? t.orange : t.textMuted, fontWeight: isThis ? "800" : "400" }]}>{w.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Bu hafta vs geçen hafta */}
          <View style={[styles.revCompare, { borderTopColor: t.border }]}>
            <View style={styles.revSide}>
              <Text style={[styles.revAmount, { color: t.text }]}>
                {thisWeekRev.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₺
              </Text>
              <Text style={[styles.revLabel, { color: t.textMuted }]}>Bu hafta • {thisWeekOrders} sipariş</Text>
            </View>
            <View style={styles.revSide}>
              <Text style={[styles.revAmount, { color: t.textSub }]}>
                {lastWeekRev.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₺
              </Text>
              <Text style={[styles.revLabel, { color: t.textMuted }]}>Geçen hafta • {lastWeekOrders} sipariş</Text>
            </View>
            {revDiff !== null && (
              <View style={[styles.revBadge, { backgroundColor: revDiff >= 0 ? "#f0fdf4" : "#fef2f2" }]}>
                <Text style={[styles.revBadgeText, { color: revDiff >= 0 ? "#16a34a" : "#dc2626" }]}>
                  {revDiff >= 0 ? "+" : ""}{revDiff}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Yıldız dağılımı */}
        <View style={[styles.card, { backgroundColor: t.card }]}>
          <Text style={[styles.cardTitle, { color: t.text }]}>Yıldız Dağılımı</Text>
          <View style={styles.pieRow}>
            <PieChart data={pieData} centerFill={t.card} textColor={t.text} />
            <View style={styles.pieLegend}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = starCounts[star - 1];
                const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                return (
                  <View key={star} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: STAR_COLORS[star - 1] }]} />
                    <Text style={[styles.legendLabel, { color: t.textSub }]}>{star}★</Text>
                    <Text style={[styles.legendCount, { color: t.text }]}>{count}</Text>
                    <Text style={[styles.legendPct, { color: t.textMuted }]}>{pct}%</Text>
                  </View>
                );
              })}
              <View style={[styles.avgRow, { borderTopColor: t.border }]}>
                <Text style={[styles.avgLabel, { color: t.textSub }]}>Ortalama</Text>
                <Text style={[styles.avgValue, { color: t.orange }]}>{avgRating} ★</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Haftalık trend */}
        <View style={[styles.card, { backgroundColor: t.card }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: t.text }]}>Haftalık Yorum Trendi</Text>
            <Text style={[styles.cardSub, { color: t.textMuted }]}>Son 8 hafta</Text>
          </View>
          <MiniSparkline values={weeklyReviews} color={t.orange} lineColor={t.border} />
          <View style={styles.trendFooter}>
            <Text style={[styles.trendLabel, { color: t.textMuted }]}>8 hafta önce: {weeklyReviews[0]}</Text>
            <Text style={[styles.trendLabel, { color: t.textMuted }]}>Bu hafta: {weeklyReviews[weeklyReviews.length - 1]}</Text>
          </View>
        </View>

        {/* Yanıt oranı */}
        <View style={[styles.card, { backgroundColor: t.card }]}>
          <Text style={[styles.cardTitle, { color: t.text }]}>Yanıt Oranı</Text>
          <View style={styles.rateRow}>
            <View style={[styles.rateCircle, { backgroundColor: "#f0fdf4" }]}>
              <Text style={styles.rateValue}>{replyRate}%</Text>
              <Text style={[styles.rateLabel, { color: t.textSub }]}>yanıtlandı</Text>
            </View>
            <View style={styles.rateStats}>
              <StatLine label="Toplam yorum" value={reviews.length} valueColor={t.text} labelColor={t.textSub} />
              <StatLine label="Yanıtlanan" value={replied} valueColor="#059669" labelColor={t.textSub} />
              <StatLine label="Bekleyen" value={reviews.length - replied} valueColor="#d97706" labelColor={t.textSub} />
            </View>
          </View>
          <View style={[styles.progressBg, { backgroundColor: t.input }]}>
            <View style={[styles.progressFill, { width: `${replyRate}%`, backgroundColor: replyRate >= 70 ? "#059669" : replyRate >= 40 ? "#d97706" : "#dc2626" }]} />
          </View>
        </View>

        {/* İade özeti */}
        <View style={[styles.card, { backgroundColor: t.card }]}>
          <Text style={[styles.cardTitle, { color: t.text }]}>İade Özeti</Text>
          <View style={styles.returnGrid}>
            <ReturnStat label="Toplam" value={returns.length} valueColor={t.text} labelColor={t.textMuted} bgColor={t.bg} />
            <ReturnStat label="Son 30 gün" value={recentReturns} valueColor={t.orange} labelColor={t.textMuted} bgColor={t.bg} />
            <ReturnStat label="En sık neden" value={`%${topReasonPct}`} valueColor="#dc2626" labelColor={t.textMuted} bgColor={t.bg} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatLine({ label, value, valueColor, labelColor }: { label: string; value: number; valueColor: string; labelColor: string }) {
  return (
    <View style={styles.statLine}>
      <Text style={[styles.statLineLabel, { color: labelColor }]}>{label}</Text>
      <Text style={[styles.statLineValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function ReturnStat({ label, value, valueColor, labelColor, bgColor }: { label: string; value: number | string; valueColor: string; labelColor: string; bgColor: string }) {
  return (
    <View style={[styles.returnStat, { backgroundColor: bgColor }]}>
      <Text style={[styles.returnStatValue, { color: valueColor }]}>{value}</Text>
      <Text style={[styles.returnStatLabel, { color: labelColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 22, fontWeight: "800" },
  container: { padding: 16, gap: 14, paddingBottom: 40 },
  card: { borderRadius: 18, padding: 18, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 16 },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardSub: { fontSize: 12 },
  pieRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  pieLegend: { flex: 1, gap: 6 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 13, width: 24 },
  legendCount: { fontSize: 13, fontWeight: "700", flex: 1 },
  legendPct: { fontSize: 12 },
  avgRow: { borderTopWidth: 1, paddingTop: 8, marginTop: 4, flexDirection: "row", justifyContent: "space-between" },
  avgLabel: { fontSize: 13 },
  avgValue: { fontSize: 14, fontWeight: "800" },
  trendFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  trendLabel: { fontSize: 11 },
  rateRow: { flexDirection: "row", alignItems: "center", gap: 20, marginBottom: 14 },
  rateCircle: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  rateValue: { fontSize: 20, fontWeight: "800", color: "#059669" },
  rateLabel: { fontSize: 10 },
  rateStats: { flex: 1, gap: 8 },
  statLine: { flexDirection: "row", justifyContent: "space-between" },
  statLineLabel: { fontSize: 13 },
  statLineValue: { fontSize: 13, fontWeight: "700" },
  progressBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  returnGrid: { flexDirection: "row", gap: 8 },
  returnStat: { flex: 1, borderRadius: 12, padding: 14, alignItems: "center" },
  returnStatValue: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  returnStatLabel: { fontSize: 11, fontWeight: "600" },
  barChart: { flexDirection: "row", alignItems: "flex-end", height: 88, gap: 4, marginBottom: 16 },
  barCol: { flex: 1, alignItems: "center", gap: 4 },
  barWrapper: { height: 72, justifyContent: "flex-end", width: "100%" },
  bar: { width: "100%" },
  barLabel: { fontSize: 9 },
  revCompare: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, borderTopWidth: 1 },
  revSide: { flex: 1 },
  revAmount: { fontSize: 15, fontWeight: "800" },
  revLabel: { fontSize: 10, marginTop: 2 },
  revBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  revBadgeText: { fontSize: 13, fontWeight: "800" },
});
