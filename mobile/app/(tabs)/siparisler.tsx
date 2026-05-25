import { useEffect, useState, useCallback } from "react";
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
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";
import { SkeletonCard } from "@/lib/Skeleton";
import { useTheme } from "@/lib/theme";

interface LineItem {
  product_id: string;
  product_name: string;
  barcode: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  marketplace_order_id: string;
  status: string;
  total_price: number | null;
  line_items: LineItem[] | null;
  ordered_at: string;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ComponentProps<typeof Ionicons>["name"] }> = {
  created:   { label: "Yeni",             color: "#2563eb", bg: "#dbeafe", icon: "add-circle-outline" },
  picking:   { label: "Hazırlanıyor",     color: "#d97706", bg: "#fef3c7", icon: "construct-outline" },
  invoiced:  { label: "Faturalandı",      color: "#7c3aed", bg: "#ede9fe", icon: "document-text-outline" },
  shipped:   { label: "Kargoda",          color: "#ea580c", bg: "#ffedd5", icon: "cube-outline" },
  delivered: { label: "Teslim Edildi",    color: "#16a34a", bg: "#dcfce7", icon: "checkmark-circle-outline" },
  cancelled: { label: "İptal",            color: "#dc2626", bg: "#fee2e2", icon: "close-circle-outline" },
  returned:  { label: "İade",             color: "#6b7280", bg: "#f3f4f6", icon: "return-down-back-outline" },
};

const FILTER_OPTS = [
  { label: "Tümü", value: "all" },
  { label: "Yeni", value: "created" },
  { label: "Kargo", value: "shipped" },
  { label: "Teslim", value: "delivered" },
  { label: "İptal", value: "cancelled" },
];

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

function fmtCurrency(n: number) {
  return n.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
}

export default function SiparislerScreen() {
  const t = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const weekAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    const { data } = await supabase
      .from("orders")
      .select("id, marketplace_order_id, status, total_price, line_items, ordered_at")
      .eq("seller_id", user.id)
      .gte("ordered_at", weekAgo)
      .order("ordered_at", { ascending: false })
      .limit(200);

    setOrders(data ?? []);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  // Özet istatistikler
  const weekStart = new Date(Date.now() - 7 * 86400000).toISOString();
  const week = orders.filter((o) => o.ordered_at >= weekStart);
  const weekRevenue = week.reduce((s, o) => s + (o.total_price ?? 0), 0);
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const pending = orders.filter((o) => ["created", "picking", "invoiced", "shipped"].includes(o.status)).length;

  function openOrder(o: Order) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(o);
  }

  const statusMeta = (status: string) =>
    STATUS_META[status] ?? { label: status, color: "#6b7280", bg: "#f3f4f6", icon: "ellipse-outline" as const };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: t.border, backgroundColor: t.headerBg }]}>
        <View>
          <Text style={[styles.title, { color: t.text }]}>Siparişler</Text>
          <Text style={[styles.subtitle, { color: t.textMuted }]}>Son 30 gün</Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: t.pillBg }]}>
          <Text style={[styles.countText, { color: t.orange }]}>{orders.length} sipariş</Text>
        </View>
      </View>

      {/* Özet şerit */}
      {!loading && (
        <View style={[styles.statsRow, { backgroundColor: t.card, borderBottomColor: t.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: t.orange }]}>{week.length}</Text>
            <Text style={[styles.statLabel, { color: t.textMuted }]}>Bu hafta</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: t.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#16a34a" }]}>{fmtCurrency(weekRevenue)}</Text>
            <Text style={[styles.statLabel, { color: t.textMuted }]}>Haftalık ciro</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: t.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#2563eb" }]}>{pending}</Text>
            <Text style={[styles.statLabel, { color: t.textMuted }]}>İşlemde</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: t.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: t.textSub }]}>{delivered}</Text>
            <Text style={[styles.statLabel, { color: t.textMuted }]}>Teslim</Text>
          </View>
        </View>
      )}

      {/* Filtreler */}
      <View style={[styles.filtersWrap, { borderBottomColor: t.border }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_OPTS}
          keyExtractor={(f) => f.value}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[
                styles.filterBtn,
                { backgroundColor: t.input },
                filter === f.value && { backgroundColor: t.orange },
              ]}
              onPress={() => { Haptics.selectionAsync(); setFilter(f.value); }}
            >
              <Text style={[
                styles.filterText,
                { color: t.textSub },
                filter === f.value && styles.filterTextActive,
              ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Liste */}
      {loading ? (
        <ScrollView contentContainerStyle={styles.list}>
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </ScrollView>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.orange} />}
          renderItem={({ item: o }) => {
            const sm = statusMeta(o.status);
            const lines = o.line_items ?? [];
            const firstProduct = lines[0]?.product_name || `#${o.marketplace_order_id.slice(-8)}`;
            const extraCount = lines.length - 1;
            return (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: t.card, borderColor: t.borderStrong, borderLeftColor: sm.color, borderLeftWidth: 3 }]}
                onPress={() => openOrder(o)}
                activeOpacity={0.75}
              >
                <View style={styles.cardTop}>
                  <Text style={[styles.product, { color: t.text }]} numberOfLines={1}>
                    {firstProduct}
                    {extraCount > 0 ? `  +${extraCount}` : ""}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: sm.bg }]}>
                    <Ionicons name={sm.icon} size={11} color={sm.color} />
                    <Text style={[styles.badgeText, { color: sm.color }]}>{sm.label}</Text>
                  </View>
                </View>
                <View style={styles.cardBottom}>
                  <Text style={[styles.marketplace, { color: t.orange }]}>TRENDYOL</Text>
                  <View style={styles.cardBottomRight}>
                    {o.total_price != null && (
                      <Text style={[styles.price, { color: t.text }]}>{fmtCurrency(o.total_price)}</Text>
                    )}
                    <Text style={[styles.date, { color: t.textMuted }]}>{fmt(o.ordered_at)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="bag-outline" size={48} color={t.textMuted} />
              <Text style={[styles.emptyText, { color: t.textMuted }]}>Sipariş bulunamadı</Text>
              {filter !== "all" && (
                <Text style={[styles.emptyHint, { color: t.textMuted }]}>Filtreyi değiştir</Text>
              )}
            </View>
          }
        />
      )}

      {/* Detail Modal */}
      <Modal
        visible={!!selected}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelected(null)}
      >
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: t.card }]} edges={["top"]}>
          <View style={[styles.modalHeader, { borderBottomColor: t.border }]}>
            <TouchableOpacity
              onPress={() => setSelected(null)}
              style={[styles.modalClose, { backgroundColor: t.input }]}
            >
              <Ionicons name="close" size={22} color={t.textSub} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: t.text }]}>Sipariş Detayı</Text>
            <View style={{ width: 36 }} />
          </View>

          {selected && (() => {
            const sm = statusMeta(selected.status);
            const lines = selected.line_items ?? [];
            return (
              <ScrollView contentContainerStyle={styles.modalBody}>
                {/* Durum badge */}
                <View style={[styles.modalStatusBadge, { backgroundColor: sm.bg }]}>
                  <Ionicons name={sm.icon} size={16} color={sm.color} />
                  <Text style={[styles.modalStatusText, { color: sm.color }]}>{sm.label}</Text>
                </View>

                {/* Sipariş no */}
                <Text style={[styles.modalOrderId, { color: t.textMuted }]}>
                  Sipariş #{selected.marketplace_order_id}
                </Text>

                {/* Tarih + fiyat */}
                <View style={[styles.infoBox, { backgroundColor: t.bg }]}>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: t.textMuted }]}>Tarih</Text>
                    <Text style={[styles.infoValue, { color: t.text }]}>
                      {new Date(selected.ordered_at).toLocaleDateString("tr-TR", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </Text>
                  </View>
                  {selected.total_price != null && (
                    <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: t.border }]}>
                      <Text style={[styles.infoLabel, { color: t.textMuted }]}>Toplam</Text>
                      <Text style={[styles.infoValueBold, { color: t.text }]}>
                        {fmtCurrency(selected.total_price)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Ürün satırları */}
                {lines.length > 0 && (
                  <>
                    <Text style={[styles.sectionLabel, { color: t.textSub }]}>Ürünler</Text>
                    <View style={[styles.infoBox, { backgroundColor: t.bg }]}>
                      {lines.map((ln, i) => (
                        <View
                          key={i}
                          style={[
                            styles.lineRow,
                            i > 0 && { borderTopWidth: 1, borderTopColor: t.border },
                          ]}
                        >
                          <View style={styles.lineLeft}>
                            <Text style={[styles.lineName, { color: t.text }]} numberOfLines={2}>
                              {ln.product_name || ln.barcode || "—"}
                            </Text>
                            {ln.barcode ? (
                              <Text style={[styles.lineBarcode, { color: t.textMuted }]}>{ln.barcode}</Text>
                            ) : null}
                          </View>
                          <View style={styles.lineRight}>
                            <Text style={[styles.lineQty, { color: t.textSub }]}>{ln.quantity}×</Text>
                            <Text style={[styles.linePrice, { color: t.text }]}>
                              {fmtCurrency(ln.price)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </ScrollView>
            );
          })()}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1,
  },
  title: { fontSize: 22, fontWeight: "800" },
  subtitle: { fontSize: 12, marginTop: 2 },
  countBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  countText: { fontSize: 13, fontWeight: "600" },

  statsRow: {
    flexDirection: "row", paddingVertical: 12, paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 15, fontWeight: "800" },
  statLabel: { fontSize: 10, marginTop: 2 },
  statDivider: { width: 1, marginVertical: 4 },

  filtersWrap: { borderBottomWidth: 1 },
  filtersList: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  filterText: { fontSize: 13, fontWeight: "500" },
  filterTextActive: { color: "#fff", fontWeight: "700" },

  list: { padding: 16, gap: 12, paddingBottom: 32 },

  card: { borderRadius: 14, padding: 16, borderWidth: 1 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  product: { flex: 1, fontSize: 14, fontWeight: "700", marginRight: 8 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardBottomRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  marketplace: { fontSize: 11, fontWeight: "700" },
  price: { fontSize: 14, fontWeight: "700" },
  date: { fontSize: 11 },

  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15 },
  emptyHint: { fontSize: 13 },

  // Modal
  modalSafe: { flex: 1 },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1,
  },
  modalClose: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  modalBody: { padding: 20, gap: 16 },

  modalStatusBadge: {
    flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start",
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  modalStatusText: { fontSize: 13, fontWeight: "700" },
  modalOrderId: { fontSize: 13 },

  infoBox: { borderRadius: 14, overflow: "hidden" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14 },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: "500" },
  infoValueBold: { fontSize: 15, fontWeight: "800" },

  sectionLabel: { fontSize: 13, fontWeight: "700", marginTop: 4 },
  lineRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14 },
  lineLeft: { flex: 1, marginRight: 12 },
  lineName: { fontSize: 13, fontWeight: "600" },
  lineBarcode: { fontSize: 11, marginTop: 2 },
  lineRight: { alignItems: "flex-end" },
  lineQty: { fontSize: 11 },
  linePrice: { fontSize: 14, fontWeight: "700" },
});
