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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";
import { SkeletonCard } from "@/lib/Skeleton";
import { useBadges } from "@/lib/BadgeContext";
import { useTheme } from "@/lib/theme";

interface Return {
  id: string;
  product_name: string;
  reason: string;
  status: string;
  created_at: string;
}

const STATUS_OPTS = [
  { label: "Tümü", value: "all" },
  { label: "Bekliyor", value: "beklemede" },
  { label: "Onaylandı", value: "onaylandi" },
  { label: "Reddedildi", value: "reddedildi" },
];

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; icon: React.ComponentProps<typeof Ionicons>["name"] }> = {
  beklemede: { label: "Bekliyor", color: "#d97706", bg: "#fef3c7", icon: "time-outline" },
  onaylandi: { label: "Onaylandı", color: "#059669", bg: "#d1fae5", icon: "checkmark-circle-outline" },
  reddedildi: { label: "Reddedildi", color: "#dc2626", bg: "#fee2e2", icon: "close-circle-outline" },
};

export default function IadelerScreen() {
  const t = useTheme();
  const [returns, setReturns] = useState<Return[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Return | null>(null);
  const [updating, setUpdating] = useState(false);
  const { refresh: refreshBadges } = useBadges();

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("returns")
      .select("id, product_name, reason, status, created_at")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });
    setReturns(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? returns : returns.filter((r) => r.status === filter);
  const pending = returns.filter((r) => r.status === "beklemede").length;

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function openReturn(r: Return) {
    Haptics.selectionAsync();
    setSelected(r);
  }

  async function updateStatus(newStatus: "onaylandi" | "reddedildi") {
    if (!selected) return;
    Haptics.notificationAsync(
      newStatus === "onaylandi"
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );
    setUpdating(true);
    await supabase.from("returns").update({ status: newStatus }).eq("id", selected.id);
    setReturns((prev) =>
      prev.map((r) => r.id === selected.id ? { ...r, status: newStatus } : r)
    );
    setSelected(null);
    setUpdating(false);
    refreshBadges();
    Alert.alert(newStatus === "onaylandi" ? "İade onaylandı ✓" : "İade reddedildi");
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
          {pending > 0 && <Text style={styles.pendingText}>{pending} bekleyen</Text>}
        </View>
        <View style={[styles.countBadge, { backgroundColor: t.input }]}>
          <Text style={[styles.countText, { color: t.textSub }]}>{filtered.length}</Text>
        </View>
      </View>

      <View style={[styles.filters, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
        {STATUS_OPTS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterBtn, { backgroundColor: t.input }, filter === f.value && { backgroundColor: t.orange }]}
            onPress={() => { Haptics.selectionAsync(); setFilter(f.value); }}
          >
            <Text style={[styles.filterText, { color: t.textSub }, filter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.orange} />}
        renderItem={({ item: r }) => {
          const s = STATUS_STYLE[r.status];
          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: t.card, borderLeftColor: s?.color ?? t.border, borderLeftWidth: 3 }]}
              onPress={() => openReturn(r)}
              activeOpacity={0.75}
            >
              <View style={styles.cardTop}>
                <Text style={[styles.product, { color: t.text }]} numberOfLines={1}>{r.product_name}</Text>
                {s && (
                  <View style={[styles.badge, { backgroundColor: s.bg }]}>
                    <Ionicons name={s.icon} size={11} color={s.color} />
                    <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.reason, { color: t.textSub }]} numberOfLines={2}>{r.reason}</Text>
              <View style={styles.cardBottom}>
                <Text style={[styles.date, { color: t.textMuted }]}>
                  {new Date(r.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
                </Text>
                {r.status === "beklemede" && (
                  <View style={styles.tapHint}>
                    <Text style={[styles.tapHintText, { color: t.textMuted }]}>İşlem yap</Text>
                    <Ionicons name="chevron-forward" size={12} color={t.textMuted} />
                  </View>
                )}
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
            <Text style={[styles.modalTitle, { color: t.text }]}>İade Talebi</Text>
            <View style={{ width: 36 }} />
          </View>

          {selected && (
            <View style={styles.modalBody}>
              {/* Status badge */}
              {STATUS_STYLE[selected.status] && (
                <View style={[styles.modalStatusBadge, { backgroundColor: STATUS_STYLE[selected.status].bg }]}>
                  <Ionicons name={STATUS_STYLE[selected.status].icon} size={16} color={STATUS_STYLE[selected.status].color} />
                  <Text style={[styles.modalStatusText, { color: STATUS_STYLE[selected.status].color }]}>
                    {STATUS_STYLE[selected.status].label}
                  </Text>
                </View>
              )}

              <Text style={[styles.modalProduct, { color: t.text }]}>{selected.product_name}</Text>
              <Text style={[styles.modalDate, { color: t.textMuted }]}>
                {new Date(selected.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
              </Text>

              <Text style={[styles.modalReasonLabel, { color: t.textSub }]}>İade Nedeni</Text>
              <View style={[styles.modalReasonBox, { backgroundColor: t.bg }]}>
                <Text style={[styles.modalReason, { color: t.textSub }]}>{selected.reason}</Text>
              </View>

              {selected.status === "beklemede" && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn, { borderColor: "#fecaca" }]}
                    onPress={() => updateStatus("reddedildi")}
                    disabled={updating}
                  >
                    {updating ? <ActivityIndicator color="#dc2626" size="small" /> : (
                      <>
                        <Ionicons name="close-circle" size={18} color="#dc2626" />
                        <Text style={styles.rejectText}>Reddet</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => updateStatus("onaylandi")}
                    disabled={updating}
                  >
                    {updating ? <ActivityIndicator color="#fff" size="small" /> : (
                      <>
                        <Ionicons name="checkmark-circle" size={18} color="#fff" />
                        <Text style={styles.approveText}>Onayla</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 22, fontWeight: "800" },
  pendingText: { fontSize: 12, color: "#d97706", fontWeight: "600", marginTop: 2 },
  countBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  countText: { fontSize: 13, fontWeight: "600" },
  filters: { flexDirection: "row", gap: 8, padding: 16, borderBottomWidth: 1 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  filterText: { fontSize: 13, fontWeight: "500" },
  filterTextActive: { color: "#fff", fontWeight: "700" },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  card: { borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  product: { flex: 1, fontSize: 14, fontWeight: "700", marginRight: 8 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  reason: { fontSize: 13, marginBottom: 8, lineHeight: 18 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  date: { fontSize: 11 },
  tapHint: { flexDirection: "row", alignItems: "center", gap: 2 },
  tapHintText: { fontSize: 12 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15 },
  // Modal
  modalSafe: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalClose: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  modalBody: { padding: 20 },
  modalStatusBadge: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
  modalStatusText: { fontSize: 13, fontWeight: "700" },
  modalProduct: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  modalDate: { fontSize: 13, marginBottom: 20 },
  modalReasonLabel: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  modalReasonBox: { borderRadius: 14, padding: 16, marginBottom: 28 },
  modalReason: { fontSize: 15, lineHeight: 22 },
  actionRow: { flexDirection: "row", gap: 12 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 14 },
  rejectBtn: { backgroundColor: "transparent", borderWidth: 1.5 },
  rejectText: { color: "#dc2626", fontSize: 15, fontWeight: "700" },
  approveBtn: { backgroundColor: "#059669" },
  approveText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
