import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";
import { SkeletonCard } from "@/lib/Skeleton";
import { useBadges } from "@/lib/BadgeContext";
import { useTheme } from "@/lib/theme";

interface Review {
  id: string;
  rating: number;
  comment: string;
  product_name: string;
  customer_name?: string;
  is_replied: boolean;
  is_urgent: boolean;
  suggested_reply?: string;
  created_at: string;
}

function reviewStatus(r: Review): "acil" | "cevaplanmadi" | "cevaplandi" {
  if (r.is_replied) return "cevaplandi";
  if (r.is_urgent) return "acil";
  return "cevaplanmadi";
}

const FILTERS = [
  { label: "Tümü", value: "all" },
  { label: "Acil", value: "acil" },
  { label: "Bekliyor", value: "cevaplanmadi" },
  { label: "Cevaplandı", value: "cevaplandi" },
];

const QUICK_REPLIES = [
  { label: "Teşekkür", text: "Değerli yorumunuz için teşekkür ederiz! Memnuniyetiniz bizim için çok önemli. 😊" },
  { label: "Özür", text: "Yaşadığınız deneyim için özür dileriz. Sorununuzu çözmek için size ulaşacağız." },
  { label: "Kargo", text: "Kargo sürecindeki aksama için üzgünüz. Lojistik ekibimiz bilgilendirildi." },
  { label: "İade", text: "İade talebinizi aldık. Müşteri hizmetlerimiz en kısa sürede iletişime geçecek." },
];

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  acil: { label: "Acil", color: "#dc2626", bg: "#fee2e2" },
  cevaplanmadi: { label: "Bekliyor", color: "#d97706", bg: "#fef3c7" },
  cevaplandi: { label: "Cevaplandı", color: "#059669", bg: "#d1fae5" },
};


interface AnalysisResult {
  totalAnalyzed: number;
  sentiment: { positive: number; neutral: number; negative: number };
  complaints: { topic: string; count: number; example: string }[];
  praises:    { topic: string; count: number; example: string }[];
  recommendations: string[];
  summary: string;
}

export default function YorumlarScreen() {
  const t = useTheme();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filtered, setFiltered] = useState<Review[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Review | null>(null);
  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { refresh: refreshBadges } = useBadges();

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("reviews")
      .select("id, rating, comment, product_name, customer_name, is_replied, is_urgent, suggested_reply, created_at")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });
    setReviews(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let res = reviews;
    if (filter === "acil") res = res.filter((r) => r.is_urgent && !r.is_replied);
    else if (filter === "cevaplanmadi") res = res.filter((r) => !r.is_replied);
    else if (filter === "cevaplandi") res = res.filter((r) => r.is_replied);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(
        (r) => r.product_name?.toLowerCase().includes(q) || r.comment?.toLowerCase().includes(q)
      );
    }
    setFiltered(res);
  }, [reviews, filter, search]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function openReview(r: Review) {
    Haptics.selectionAsync();
    setSelected(r);
    setReply(r.suggested_reply ?? "");
  }

  async function runAnalysis() {
    if (reviews.length === 0) return;
    Haptics.selectionAsync();
    setAnalysisLoading(true);
    setShowAnalysis(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "";
      const payload = reviews.slice(0, 60).map((r) => ({
        rating: r.rating, comment: r.comment, product_name: r.product_name,
      }));
      const res = await fetch(`${apiUrl}/api/ai/review-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
        body: JSON.stringify({ reviews: payload }),
      });
      const json = await res.json();
      if (!json.error) setAnalysis(json as AnalysisResult);
      else Alert.alert("Hata", json.error);
    } catch {
      Alert.alert("Hata", "Bağlantı hatası.");
    } finally {
      setAnalysisLoading(false);
    }
  }

  async function suggestAIReply() {
    if (!selected) return;
    Haptics.selectionAsync();
    setAiLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "";
      const res = await fetch(`${apiUrl}/api/ai/draft-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          review_id: selected.id,
          product_name: selected.product_name,
          rating: selected.rating,
          comment: selected.comment,
          sentiment: null,
        }),
      });
      const json = await res.json();
      if (json.reply) {
        setReply(json.reply);
        setReviews((prev) =>
          prev.map((r) => r.id === selected.id ? { ...r, suggested_reply: json.reply } : r)
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert("Hata", json.error ?? "AI yanıt üretilemedi.");
      }
    } catch {
      Alert.alert("Hata", "Bağlantı hatası. İnternet bağlantını kontrol et.");
    } finally {
      setAiLoading(false);
    }
  }

  async function submitReply() {
    if (!selected || !reply.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setReplying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "";
      const res = await fetch(`${apiUrl}/api/trendyol/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
        body: JSON.stringify({ review_id: selected.id, reply_text: reply.trim() }),
      });
      const json = await res.json();
      setReviews((prev) =>
        prev.map((r) => r.id === selected.id ? { ...r, suggested_reply: reply.trim(), is_replied: true } : r)
      );
      refreshBadges();
      Alert.alert(json.trendyol_ok ? "Trendyol'a gönderildi ✓" : (json.message ?? "Yanıt kaydedildi"));
    } catch {
      Alert.alert("Hata", "Bağlantı hatası. Tekrar dene.");
    } finally {
      setReplying(false);
      setSelected(null);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={["top"]}>
        <View style={[styles.header, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
          <Text style={[styles.title, { color: t.text }]}>Yorumlar</Text>
        </View>
        <View style={{ padding: 16 }}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
        <Text style={[styles.title, { color: t.text }]}>Yorumlar</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={[styles.countBadge, { backgroundColor: t.input }]}>
            <Text style={[styles.countText, { color: t.textSub }]}>{filtered.length}</Text>
          </View>
          <TouchableOpacity
            style={[styles.analyzeBtn, { backgroundColor: t.orange + "18", borderColor: t.orange + "50" }]}
            onPress={runAnalysis}
            disabled={analysisLoading || reviews.length === 0}
            activeOpacity={0.75}
          >
            {analysisLoading
              ? <ActivityIndicator size="small" color={t.orange} />
              : <Ionicons name="analytics" size={15} color={t.orange} />
            }
            <Text style={[styles.analyzeBtnText, { color: t.orange }]}>Analiz</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
        <Ionicons name="search" size={16} color={t.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.search, { backgroundColor: t.input, color: t.text }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Ürün veya yorum ara..."
          placeholderTextColor={t.textMuted}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={t.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={[styles.filters, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
        {FILTERS.map((f) => (
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
          const s = STATUS_STYLE[reviewStatus(r)];
          const isNegative = r.rating <= 2;
          return (
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: t.card, borderColor: t.borderStrong, borderLeftColor: s?.color ?? t.borderStrong, borderLeftWidth: 3 },
              ]}
              onPress={() => openReview(r)}
              activeOpacity={0.75}
            >
              <View style={styles.cardTop}>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons key={i} name={i <= r.rating ? "star" : "star-outline"} size={14}
                      color={isNegative ? "#ef4444" : t.orange} />
                  ))}
                </View>
                {s && (
                  <View style={[styles.badge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.product, { color: t.text }]} numberOfLines={1}>{r.product_name}</Text>
              <Text style={[styles.comment, { color: t.textSub }]} numberOfLines={2}>{r.comment}</Text>
              {r.suggested_reply && (
                <View style={styles.replyPreview}>
                  <Ionicons name="return-down-forward" size={12} color="#059669" />
                  <Text style={styles.replyPreviewText} numberOfLines={1}>{r.suggested_reply}</Text>
                </View>
              )}
              <View style={styles.cardBottom}>
                <Text style={[styles.date, { color: t.textMuted }]}>
                  {new Date(r.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
                </Text>
                <View style={styles.tapHint}>
                  <Text style={[styles.tapHintText, { color: t.textMuted }]}>Yanıtla</Text>
                  <Ionicons name="chevron-forward" size={12} color={t.textMuted} />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubble-outline" size={48} color={t.textMuted} />
            <Text style={[styles.emptyText, { color: t.textMuted }]}>Yorum bulunamadı</Text>
          </View>
        }
      />

      {/* Analysis Modal */}
      <Modal visible={showAnalysis} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAnalysis(false)}>
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: t.card }]} edges={["top"]}>
          <View style={[styles.modalHeader, { borderBottomColor: t.border }]}>
            <TouchableOpacity onPress={() => setShowAnalysis(false)} style={[styles.modalClose, { backgroundColor: t.input }]}>
              <Ionicons name="close" size={22} color={t.textSub} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: t.text }]}>Yorum Analizi</Text>
            <TouchableOpacity
              onPress={runAnalysis}
              disabled={analysisLoading}
              style={[styles.modalClose, { backgroundColor: t.input }]}
            >
              <Ionicons name="refresh" size={18} color={analysisLoading ? t.textMuted : t.orange} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }} contentContainerStyle={{ paddingBottom: 40 }}>
            {analysisLoading ? (
              <View style={{ alignItems: "center", paddingTop: 60, gap: 16 }}>
                <ActivityIndicator size="large" color={t.orange} />
                <Text style={{ color: t.textSub, fontSize: 14 }}>Yorumlar analiz ediliyor…</Text>
              </View>
            ) : analysis ? (
              <>
                <Text style={{ color: t.textSub, fontSize: 13, marginBottom: 16 }}>
                  {analysis.totalAnalyzed} yorum analiz edildi
                </Text>

                {/* Özet */}
                <View style={{ backgroundColor: t.bg, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                  <Text style={{ color: t.text, fontSize: 14, lineHeight: 21 }}>{analysis.summary}</Text>
                </View>

                {/* Sentiment bar */}
                <View style={{ backgroundColor: t.bg, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                  <Text style={{ color: t.text, fontWeight: "700", fontSize: 13, marginBottom: 12 }}>Duygu Dağılımı</Text>
                  {[
                    { label: "Olumlu", count: analysis.sentiment.positive, color: "#10b981" },
                    { label: "Nötr",   count: analysis.sentiment.neutral,  color: "#6b7280" },
                    { label: "Olumsuz",count: analysis.sentiment.negative, color: "#ef4444" },
                  ].map((s) => {
                    const total = analysis.sentiment.positive + analysis.sentiment.neutral + analysis.sentiment.negative;
                    const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                    return (
                      <View key={s.label} style={{ marginBottom: 10 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                          <Text style={{ color: t.textSub, fontSize: 12 }}>{s.label}</Text>
                          <Text style={{ color: t.textSub, fontSize: 12 }}>{s.count} ({pct}%)</Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: t.border, borderRadius: 3 }}>
                          <View style={{ height: 6, width: `${pct}%`, backgroundColor: s.color, borderRadius: 3 }} />
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Şikayetler */}
                {analysis.complaints.length > 0 && (
                  <View style={{ backgroundColor: t.bg, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                    <Text style={{ color: "#ef4444", fontWeight: "700", fontSize: 13, marginBottom: 10 }}>
                      Öne Çıkan Şikayetler
                    </Text>
                    {analysis.complaints.map((c, i) => (
                      <View key={i} style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#fee2e2", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                          <Text style={{ color: "#ef4444", fontSize: 11, fontWeight: "800" }}>{c.count}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: t.text, fontSize: 13, fontWeight: "600" }}>{c.topic}</Text>
                          <Text style={{ color: t.textMuted, fontSize: 12, marginTop: 2, fontStyle: "italic" }}>"{c.example}"</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Övgüler */}
                {analysis.praises.length > 0 && (
                  <View style={{ backgroundColor: t.bg, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                    <Text style={{ color: "#10b981", fontWeight: "700", fontSize: 13, marginBottom: 10 }}>
                      Öne Çıkan Övgüler
                    </Text>
                    {analysis.praises.map((p, i) => (
                      <View key={i} style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#d1fae5", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                          <Text style={{ color: "#10b981", fontSize: 11, fontWeight: "800" }}>{p.count}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: t.text, fontSize: 13, fontWeight: "600" }}>{p.topic}</Text>
                          <Text style={{ color: t.textMuted, fontSize: 12, marginTop: 2, fontStyle: "italic" }}>"{p.example}"</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Öneriler */}
                <View style={{ backgroundColor: t.bg, borderRadius: 14, padding: 16 }}>
                  <Text style={{ color: t.orange, fontWeight: "700", fontSize: 13, marginBottom: 10 }}>
                    Aksiyon Önerileri
                  </Text>
                  {analysis.recommendations.map((rec, i) => (
                    <View key={i} style={{ flexDirection: "row", gap: 10, marginBottom: 8 }}>
                      <Text style={{ color: t.orange, fontWeight: "700", fontSize: 13 }}>{i + 1}.</Text>
                      <Text style={{ color: t.textSub, fontSize: 13, flex: 1, lineHeight: 19 }}>{rec}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelected(null)}>
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: t.card }]} edges={["top"]}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={[styles.modalHeader, { borderBottomColor: t.border }]}>
              <TouchableOpacity onPress={() => setSelected(null)} style={[styles.modalClose, { backgroundColor: t.input }]}>
                <Ionicons name="close" size={22} color={t.textSub} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: t.text }]}>Yorum Detayı</Text>
              <View style={{ width: 36 }} />
            </View>

            {selected && (
              <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Stars + status */}
                <View style={styles.modalTopRow}>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Ionicons key={i} name={i <= selected.rating ? "star" : "star-outline"} size={20}
                        color={selected.rating <= 2 ? "#ef4444" : t.orange} />
                    ))}
                  </View>
                  {STATUS_STYLE[reviewStatus(selected)] && (
                    <View style={[styles.badge, { backgroundColor: STATUS_STYLE[reviewStatus(selected)].bg }]}>
                      <Text style={[styles.badgeText, { color: STATUS_STYLE[reviewStatus(selected)].color }]}>
                        {STATUS_STYLE[reviewStatus(selected)].label}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.modalProduct, { color: t.text }]}>{selected.product_name}</Text>
                <Text style={[styles.modalDate, { color: t.textMuted }]}>
                  {new Date(selected.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                </Text>

                <View style={[styles.modalCommentBox, { backgroundColor: t.bg }]}>
                  <Text style={[styles.modalComment, { color: t.textSub }]}>{selected.comment}</Text>
                </View>

                {/* Previous reply */}
                {selected.suggested_reply && (
                  <View style={styles.previousReply}>
                    <View style={styles.previousReplyHeader}>
                      <Ionicons name="return-down-forward" size={14} color="#059669" />
                      <Text style={styles.previousReplyLabel}>Önceki yanıtın</Text>
                    </View>
                    <Text style={styles.previousReplyText}>{selected.suggested_reply}</Text>
                  </View>
                )}

                {/* AI Suggestion */}
                <TouchableOpacity
                  style={[styles.aiBtn, { backgroundColor: t.orange + "12", borderColor: t.orange + "40" }]}
                  onPress={suggestAIReply}
                  disabled={aiLoading}
                  activeOpacity={0.75}
                >
                  {aiLoading ? (
                    <ActivityIndicator size="small" color={t.orange} />
                  ) : (
                    <Ionicons name="flash" size={15} color={t.orange} />
                  )}
                  <Text style={[styles.aiBtnText, { color: t.orange }]}>
                    {aiLoading ? "AI yanıt üretiyor…" : "AI Yanıt Öner"}
                  </Text>
                  <View style={[styles.proBadge, { backgroundColor: t.orange }]}>
                    <Text style={styles.proBadgeText}>PRO</Text>
                  </View>
                </TouchableOpacity>

                {/* Quick reply templates */}
                <Text style={[styles.replyLabel, { color: t.textSub }]}>Hızlı Şablonlar</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesRow} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                  {QUICK_REPLIES.map((tmpl) => (
                    <TouchableOpacity
                      key={tmpl.label}
                      style={[styles.templateBtn, { backgroundColor: t.input, borderColor: t.borderStrong }]}
                      onPress={() => { Haptics.selectionAsync(); setReply(tmpl.text); }}
                    >
                      <Text style={[styles.templateBtnText, { color: t.textSub }]}>{tmpl.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Reply input */}
                <Text style={[styles.replyLabel, { marginTop: 12, color: t.textSub }]}>
                  {selected.suggested_reply ? "Yanıtı güncelle" : "Yanıt yaz"}
                </Text>
                <TextInput
                  style={[styles.replyInput, { backgroundColor: t.bg, borderColor: t.borderStrong, color: t.text }]}
                  value={reply}
                  onChangeText={setReply}
                  placeholder="Müşteriye yanıtınızı yazın..."
                  placeholderTextColor={t.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[styles.replyBtn, { backgroundColor: t.orange }, (!reply.trim() || replying) && styles.replyBtnDisabled]}
                  onPress={submitReply}
                  disabled={!reply.trim() || replying}
                >
                  {replying
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <>
                        <Ionicons name="send" size={16} color="#fff" />
                        <Text style={styles.replyBtnText}>Yanıtı Gönder</Text>
                      </>
                  }
                </TouchableOpacity>
              </ScrollView>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
  filters: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  filterText: { fontSize: 13, fontWeight: "500" },
  filterTextActive: { color: "#fff", fontWeight: "700" },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  card: { borderRadius: 14, padding: 16, borderWidth: 1 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  starsRow: { flexDirection: "row", gap: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  product: { fontSize: 14, fontWeight: "700", marginBottom: 6 },
  comment: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  replyPreview: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#f0fdf4", borderRadius: 8, padding: 8, marginBottom: 8 },
  replyPreviewText: { fontSize: 12, color: "#059669", flex: 1 },
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
  modalBody: { flex: 1, padding: 20 },
  modalTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalProduct: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  modalDate: { fontSize: 13, marginBottom: 16 },
  modalCommentBox: { borderRadius: 14, padding: 16, marginBottom: 20 },
  modalComment: { fontSize: 15, lineHeight: 22 },
  previousReply: { backgroundColor: "#f0fdf4", borderRadius: 14, padding: 14, marginBottom: 20 },
  previousReplyHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  previousReplyLabel: { fontSize: 12, fontWeight: "700", color: "#059669" },
  previousReplyText: { fontSize: 14, color: "#374151", lineHeight: 20 },
  replyLabel: { fontSize: 14, fontWeight: "700", marginBottom: 10 },
  replyInput: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 15, minHeight: 120, marginBottom: 16 },
  replyBtn: { borderRadius: 14, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  replyBtnDisabled: { opacity: 0.5 },
  replyBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  templatesRow: { marginBottom: 4 },
  templateBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  templateBtnText: { fontSize: 13, fontWeight: "600" },
  analyzeBtn: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  analyzeBtnText: { fontSize: 13, fontWeight: "700" },
  aiBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 },
  aiBtnText: { flex: 1, fontSize: 14, fontWeight: "700" },
  proBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  proBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
});
