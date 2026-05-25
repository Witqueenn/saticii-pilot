import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";
import { SkeletonCard } from "@/lib/Skeleton";
import { useTheme } from "@/lib/theme";

interface Product {
  id: string;
  name: string;
  marketplace_product_id: string;
  category: string;
  description: string | null;
  stock: number;
  price: number;
  description_score: number;
  seo_score: number;
  return_rate: number;
  marketplace: string;
  improved_description: string | null;
  ai_suggestions: string[] | null;
}

function ScorePill({ score, label }: { score: number; label: string }) {
  const { bg, color } =
    score >= 70 ? { bg: "#d1fae5", color: "#059669" } :
    score >= 50 ? { bg: "#fef3c7", color: "#d97706" } :
    { bg: "#fee2e2", color: "#dc2626" };
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color }]}>{label} {score}</Text>
    </View>
  );
}

function StockBadge({ stock }: { stock: number }) {
  const t = useTheme();
  const { bg, color, label } =
    stock === 0 ? { bg: "#fee2e2", color: "#dc2626", label: "Stok yok" } :
    stock <= 5 ? { bg: "#fef3c7", color: "#d97706", label: `${stock} adet` } :
    { bg: t.input, color: t.textSub, label: `${stock} adet` };
  return (
    <View style={[styles.stockBadge, { backgroundColor: bg }]}>
      <Text style={[styles.stockText, { color }]}>{label}</Text>
    </View>
  );
}

export default function UrunlerScreen() {
  const t = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"description_score" | "stock" | "return_rate">("description_score");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showImproved, setShowImproved] = useState(false);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "";

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("products")
      .select("id, name, marketplace_product_id, category, description, stock, price, description_score, seo_score, return_rate, marketplace, improved_description, ai_suggestions")
      .eq("seller_id", user.id)
      .order("description_score", { ascending: true });
    setProducts(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let res = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter((p) => p.name?.toLowerCase().includes(q) || p.marketplace_product_id?.toLowerCase().includes(q));
    }
    res.sort((a, b) =>
      sortBy === "stock" ? a.stock - b.stock :
      sortBy === "return_rate" ? b.return_rate - a.return_rate :
      a.description_score - b.description_score
    );
    setFiltered(res);
  }, [products, search, sortBy]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function improveDescription(p: Product) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setGenerating(true);
    try {
      const res = await fetch(`${apiUrl}/api/ai/improve-product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          product_id: p.id,
          product_name: p.name,
          category: p.category ?? "",
          description: p.description ?? "",
        }),
      });
      const data = await res.json();
      if (data.improved) {
        const updated = { ...p, improved_description: data.improved, ai_suggestions: data.suggestions ?? p.ai_suggestions };
        setSelected(updated);
        setProducts((prev) => prev.map((item) => item.id === p.id ? updated : item));
        setShowImproved(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } finally {
      setGenerating(false);
    }
  }

  const SORTS = [
    { label: "Düşük Açıklama", value: "description_score" as const },
    { label: "Düşük Stok", value: "stock" as const },
    { label: "Yüksek İade", value: "return_rate" as const },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={["top"]}>
        <View style={[styles.header, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
          <Text style={[styles.title, { color: t.text }]}>Ürünler</Text>
        </View>
        <View style={{ padding: 16 }}>
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
        <Text style={[styles.title, { color: t.text }]}>Ürünler</Text>
        <View style={[styles.countBadge, { backgroundColor: t.input }]}>
          <Text style={[styles.countText, { color: t.textSub }]}>{filtered.length}</Text>
        </View>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
        <Ionicons name="search" size={16} color={t.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.search, { backgroundColor: t.input, color: t.text }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Ürün adı veya SKU ara..."
          placeholderTextColor={t.textMuted}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={t.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.sortRow, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
        <Text style={[styles.sortLabel, { color: t.textMuted }]}>Sırala:</Text>
        {SORTS.map((s) => (
          <TouchableOpacity
            key={s.value}
            style={[styles.sortBtn, { backgroundColor: t.input }, sortBy === s.value && { backgroundColor: t.text }]}
            onPress={() => { Haptics.selectionAsync(); setSortBy(s.value); }}
          >
            <Text style={[styles.sortText, { color: t.textSub }, sortBy === s.value && styles.sortTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.orange} />}
        renderItem={({ item: p }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: t.card }]}
            onPress={() => { Haptics.selectionAsync(); setSelected(p); }}
            activeOpacity={0.75}
          >
            <View style={styles.cardTop}>
              <View style={[styles.productIconWrap, { backgroundColor: t.input }]}>
                <Ionicons name="cube-outline" size={18} color={t.textSub} />
              </View>
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: t.text }]} numberOfLines={1}>{p.name}</Text>
                <Text style={[styles.productSku, { color: t.textMuted }]}>{p.marketplace_product_id} · {p.marketplace}</Text>
              </View>
              <StockBadge stock={p.stock} />
            </View>

            <View style={styles.pillRow}>
              <ScorePill score={p.description_score ?? 0} label="Açıklama" />
              <ScorePill score={p.seo_score ?? 0} label="SEO" />
              {p.return_rate > 0 && (
                <View style={[styles.pill, { backgroundColor: p.return_rate > 15 ? "#fee2e2" : t.input }]}>
                  <Text style={[styles.pillText, { color: p.return_rate > 15 ? "#dc2626" : t.textSub }]}>
                    İade %{p.return_rate}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={48} color={t.textMuted} />
            <Text style={[styles.emptyText, { color: t.textMuted }]}>Ürün bulunamadı</Text>
          </View>
        }
      />

      {/* Product Detail Modal */}
      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelected(null)}>
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: t.card }]} edges={["top"]}>
          <View style={[styles.modalHeader, { borderBottomColor: t.border }]}>
            <TouchableOpacity onPress={() => setSelected(null)} style={[styles.modalClose, { backgroundColor: t.input }]}>
              <Ionicons name="close" size={22} color={t.textSub} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: t.text }]}>Ürün Detayı</Text>
            <View style={{ width: 36 }} />
          </View>
          {selected && (
            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={[styles.modalIconWrap, { backgroundColor: t.pillBg }]}>
                <Ionicons name="cube" size={32} color={t.orange} />
              </View>
              <Text style={[styles.modalProductName, { color: t.text }]}>{selected.name}</Text>
              <Text style={[styles.modalSku, { color: t.textMuted }]}>{selected.marketplace_product_id} · {selected.marketplace}</Text>

              <View style={styles.modalGrid}>
                <StatBox label="Fiyat" value={`₺${selected.price?.toLocaleString("tr-TR") ?? "—"}`} valueColor={t.text} labelColor={t.textMuted} bgColor={t.bg} />
                <StatBox label="Stok" value={String(selected.stock ?? 0)} valueColor={selected.stock <= 5 ? "#d97706" : t.text} labelColor={t.textMuted} bgColor={t.bg} />
                <StatBox label="İade Oranı" value={`%${selected.return_rate ?? 0}`} valueColor={selected.return_rate > 15 ? "#dc2626" : "#059669"} labelColor={t.textMuted} bgColor={t.bg} />
              </View>

              <Text style={[styles.modalSectionTitle, { color: t.textSub }]}>Skor Analizi</Text>
              <ScoreBar label="Açıklama Skoru" score={selected.description_score ?? 0} labelColor={t.textSub} trackColor={t.input} />
              <ScoreBar label="SEO Skoru" score={selected.seo_score ?? 0} labelColor={t.textSub} trackColor={t.input} />

              {(selected.ai_suggestions ?? []).length > 0 && (
                <View style={[styles.aiTip, { backgroundColor: t.pillBg, borderColor: "#fed7aa" }]}>
                  <Ionicons name="bulb" size={18} color={t.orange} />
                  <View style={{ flex: 1 }}>
                    {(selected.ai_suggestions ?? []).map((s, i) => (
                      <Text key={i} style={[styles.aiTipText, { marginBottom: i < (selected.ai_suggestions?.length ?? 0) - 1 ? 4 : 0 }]}>
                        → {s}
                      </Text>
                    ))}
                  </View>
                </View>
              )}

              {/* AI Improved Description */}
              <TouchableOpacity
                style={[styles.improveBtn, { backgroundColor: t.orange }, generating && { opacity: 0.6 }]}
                onPress={() => improveDescription(selected)}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="sparkles" size={16} color="#fff" />
                )}
                <Text style={styles.improveBtnText}>
                  {generating ? "Oluşturuluyor..." : "AI ile Açıklama Oluştur"}
                </Text>
              </TouchableOpacity>

              {selected.improved_description && (
                <>
                  <TouchableOpacity
                    style={styles.showImprovedToggle}
                    onPress={() => setShowImproved((v) => !v)}
                  >
                    <Text style={[styles.showImprovedLabel, { color: t.orange }]}>
                      {showImproved ? "▲ Kapat" : "▼ İyileştirilmiş Açıklama"}
                    </Text>
                  </TouchableOpacity>
                  {showImproved && (
                    <View style={[styles.improvedBox, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
                      <Text style={styles.improvedText}>{selected.improved_description}</Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function StatBox({ label, value, valueColor, labelColor, bgColor }: { label: string; value: string; valueColor: string; labelColor: string; bgColor: string }) {
  return (
    <View style={[styles.statBox, { backgroundColor: bgColor }]}>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: labelColor }]}>{label}</Text>
    </View>
  );
}

function ScoreBar({ label, score, labelColor, trackColor }: { label: string; score: number; labelColor: string; trackColor: string }) {
  const color = score >= 70 ? "#059669" : score >= 50 ? "#d97706" : "#dc2626";
  return (
    <View style={styles.scoreBarWrap}>
      <View style={styles.scoreBarHeader}>
        <Text style={[styles.scoreBarLabel, { color: labelColor }]}>{label}</Text>
        <Text style={[styles.scoreBarValue, { color }]}>{score}</Text>
      </View>
      <View style={[styles.scoreBarBg, { backgroundColor: trackColor }]}>
        <View style={[styles.scoreBarFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 22, fontWeight: "800" },
  countBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  countText: { fontSize: 13, fontWeight: "600" },
  searchWrap: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, gap: 8 },
  search: { flex: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  sortRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  sortLabel: { fontSize: 12, fontWeight: "600" },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 },
  sortText: { fontSize: 12, fontWeight: "500" },
  sortTextActive: { color: "#fff", fontWeight: "700" },
  list: { padding: 16, gap: 10, paddingBottom: 32 },
  card: { borderRadius: 16, padding: 14, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  productIconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: "700" },
  productSku: { fontSize: 11, marginTop: 2 },
  pillRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  pillText: { fontSize: 11, fontWeight: "700" },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  stockText: { fontSize: 11, fontWeight: "600" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15 },
  // Modal
  modalSafe: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalClose: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  modalBody: { padding: 20, paddingBottom: 40 },
  modalIconWrap: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  modalProductName: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  modalSku: { fontSize: 13, marginBottom: 20 },
  modalGrid: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statBox: { flex: 1, borderRadius: 14, padding: 14, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: "600" },
  modalSectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 12 },
  scoreBarWrap: { marginBottom: 14 },
  scoreBarHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  scoreBarLabel: { fontSize: 13 },
  scoreBarValue: { fontSize: 13, fontWeight: "700" },
  scoreBarBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  scoreBarFill: { height: 8, borderRadius: 4 },
  aiTip: { flexDirection: "row", gap: 10, borderRadius: 14, padding: 14, marginTop: 8, borderWidth: 1, alignItems: "flex-start" },
  aiTipText: { flex: 1, fontSize: 13, color: "#92400e", lineHeight: 18 },
  improveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, marginTop: 12 },
  improveBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  showImprovedToggle: { paddingVertical: 8, alignItems: "center" },
  showImprovedLabel: { fontSize: 13, fontWeight: "600" },
  improvedBox: { borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 8 },
  improvedText: { fontSize: 14, color: "#1e40af", lineHeight: 22 },
});
