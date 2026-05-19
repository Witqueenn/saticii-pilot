import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/theme";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CompetitorRow {
  id: string;
  our_product_id: string;
  our_product_name: string;
  our_price: number;
  competitor_name: string;
  competitor_product_name: string | null;
  competitor_price: number;
  category: string | null;
  checked_at: string;
}

interface ProductGroup {
  our_product_id: string;
  our_product_name: string;
  our_price: number;
  minCompetitorPrice: number;
  latestCheckedAt: string;
  competitors: CompetitorRow[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatus(our: number, min: number): "pahali" | "uygun" | "ucuz" {
  const ratio = our / min;
  if (ratio > 1.05) return "pahali";
  if (ratio < 0.95) return "ucuz";
  return "uygun";
}

function timeAgo(iso: string) {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hours < 1) return "az önce";
  if (hours < 24) return `${hours} saat önce`;
  return `${Math.floor(hours / 24)} gün önce`;
}

function fmt(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function groupRows(rows: CompetitorRow[]): ProductGroup[] {
  const map = new Map<string, ProductGroup>();
  for (const row of rows) {
    const existing = map.get(row.our_product_id);
    if (!existing) {
      map.set(row.our_product_id, {
        our_product_id: row.our_product_id,
        our_product_name: row.our_product_name,
        our_price: row.our_price,
        minCompetitorPrice: row.competitor_price,
        latestCheckedAt: row.checked_at,
        competitors: [row],
      });
    } else {
      existing.competitors.push(row);
      if (row.competitor_price < existing.minCompetitorPrice) {
        existing.minCompetitorPrice = row.competitor_price;
      }
      if (new Date(row.checked_at) > new Date(existing.latestCheckedAt)) {
        existing.latestCheckedAt = row.checked_at;
      }
    }
  }
  return Array.from(map.values());
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PriceDiffBadge({ our, min, t }: { our: number; min: number; t: ReturnType<typeof useTheme> }) {
  const status = getStatus(our, min);
  const diff = Math.abs(our - min);

  if (status === "pahali") {
    return (
      <View style={[styles.diffBadge, { backgroundColor: "#fef2f2" }]}>
        <Text style={[styles.diffBadgeText, { color: "#ef4444" }]}>₺{fmt(diff)} daha pahalı</Text>
      </View>
    );
  }
  if (status === "ucuz") {
    return (
      <View style={[styles.diffBadge, { backgroundColor: "#f0fdf4" }]}>
        <Text style={[styles.diffBadgeText, { color: "#22c55e" }]}>₺{fmt(diff)} daha ucuz</Text>
      </View>
    );
  }
  return (
    <View style={[styles.diffBadge, { backgroundColor: t.input }]}>
      <Text style={[styles.diffBadgeText, { color: t.textMuted }]}>Benzer fiyat</Text>
    </View>
  );
}

function RecommendationText({ status, t }: { status: "pahali" | "uygun" | "ucuz"; t: ReturnType<typeof useTheme> }) {
  let icon: React.ComponentProps<typeof Ionicons>["name"];
  let color: string;
  let text: string;

  if (status === "pahali") {
    icon = "trending-down";
    color = "#ef4444";
    text = "Fiyatını düşürmeyi düşün. Rakipler bu ürünü daha ucuza satıyor — satış kaybedebilirsin.";
  } else if (status === "ucuz") {
    icon = "trending-up";
    color = "#22c55e";
    text = "Fiyatın rekabetçi! Gerekirse küçük bir artışla marjını iyileştirebilirsin.";
  } else {
    icon = "checkmark-circle";
    color = t.orange;
    text = "Fiyatın rakiplere yakın. Şu anlık dengeli bir pozisyondasın.";
  }

  return (
    <View style={[styles.recommendBox, { backgroundColor: t.input, borderColor: t.border }]}>
      <Ionicons name={icon} size={18} color={color} style={{ marginRight: 8 }} />
      <Text style={[styles.recommendText, { color: t.textSub }]}>{text}</Text>
    </View>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  group,
  visible,
  onClose,
  t,
}: {
  group: ProductGroup | null;
  visible: boolean;
  onClose: () => void;
  t: ReturnType<typeof useTheme>;
}) {
  if (!group) return null;
  const status = getStatus(group.our_price, group.minCompetitorPrice);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.modalSafe, { backgroundColor: t.bg }]} edges={["top", "bottom"]}>
        {/* Modal header */}
        <View style={[styles.modalHeader, { borderBottomColor: t.border }]}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={t.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: t.text }]} numberOfLines={1}>
            {group.our_product_name}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Our price highlight */}
          <View style={[styles.ourPriceBox, { backgroundColor: t.card, borderColor: t.orange }]}>
            <Text style={[styles.ourPriceLabel, { color: t.textSub }]}>Bizim Fiyatımız</Text>
            <Text style={[styles.ourPriceValue, { color: t.orange }]}>₺{fmt(group.our_price)}</Text>
          </View>

          {/* Recommendation */}
          <RecommendationText status={status} t={t} />

          {/* Competitor list */}
          <Text style={[styles.competitorListTitle, { color: t.text }]}>Rakip Fiyatları</Text>

          {group.competitors.map((c) => {
            const gap = group.our_price - c.competitor_price;
            const gapColor = gap > 0 ? "#ef4444" : gap < 0 ? "#22c55e" : t.textMuted;
            return (
              <View
                key={c.id}
                style={[styles.competitorRow, { backgroundColor: t.card, borderColor: t.borderStrong }]}
              >
                <View style={styles.competitorLeft}>
                  <Text style={[styles.competitorName, { color: t.text }]}>{c.competitor_name}</Text>
                  {c.competitor_product_name ? (
                    <Text style={[styles.competitorProductName, { color: t.textMuted }]} numberOfLines={1}>
                      {c.competitor_product_name}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.competitorRight}>
                  <Text style={[styles.competitorPrice, { color: t.text }]}>₺{fmt(c.competitor_price)}</Text>
                  {gap !== 0 && (
                    <Text style={[styles.competitorGap, { color: gapColor }]}>
                      {gap > 0 ? `+₺${fmt(gap)}` : `-₺${fmt(Math.abs(gap))}`}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}

          <Text style={[styles.lastChecked, { color: t.textMuted }]}>
            Son kontrol: {timeAgo(group.latestCheckedAt)}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ t }: { t: ReturnType<typeof useTheme> }) {
  return (
    <View style={styles.emptyCentered}>
      <View style={[styles.emptyCard, { backgroundColor: t.card, borderColor: t.borderStrong }]}>
        <View style={[styles.emptyIconWrap, { backgroundColor: t.input }]}>
          <Ionicons name="analytics-outline" size={32} color={t.textMuted} />
        </View>
        <Text style={[styles.emptyTitle, { color: t.text }]}>Henüz rakip verisi yok</Text>
        <Text style={[styles.emptySubtitle, { color: t.textSub }]}>
          Trendyol mağazanı bağladıktan sonra rakip fiyatları otomatik takip edilir.
        </Text>
        <View style={[styles.emptyNote, { backgroundColor: t.input }]}>
          <Ionicons name="lock-closed" size={13} color={t.orange} />
          <Text style={[styles.emptyNoteText, { color: t.textMuted }]}>Bu özellik Pro planında aktif.</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function RakipScreen() {
  const t = useTheme();
  const [rows, setRows] = useState<CompetitorRow[]>([]);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from("competitor_prices")
      .select("*")
      .order("checked_at", { ascending: false });

    if (!error && data) {
      setRows(data as CompetitorRow[]);
      setGroups(groupRows(data as CompetitorRow[]));
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function openDetail(group: ProductGroup) {
    Haptics.selectionAsync();
    setSelectedGroup(group);
    setModalVisible(true);
  }

  // ── Summary counts ──
  const pahaliCount = groups.filter(
    (g) => getStatus(g.our_price, g.minCompetitorPrice) === "pahali"
  ).length;
  const uygunCount = groups.filter(
    (g) => getStatus(g.our_price, g.minCompetitorPrice) !== "pahali"
  ).length;

  // ── Render item ──
  function renderGroup({ item }: { item: ProductGroup }) {
    const status = getStatus(item.our_price, item.minCompetitorPrice);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: t.card, borderColor: t.borderStrong }]}
        onPress={() => openDetail(item)}
        activeOpacity={0.8}
      >
        {/* Product name */}
        <Text style={[styles.productName, { color: t.text }]} numberOfLines={2}>
          {item.our_product_name}
        </Text>

        {/* Price row */}
        <View style={styles.priceRow}>
          <View>
            <Text style={[styles.priceLabel, { color: t.textMuted }]}>Bizim fiyat</Text>
            <Text style={[styles.priceValue, { color: t.text }]}>₺{fmt(item.our_price)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color={t.textMuted} style={{ marginHorizontal: 8, alignSelf: "center" }} />
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.priceLabel, { color: t.textMuted }]}>En düşük rakip</Text>
            <Text style={[styles.priceValue, { color: t.text }]}>₺{fmt(item.minCompetitorPrice)}</Text>
          </View>
        </View>

        {/* Badge + time row */}
        <View style={styles.cardFooter}>
          <PriceDiffBadge our={item.our_price} min={item.minCompetitorPrice} t={t} />
          <Text style={[styles.timeAgoText, { color: t.textMuted }]}>{timeAgo(item.latestCheckedAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.text }]}>Rakip Analizi</Text>
        <View style={[styles.proBadge, { backgroundColor: t.orange }]}>
          <Text style={styles.proBadgeText}>PRO</Text>
        </View>
      </View>

      {/* Summary bar */}
      {!loading && groups.length > 0 && (
        <View style={[styles.summaryBar, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
          <View style={[styles.summaryPill, { backgroundColor: t.card, borderColor: t.borderStrong }]}>
            <Ionicons name="cube-outline" size={13} color={t.textSub} />
            <Text style={[styles.summaryPillText, { color: t.text }]}>
              {groups.length} ürün
            </Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}>
            <Ionicons name="trending-up" size={13} color="#ef4444" />
            <Text style={[styles.summaryPillText, { color: "#ef4444" }]}>
              {pahaliCount} pahalı
            </Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }]}>
            <Ionicons name="checkmark-circle-outline" size={13} color="#22c55e" />
            <Text style={[styles.summaryPillText, { color: "#22c55e" }]}>
              {uygunCount} uygun
            </Text>
          </View>
        </View>
      )}

      {/* List / empty */}
      {!loading && groups.length === 0 ? (
        <EmptyState t={t} />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.our_product_id}
          renderItem={renderGroup}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={t.orange}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Detail modal */}
      <DetailModal
        group={selectedGroup}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        t={t}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "700", textAlign: "center", marginRight: -30 },
  proBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  proBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },

  // Summary bar
  summaryBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  summaryPillText: { fontSize: 12, fontWeight: "600" },

  // List
  listContent: { padding: 16, paddingBottom: 40, gap: 10 },

  // Product card
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  productName: { fontSize: 14, fontWeight: "700", lineHeight: 20 },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceLabel: { fontSize: 11, fontWeight: "500", marginBottom: 2 },
  priceValue: { fontSize: 16, fontWeight: "700" },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Price diff badge
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  diffBadgeText: { fontSize: 12, fontWeight: "600" },

  // Time
  timeAgoText: { fontSize: 11 },

  // Empty state
  emptyCentered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyCard: {
    width: "100%",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    gap: 12,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", textAlign: "center" },
  emptySubtitle: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  emptyNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 4,
  },
  emptyNoteText: { fontSize: 12, fontWeight: "500" },

  // Modal
  modalSafe: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: { flex: 1, fontSize: 16, fontWeight: "700", textAlign: "center", marginHorizontal: 8 },
  modalContent: { padding: 16, paddingBottom: 40, gap: 12 },

  ourPriceBox: {
    borderRadius: 14,
    borderWidth: 2,
    padding: 18,
    alignItems: "center",
  },
  ourPriceLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  ourPriceValue: { fontSize: 32, fontWeight: "800" },

  recommendBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  recommendText: { flex: 1, fontSize: 13, lineHeight: 19 },

  competitorListTitle: { fontSize: 14, fontWeight: "700", marginTop: 4 },

  competitorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  competitorLeft: { flex: 1, marginRight: 12 },
  competitorName: { fontSize: 13, fontWeight: "600" },
  competitorProductName: { fontSize: 11, marginTop: 2 },
  competitorRight: { alignItems: "flex-end" },
  competitorPrice: { fontSize: 15, fontWeight: "700" },
  competitorGap: { fontSize: 11, fontWeight: "600", marginTop: 2 },

  lastChecked: { fontSize: 11, textAlign: "center", marginTop: 8 },
});
