import { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, Modal, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/theme";

interface Response {
  id: string;
  rating: number;
  comment: string | null;
  email: string | null;
  phone: string | null;
  is_newsletter: boolean;
  product_name: string | null;
  created_at: string;
}

interface CustomerProfile {
  email: string;
  responseCount: number;
  avgRating: number;
  lastSeen: string;
  products: string[];
  isNewsletter: boolean;
  phone: string | null;
  responses: Response[];
}

function StarRow({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={size}
          color={rating >= 4 ? "#f97316" : rating >= 3 ? "#eab308" : "#ef4444"}
        />
      ))}
    </View>
  );
}

export default function MusteriScreen() {
  const t = useTheme();
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<CustomerProfile | null>(null);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("customer_responses")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    const rows: Response[] = data ?? [];

    const map = new Map<string, CustomerProfile>();
    for (const r of rows) {
      const key = r.email ?? r.id;
      if (!map.has(key)) {
        map.set(key, {
          email: r.email ?? "Anonim",
          responseCount: 0,
          avgRating: 0,
          lastSeen: r.created_at,
          products: [],
          isNewsletter: false,
          phone: r.phone,
          responses: [],
        });
      }
      const c = map.get(key)!;
      c.responseCount += 1;
      c.avgRating = (c.avgRating * (c.responseCount - 1) + r.rating) / c.responseCount;
      if (r.product_name && !c.products.includes(r.product_name)) c.products.push(r.product_name);
      if (r.is_newsletter) c.isNewsletter = true;
      if (r.created_at > c.lastSeen) c.lastSeen = r.created_at;
      c.responses.push(r);
    }

    setCustomers(Array.from(map.values()).sort((a, b) => b.lastSeen.localeCompare(a.lastSeen)));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const newsletterCount = customers.filter((c) => c.isNewsletter).length;
  const avgRatingAll = customers.length
    ? (customers.reduce((s, c) => s + c.avgRating, 0) / customers.length).toFixed(1)
    : "—";

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={["top"]}>
        <View style={[styles.header, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={t.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: t.text }]}>Müşteri Listesi</Text>
          <View style={[styles.proBadge, { backgroundColor: t.orange }]}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        </View>
        <View style={{ padding: 16, gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.skeleton, { backgroundColor: t.input }]} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.text }]}>Müşteri Listesi</Text>
        <View style={[styles.proBadge, { backgroundColor: t.orange }]}>
          <Text style={styles.proBadgeText}>PRO</Text>
        </View>
      </View>

      {customers.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyCard, { backgroundColor: t.card, borderColor: t.borderStrong }]}>
            <View style={[styles.emptyIconWrap, { backgroundColor: "#eff6ff" }]}>
              <Ionicons name="people-outline" size={32} color="#3b82f6" />
            </View>
            <Text style={[styles.emptyTitle, { color: t.text }]}>Henüz müşteri verisi yok</Text>
            <Text style={[styles.emptySub, { color: t.textSub }]}>
              QR form linkinizi müşterilerinizle paylaşın. Geri bildirim verdikçe müşteri profillleri burada oluşur.
            </Text>
            <View style={[styles.emptyNote, { backgroundColor: t.input }]}>
              <Ionicons name="information-circle-outline" size={14} color={t.textMuted} />
              <Text style={[styles.emptyNoteText, { color: t.textMuted }]}>Bu özellik Pro planında aktif.</Text>
            </View>
          </View>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(c) => c.email}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.orange} />}
          ListHeaderComponent={
            <View style={styles.summaryRow}>
              <SummaryPill icon="people" value={String(customers.length)} label="müşteri" color="#3b82f6" bg="#eff6ff" t={t} />
              <SummaryPill icon="star" value={avgRatingAll} label="ort. puan" color="#f97316" bg="#fff7ed" t={t} />
              <SummaryPill icon="mail" value={String(newsletterCount)} label="abone" color="#8b5cf6" bg="#f5f3ff" t={t} />
            </View>
          }
          renderItem={({ item: c }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: t.card, borderColor: t.borderStrong }]}
              onPress={() => { Haptics.selectionAsync(); setSelected(c); }}
              activeOpacity={0.75}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.avatar, { backgroundColor: t.input }]}>
                  <Text style={[styles.avatarText, { color: t.textSub }]}>
                    {c.email.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.email, { color: t.text }]} numberOfLines={1}>{c.email}</Text>
                  <View style={styles.metaRow}>
                    <StarRow rating={Math.round(c.avgRating)} />
                    <Text style={[styles.meta, { color: t.textMuted }]}>
                      {c.responseCount} yanıt · {c.products.length > 0 ? c.products[0] : ""}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardRight}>
                {c.isNewsletter && (
                  <View style={[styles.newsletterBadge, { backgroundColor: "#f0fdf4" }]}>
                    <Ionicons name="checkmark-circle" size={12} color="#22c55e" />
                    <Text style={styles.newsletterText}>Abone</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={14} color={t.textMuted} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Detail Modal */}
      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelected(null)}>
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: t.card }]} edges={["top"]}>
          <View style={[styles.modalHeader, { borderBottomColor: t.border }]}>
            <TouchableOpacity onPress={() => setSelected(null)} style={[styles.modalClose, { backgroundColor: t.input }]}>
              <Ionicons name="close" size={22} color={t.textSub} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: t.text }]}>Müşteri Detayı</Text>
            <View style={{ width: 36 }} />
          </View>

          {selected && (
            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={[styles.modalAvatarWrap, { backgroundColor: t.input }]}>
                <Text style={[styles.modalAvatarText, { color: t.textSub }]}>
                  {selected.email.slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.modalEmail, { color: t.text }]}>{selected.email}</Text>
              {selected.phone && (
                <Text style={[styles.modalPhone, { color: t.textMuted }]}>{selected.phone}</Text>
              )}

              <View style={styles.modalStats}>
                <View style={[styles.modalStat, { backgroundColor: t.bg }]}>
                  <Text style={[styles.modalStatValue, { color: t.text }]}>{selected.responseCount}</Text>
                  <Text style={[styles.modalStatLabel, { color: t.textMuted }]}>Yanıt</Text>
                </View>
                <View style={[styles.modalStat, { backgroundColor: t.bg }]}>
                  <Text style={[styles.modalStatValue, { color: t.orange }]}>{selected.avgRating.toFixed(1)}</Text>
                  <Text style={[styles.modalStatLabel, { color: t.textMuted }]}>Ort. Puan</Text>
                </View>
                <View style={[styles.modalStat, { backgroundColor: t.bg }]}>
                  <Text style={[styles.modalStatValue, { color: selected.isNewsletter ? "#22c55e" : t.textMuted }]}>
                    {selected.isNewsletter ? "Evet" : "Hayır"}
                  </Text>
                  <Text style={[styles.modalStatLabel, { color: t.textMuted }]}>Abone</Text>
                </View>
              </View>

              <Text style={[styles.sectionLabel, { color: t.textMuted }]}>YANIT GEÇMİŞİ</Text>
              {selected.responses.map((r) => (
                <View key={r.id} style={[styles.responseCard, { backgroundColor: t.bg, borderColor: t.border }]}>
                  <View style={styles.responseTop}>
                    <StarRow rating={r.rating} size={12} />
                    <Text style={[styles.responseDate, { color: t.textMuted }]}>
                      {new Date(r.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                    </Text>
                  </View>
                  {r.product_ref && (
                    <Text style={[styles.responseProduct, { color: t.textSub }]} numberOfLines={1}>{r.product_ref}</Text>
                  )}
                  {r.comment && (
                    <Text style={[styles.responseComment, { color: t.textSub }]}>{r.comment}</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function SummaryPill({ icon, value, label, color, bg, t }: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: string; label: string; color: string; bg: string;
  t: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[styles.summaryPill, { backgroundColor: t.card, borderColor: t.borderStrong }]}>
      <View style={[styles.summaryIconWrap, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={14} color={color} />
      </View>
      <Text style={[styles.summaryValue, { color: t.text }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: t.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  proBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  proBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  skeleton: { height: 72, borderRadius: 14 },
  emptyWrap: { flex: 1, justifyContent: "center", padding: 24 },
  emptyCard: { borderRadius: 20, padding: 28, alignItems: "center", gap: 12, borderWidth: 1 },
  emptyIconWrap: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  emptyNote: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 4 },
  emptyNoteText: { fontSize: 12 },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  summaryPill: { flex: 1, borderRadius: 12, padding: 10, borderWidth: 1, alignItems: "center", gap: 4 },
  summaryIconWrap: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  summaryValue: { fontSize: 16, fontWeight: "800" },
  summaryLabel: { fontSize: 10, fontWeight: "600" },
  card: { borderRadius: 14, padding: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontWeight: "700" },
  email: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  meta: { fontSize: 11 },
  cardRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  newsletterBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  newsletterText: { fontSize: 11, fontWeight: "600", color: "#22c55e" },
  // Modal
  modalSafe: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  modalClose: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  modalBody: { padding: 20, paddingBottom: 48 },
  modalAvatarWrap: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 12 },
  modalAvatarText: { fontSize: 26, fontWeight: "700" },
  modalEmail: { fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 4 },
  modalPhone: { fontSize: 13, textAlign: "center", marginBottom: 20 },
  modalStats: { flexDirection: "row", gap: 10, marginBottom: 24 },
  modalStat: { flex: 1, borderRadius: 14, padding: 14, alignItems: "center" },
  modalStatValue: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  modalStatLabel: { fontSize: 11, fontWeight: "600" },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 10 },
  responseCard: { borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 8 },
  responseTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  responseDate: { fontSize: 11 },
  responseProduct: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  responseComment: { fontSize: 13, lineHeight: 18 },
});
