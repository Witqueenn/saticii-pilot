import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";
import { SkeletonCard } from "@/lib/Skeleton";
import { useTheme } from "@/lib/theme";

interface Return {
  id: string;
  marketplace: string;
  product_id: string;
  product_name: string;
  reason: string;
  customer_comment?: string;
  returned_at: string;
  created_at: string;
}

const REASON_LABEL: Record<string, string> = {
  beden_uyumsuzlugu: "Beden Uyumsuzluğu",
  renk_farki: "Renk Farkı",
  kalite_sorunu: "Kalite Sorunu",
  yanlis_urun: "Yanlış Ürün",
  hasarli: "Hasarlı",
  diger: "Diğer",
};

const REASON_COLOR: Record<string, { color: string; bg: string; icon: React.ComponentProps<typeof Ionicons>["name"] }> = {
  beden_uyumsuzlugu: { color: "#7c3aed", bg: "#ede9fe", icon: "resize-outline" },
  renk_farki:        { color: "#0891b2", bg: "#cffafe", icon: "color-palette-outline" },
  kalite_sorunu:     { color: "#dc2626", bg: "#fee2e2", icon: "warning-outline" },
  yanlis_urun:       { color: "#d97706", bg: "#fef3c7", icon: "swap-horizontal-outline" },
  hasarli:           { color: "#be123c", bg: "#ffe4e6", icon: "bandage-outline" },
  diger:             { color: "#6b7280", bg: "#f3f4f6", icon: "help-circle-outline" },
};

const FILTER_OPTS = [
  { label: "Tümü", value: "all" },
  { label: "Beden", value: "beden_uyumsuzlugu" },
  { label: "Renk", value: "renk_farki" },
  { label: "Kalite", value: "kalite_sorunu" },
  { label: "Diğer", value: "diger" },
];

export default function IadelerScreen() {
  const t = useTheme();
  const [returns, setReturns] = useState<Return[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Return | null>(null);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("returns")
      .select("id, marketplace, product_id, product_name, reason, customer_comment, returned_at, created_at")
      .eq("seller_id", user.id)
      .order("returned_at", { ascending: false });
    setReturns(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? returns : returns.filter((r) => r.reason === filter);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function openReturn(r: Return) {
    Haptics.selectionAsync();
    setSelected(r);
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={["top"]}>
        <View style={[styles.header, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
          <Text style={[styles.title, { color: t.text }]}>İadeler</Text>
        </View>
        <View style={{ padding: 16 }}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
        <View>
          <Text style={[styles.title, { color: t.text }]}>İadeler</Text>
          <Text style={[styles.subtitle, { color: t.textSub }]}>{returns.length} toplam iade</Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: t.input }]}>
          <Text style={[styles.countText, { color: t.textSub }]}>{filtered.length}</Text>
        </View>
      </View>

      <View style={[styles.filtersWrap, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_OPTS}
          keyExtractor={(f) => f.value}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[styles.filterBtn, { backgroundColor: t.input }, filter === f.value && { backgroundColor: t.orange }]}
              onPress={() => { Haptics.selectionAsync(); setFilter(f.value); }}
            >
              <Text style={[styles.filterText, { color: t.textSub }, filter === f.value && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.orange} />}
        renderItem={({ item: r }) => {
          const rc = REASON_COLOR[r.reason] ?? REASON_COLOR.diger;
          const label = REASON_LABEL[r.reason] ?? r.reason;
          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: t.card, borderColor: t.borderStrong, borderLeftColor: rc.color, borderLeftWidth: 3 }]}
              onPress={() => openReturn(r)}
              activeOpacity={0.75}
            >
              <View style={styles.cardTop}>
                <Text style={[styles.product, { color: t.text }]} numberOfLines={1}>{r.product_name}</Text>
                <View style={[styles.badge, { backgroundColor: rc.bg }]}>
                  <Ionicons name={rc.icon} size={11} color={rc.color} />
                  <Text style={[styles.badgeText, { color: rc.color }]}>{label}</Text>
                </View>
              </View>
              {r.customer_comment ? (
                <Text style={[styles.comment, { color: t.textSub }]} numberOfLines={2}>{r.customer_comment}</Text>
              ) : null}
              <View style={styles.cardBottom}>
                <Text style={[styles.marketplace, { color: t.orange }]}>{r.marketplace}</Text>
                <Text style={[styles.date, { color: t.textMuted }]}>
                  {new Date(r.returned_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={48} color={t.textMuted} />
            <Text style={[styles.emptyText, { color: t.textMuted }]}>İade talebi bulunamadı</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelected(null)}>
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: t.card }]} edges={["top"]}>
          <View style={[styles.modalHeader, { borderBottomColor: t.border }]}>
            <TouchableOpacity onPress={() => setSelected(null)} style={[styles.modalClose, { backgroundColor: t.input }]}>
              <Ionicons name="close" size={22} color={t.textSub} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: t.text }]}>İade Detayı</Text>
            <View style={{ width: 36 }} />
          </View>

          {selected && (() => {
            const rc = REASON_COLOR[selected.reason] ?? REASON_COLOR.diger;
            const label = REASON_LABEL[selected.reason] ?? selected.reason;
            return (
              <View style={styles.modalBody}>
                <View style={[styles.modalReasonBadge, { backgroundColor: rc.bg }]}>
                  <Ionicons name={rc.icon} size={16} color={rc.color} />
                  <Text style={[styles.modalReasonBadgeText, { color: rc.color }]}>{label}</Text>
                </View>

                <Text style={[styles.modalProduct, { color: t.text }]}>{selected.product_name}</Text>
                <Text style={[styles.modalMeta, { color: t.textMuted }]}>
                  {selected.marketplace.toUpperCase()} · {new Date(selected.returned_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                </Text>

                {selected.customer_comment ? (
                  <>
                    <Text style={[styles.modalLabel, { color: t.textSub }]}>Müşteri Yorumu</Text>
                    <View style={[styles.modalCommentBox, { backgroundColor: t.bg }]}>
                      <Text style={[styles.modalComment, { color: t.textSub }]}>{selected.customer_comment}</Text>
                    </View>
                  </>
                ) : (
                  <View style={[styles.modalCommentBox, { backgroundColor: t.bg }]}>
                    <Text style={[styles.modalComment, { color: t.textMuted }]}>Müşteri yorumu eklenmemiş.</Text>
                  </View>
                )}

                <View style={[styles.infoRow, { borderColor: t.border }]}>
                  <Text style={[styles.infoLabel, { color: t.textMuted }]}>Ürün ID</Text>
                  <Text style={[styles.infoValue, { color: t.textSub }]}>{selected.product_id}</Text>
                </View>
              </View>
            );
          })()}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 22, fontWeight: "800" },
  subtitle: { fontSize: 12, marginTop: 2 },
  countBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  countText: { fontSize: 13, fontWeight: "600" },
  filtersWrap: { borderBottomWidth: 1 },
  filtersList: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  filterText: { fontSize: 13, fontWeight: "500" },
  filterTextActive: { color: "#fff", fontWeight: "700" },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  card: { borderRadius: 14, padding: 16, borderWidth: 1 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  product: { flex: 1, fontSize: 14, fontWeight: "700", marginRight: 8 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  comment: { fontSize: 13, marginBottom: 8, lineHeight: 18 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  marketplace: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  date: { fontSize: 11 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15 },
  // Modal
  modalSafe: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalClose: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  modalBody: { padding: 20 },
  modalReasonBadge: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
  modalReasonBadgeText: { fontSize: 13, fontWeight: "700" },
  modalProduct: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  modalMeta: { fontSize: 13, marginBottom: 20 },
  modalLabel: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  modalCommentBox: { borderRadius: 14, padding: 16, marginBottom: 20 },
  modalComment: { fontSize: 15, lineHeight: 22 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderTopWidth: 1 },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: "600" },
});
