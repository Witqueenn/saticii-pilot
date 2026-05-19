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
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/theme";

interface Campaign {
  id: string;
  title: string;
  platform: string | null;
  discount_pct: number | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

interface Automation {
  id: string;
  trigger: string;
  action: string;
  is_active: boolean;
  created_at: string;
}

const CAMPAIGN_STATUS: Record<string, { label: string; color: string; bg: string; icon: React.ComponentProps<typeof Ionicons>["name"] }> = {
  aktif: { label: "Aktif", color: "#059669", bg: "#d1fae5", icon: "checkmark-circle-outline" },
  beklemede: { label: "Beklemede", color: "#d97706", bg: "#fef3c7", icon: "time-outline" },
  bitti: { label: "Bitti", color: "#6b7280", bg: "#f3f4f6", icon: "stop-circle-outline" },
  taslak: { label: "Taslak", color: "#6366f1", bg: "#eef2ff", icon: "create-outline" },
};

const PLATFORM_LABEL: Record<string, string> = {
  trendyol: "Trendyol",
  hepsiburada: "Hepsiburada",
  n11: "N11",
  amazon: "Amazon",
};

const AUTOMATION_TRIGGER_LABEL: Record<string, string> = {
  yeni_yorum: "Yeni yorum",
  dusuk_puan: "Düşük puan",
  iade_talebi: "İade talebi",
  siparis: "Yeni sipariş",
};

const AUTOMATION_ACTION_LABEL: Record<string, string> = {
  mesaj_gonder: "Mesaj gönder",
  indirim_kodu: "İndirim kodu gönder",
  bildirim: "Bildirim gönder",
};

function fmt(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export default function KampanyaScreen() {
  const t = useTheme();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [tab, setTab] = useState<"kampanya" | "otomasyon">("kampanya");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [campRes, autoRes] = await Promise.all([
      supabase
        .from("campaigns")
        .select("id, title, platform, discount_pct, start_date, end_date, status, notes, created_at")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("automations")
        .select("id, trigger, action, is_active, created_at")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    setCampaigns(campRes.data ?? []);
    setAutomations(autoRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const activeCampaigns = campaigns.filter((c) => c.status === "aktif").length;
  const activeAutomations = automations.filter((a) => a.is_active).length;

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={["top"]}>
        <View style={[styles.header, { borderBottomColor: t.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: t.input }]}>
            <Ionicons name="arrow-back" size={20} color={t.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: t.text }]}>Pazarlama</Text>
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={t.orange} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: t.input }]}>
          <Ionicons name="arrow-back" size={20} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.text }]}>Pazarlama</Text>
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>PRO</Text>
        </View>
      </View>

      {/* Summary pills */}
      {(campaigns.length > 0 || automations.length > 0) && (
        <View style={[styles.summaryBar, { backgroundColor: t.card, borderBottomColor: t.border }]}>
          <View style={styles.summaryPill}>
            <Text style={[styles.summaryNum, { color: "#059669" }]}>{activeCampaigns}</Text>
            <Text style={[styles.summaryLabel, { color: t.textMuted }]}>Aktif kampanya</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: t.border }]} />
          <View style={styles.summaryPill}>
            <Text style={[styles.summaryNum, { color: t.orange }]}>{campaigns.length}</Text>
            <Text style={[styles.summaryLabel, { color: t.textMuted }]}>Toplam kampanya</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: t.border }]} />
          <View style={styles.summaryPill}>
            <Text style={[styles.summaryNum, { color: "#6366f1" }]}>{activeAutomations}</Text>
            <Text style={[styles.summaryLabel, { color: t.textMuted }]}>Otomasyon aktif</Text>
          </View>
        </View>
      )}

      {/* Tab switcher */}
      <View style={[styles.tabRow, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "kampanya" && { borderBottomWidth: 2, borderBottomColor: t.orange }]}
          onPress={() => { Haptics.selectionAsync(); setTab("kampanya"); }}
        >
          <Text style={[styles.tabText, { color: tab === "kampanya" ? t.orange : t.textMuted }]}>
            Kampanyalar
            {campaigns.length > 0 && <Text style={[styles.tabCount, { color: tab === "kampanya" ? t.orange : t.textMuted }]}> {campaigns.length}</Text>}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "otomasyon" && { borderBottomWidth: 2, borderBottomColor: t.orange }]}
          onPress={() => { Haptics.selectionAsync(); setTab("otomasyon"); }}
        >
          <Text style={[styles.tabText, { color: tab === "otomasyon" ? t.orange : t.textMuted }]}>
            Otomasyonlar
            {automations.length > 0 && <Text style={[styles.tabCount, { color: tab === "otomasyon" ? t.orange : t.textMuted }]}> {automations.length}</Text>}
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "kampanya" ? (
        <FlatList
          data={campaigns}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.orange} />}
          renderItem={({ item: c }) => {
            const s = CAMPAIGN_STATUS[c.status] ?? CAMPAIGN_STATUS.taslak;
            return (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: t.card, borderColor: t.borderStrong, borderLeftColor: s.color, borderLeftWidth: 3 }]}
                onPress={() => { Haptics.selectionAsync(); setSelected(c); }}
                activeOpacity={0.75}
              >
                <View style={styles.cardTop}>
                  <Text style={[styles.cardName, { color: t.text }]} numberOfLines={1}>{c.title}</Text>
                  <View style={[styles.badge, { backgroundColor: s.bg }]}>
                    <Ionicons name={s.icon} size={11} color={s.color} />
                    <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
                  </View>
                </View>
                <View style={styles.cardMeta}>
                  {c.platform && (
                    <View style={[styles.typePill, { backgroundColor: t.input }]}>
                      <Text style={[styles.typeText, { color: t.textSub }]}>{PLATFORM_LABEL[c.platform] ?? c.platform}</Text>
                    </View>
                  )}
                  {c.discount_pct != null && (
                    <View style={[styles.discountPill, { backgroundColor: "#fef3c7" }]}>
                      <Ionicons name="pricetag-outline" size={11} color="#d97706" />
                      <Text style={[styles.discountText]}>%{c.discount_pct} indirim</Text>
                    </View>
                  )}
                </View>
                <View style={styles.cardBottom}>
                  <Text style={[styles.dateText, { color: t.textMuted }]}>
                    {fmt(c.start_date)} → {fmt(c.end_date)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<EmptyState type="kampanya" t={t} />}
        />
      ) : (
        <FlatList
          data={automations}
          keyExtractor={(a) => a.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.orange} />}
          renderItem={({ item: a }) => (
            <View style={[styles.card, { backgroundColor: t.card, borderColor: t.borderStrong, borderLeftWidth: 3, borderLeftColor: a.is_active ? "#059669" : t.borderStrong }]}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.autoTrigger, { color: t.textMuted }]}>Tetikleyici</Text>
                  <Text style={[styles.autoValue, { color: t.text }]}>{AUTOMATION_TRIGGER_LABEL[a.trigger] ?? a.trigger}</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={t.textMuted} style={{ marginHorizontal: 12, marginTop: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.autoTrigger, { color: t.textMuted }]}>Aksiyon</Text>
                  <Text style={[styles.autoValue, { color: t.text }]}>{AUTOMATION_ACTION_LABEL[a.action] ?? a.action}</Text>
                </View>
                <View style={[styles.toggleDot, { backgroundColor: a.is_active ? "#059669" : t.border }]} />
              </View>
              <Text style={[styles.dateText, { color: t.textMuted, marginTop: 8 }]}>
                {fmt(a.created_at)} tarihinde oluşturuldu
              </Text>
            </View>
          )}
          ListEmptyComponent={<EmptyState type="otomasyon" t={t} />}
        />
      )}

      {/* Campaign detail modal */}
      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelected(null)}>
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: t.card }]} edges={["top"]}>
          <View style={[styles.modalHeader, { borderBottomColor: t.border }]}>
            <TouchableOpacity onPress={() => setSelected(null)} style={[styles.modalClose, { backgroundColor: t.input }]}>
              <Ionicons name="close" size={22} color={t.textSub} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: t.text }]}>Kampanya Detayı</Text>
            <View style={{ width: 36 }} />
          </View>

          {selected && (() => {
            const s = CAMPAIGN_STATUS[selected.status] ?? CAMPAIGN_STATUS.taslak;
            return (
              <View style={styles.modalBody}>
                <View style={[styles.modalStatusBadge, { backgroundColor: s.bg }]}>
                  <Ionicons name={s.icon} size={16} color={s.color} />
                  <Text style={[styles.modalStatusText, { color: s.color }]}>{s.label}</Text>
                </View>

                <Text style={[styles.modalCampName, { color: t.text }]}>{selected.title}</Text>
                {selected.notes && (
                  <Text style={[styles.modalType, { color: t.textMuted }]}>{selected.notes}</Text>
                )}

                <View style={[styles.detailGrid, { borderColor: t.border }]}>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: t.textMuted }]}>İndirim Oranı</Text>
                    <Text style={[styles.detailValue, { color: t.text }]}>
                      {selected.discount_pct != null ? `%${selected.discount_pct}` : "—"}
                    </Text>
                  </View>
                  <View style={[styles.detailDivider, { backgroundColor: t.border }]} />
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: t.textMuted }]}>Başlangıç</Text>
                    <Text style={[styles.detailValue, { color: t.text }]}>{fmt(selected.start_date)}</Text>
                  </View>
                  <View style={[styles.detailDivider, { backgroundColor: t.border }]} />
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: t.textMuted }]}>Bitiş</Text>
                    <Text style={[styles.detailValue, { color: t.text }]}>{fmt(selected.end_date)}</Text>
                  </View>
                </View>
              </View>
            );
          })()}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function EmptyState({ type, t }: { type: "kampanya" | "otomasyon"; t: ReturnType<typeof useTheme> }) {
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIconWrap, { backgroundColor: t.input }]}>
        <Ionicons name={type === "kampanya" ? "megaphone-outline" : "flash-outline"} size={32} color={t.textMuted} />
      </View>
      <Text style={[styles.emptyTitle, { color: t.text }]}>
        {type === "kampanya" ? "Kampanya bulunamadı" : "Otomasyon bulunamadı"}
      </Text>
      <Text style={[styles.emptySubtitle, { color: t.textMuted }]}>
        {type === "kampanya"
          ? "Web panelinden kampanya oluşturarak satışlarını artırabilirsin."
          : "Web panelinden otomasyon kurarak müşteri deneyimini iyileştirebilirsin."}
      </Text>
      <View style={[styles.proNote, { backgroundColor: t.orange + "15", borderColor: t.orange + "30" }]}>
        <Ionicons name="flash" size={12} color={t.orange} />
        <Text style={[styles.proNoteText, { color: t.orange }]}>Pro plan gerektirir</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  proBadge: { backgroundColor: "#f97316", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  proBadgeText: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  summaryBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingVertical: 14, borderBottomWidth: 1 },
  summaryPill: { alignItems: "center", gap: 2 },
  summaryNum: { fontSize: 22, fontWeight: "800" },
  summaryLabel: { fontSize: 11, fontWeight: "500" },
  summaryDivider: { width: 1, height: 32 },
  tabRow: { flexDirection: "row", borderBottomWidth: 1 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 14, fontWeight: "700" },
  tabCount: { fontSize: 14 },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  card: { borderRadius: 14, padding: 16, borderWidth: 1 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  cardName: { flex: 1, fontSize: 14, fontWeight: "700", marginRight: 8 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  cardMeta: { flexDirection: "row", gap: 8, marginBottom: 10 },
  typePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  typeText: { fontSize: 12, fontWeight: "600" },
  discountPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  discountText: { fontSize: 12, fontWeight: "600", color: "#d97706" },
  cardBottom: { flexDirection: "row", alignItems: "center" },
  dateText: { fontSize: 11 },
  autoTrigger: { fontSize: 11, fontWeight: "600", marginBottom: 2 },
  autoValue: { fontSize: 13, fontWeight: "700" },
  toggleDot: { width: 10, height: 10, borderRadius: 5, marginTop: 12, marginLeft: 8 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12, paddingHorizontal: 32 },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: "700", textAlign: "center" },
  emptySubtitle: { fontSize: 13, textAlign: "center", lineHeight: 18 },
  proNote: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, marginTop: 4 },
  proNoteText: { fontSize: 12, fontWeight: "700" },
  // Modal
  modalSafe: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalClose: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  modalBody: { padding: 20 },
  modalStatusBadge: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
  modalStatusText: { fontSize: 13, fontWeight: "700" },
  modalCampName: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  modalType: { fontSize: 14, marginBottom: 24 },
  detailGrid: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  detailItem: { padding: 16 },
  detailDivider: { height: 1 },
  detailLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  detailValue: { fontSize: 17, fontWeight: "700" },
});
