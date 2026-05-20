import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/theme";
import { SkeletonCard } from "@/lib/Skeleton";

interface Message {
  id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  body: string;
  status: "okunmadi" | "okundu" | "cevaplandi";
  created_at: string;
  reply?: string;
  product_name?: string;
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  okunmadi: { label: "Yeni", color: "#dc2626", bg: "#fee2e2" },
  okundu: { label: "Okundu", color: "#d97706", bg: "#fef3c7" },
  cevaplandi: { label: "Cevaplandı", color: "#059669", bg: "#d1fae5" },
};

const FILTERS = [
  { label: "Tümü", value: "all" },
  { label: "Yeni", value: "okunmadi" },
  { label: "Bekliyor", value: "okundu" },
  { label: "Cevaplandı", value: "cevaplandi" },
];

const QUICK_REPLIES = [
  { label: "Teşekkür", text: "Mesajınız için teşekkür ederiz! En kısa sürede yardımcı olacağız. 😊" },
  { label: "Kargo bilgisi", text: "Siparişiniz kargoya verilmiştir. Takip numaranızı e-posta ile ilettik." },
  { label: "İade başlat", text: "İade talebinizi aldık. Ürünü orijinal ambalajında göndererek iade sürecini başlatabilirsiniz." },
  { label: "Stok", text: "İlgilendiğiniz ürün şu an stokta bulunmamaktadır. Stoka girdiğinde bilgilendireceğiz." },
];

export default function MesajlarScreen() {
  const t = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filtered, setFiltered] = useState<Message[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Message | null>(null);
  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("messages")
      .select("id, customer_name, customer_email, subject, body, status, created_at, reply, product_name")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });
    setMessages(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    setFiltered(filter === "all" ? messages : messages.filter((m) => m.status === filter));
  }, [messages, filter]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function openMessage(m: Message) {
    Haptics.selectionAsync();
    setSelected(m);
    setReply(m.reply ?? "");
    if (m.status === "okunmadi") {
      await supabase.from("messages").update({ status: "okundu" }).eq("id", m.id);
      setMessages((prev) => prev.map((msg) => msg.id === m.id ? { ...msg, status: "okundu" } : msg));
    }
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setReplying(true);
    await supabase.from("messages").update({ reply: reply.trim(), status: "cevaplandi" }).eq("id", selected.id);
    setMessages((prev) => prev.map((m) => m.id === selected.id ? { ...m, reply: reply.trim(), status: "cevaplandi" } : m));
    setReplying(false);
    setSelected(null);
  }

  const unread = messages.filter((m) => m.status === "okunmadi").length;

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={["top"]}>
        <View style={[styles.header, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
          <Text style={[styles.title, { color: t.text }]}>Mesajlar</Text>
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
          <Text style={[styles.title, { color: t.text }]}>Mesajlar</Text>
          {unread > 0 && <Text style={styles.unreadText}>{unread} yeni mesaj</Text>}
        </View>
        <View style={[styles.countBadge, { backgroundColor: t.input }]}>
          <Text style={[styles.countText, { color: t.textSub }]}>{filtered.length}</Text>
        </View>
      </View>

      <View style={[styles.filters, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterBtn, { backgroundColor: t.input }, filter === f.value && { backgroundColor: t.orange }]}
            onPress={() => { Haptics.selectionAsync(); setFilter(f.value); }}
          >
            <Text style={[styles.filterText, { color: t.textSub }, filter === f.value && { color: "#fff", fontWeight: "700" }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.orange} />}
        renderItem={({ item: m }) => {
          const s = STATUS_STYLE[m.status];
          const isUnread = m.status === "okunmadi";
          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: t.card }, isUnread && { borderLeftWidth: 3, borderLeftColor: t.orange }]}
              onPress={() => openMessage(m)}
              activeOpacity={0.75}
            >
              <View style={styles.cardTop}>
                <View style={[styles.avatarSmall, { backgroundColor: t.orange + "22" }]}>
                  <Text style={[styles.avatarSmallText, { color: t.orange }]}>
                    {(m.customer_name || "?").slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.cardMeta}>
                  <Text style={[styles.customerName, { color: t.text }, isUnread && { fontWeight: "800" }]}>
                    {m.customer_name || "Anonim müşteri"}
                  </Text>
                  <Text style={[styles.msgDate, { color: t.textMuted }]}>
                    {new Date(m.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                  </Text>
                </View>
                {s && (
                  <View style={[styles.badge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.subject, { color: t.text }, isUnread && { fontWeight: "700" }]} numberOfLines={1}>
                {m.subject}
              </Text>
              <Text style={[styles.preview, { color: t.textSub }]} numberOfLines={2}>{m.body}</Text>
              {m.product_name && (
                <View style={[styles.productTag, { backgroundColor: t.input }]}>
                  <Ionicons name="pricetag-outline" size={10} color={t.textMuted} />
                  <Text style={[styles.productTagText, { color: t.textMuted }]} numberOfLines={1}>{m.product_name}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="mail-outline" size={48} color={t.textMuted} />
            <Text style={[styles.emptyText, { color: t.textMuted }]}>Mesaj bulunamadı</Text>
          </View>
        }
      />

      {/* Message Detail Modal */}
      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelected(null)}>
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: t.card }]} edges={["top"]}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={[styles.modalHeader, { borderBottomColor: t.border }]}>
              <TouchableOpacity onPress={() => setSelected(null)} style={[styles.modalClose, { backgroundColor: t.input }]}>
                <Ionicons name="close" size={22} color={t.textSub} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: t.text }]}>Mesaj</Text>
              <View style={{ width: 36 }} />
            </View>

            {selected && (
              <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                {/* Customer info */}
                <View style={styles.customerInfo}>
                  <View style={[styles.avatarLarge, { backgroundColor: t.orange }]}>
                    <Text style={styles.avatarLargeText}>
                      {(selected.customer_name || "?").slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.customerNameLarge, { color: t.text }]}>{selected.customer_name || "Anonim"}</Text>
                    <Text style={[styles.customerEmail, { color: t.textSub }]}>{selected.customer_email}</Text>
                  </View>
                </View>

                <Text style={[styles.subjectLarge, { color: t.text }]}>{selected.subject}</Text>
                <Text style={[styles.msgDateLarge, { color: t.textMuted }]}>
                  {new Date(selected.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </Text>

                <View style={[styles.bodyBox, { backgroundColor: t.bg }]}>
                  <Text style={[styles.bodyText, { color: t.text }]}>{selected.body}</Text>
                </View>

                {selected.product_name && (
                  <View style={[styles.productTagLarge, { backgroundColor: t.input }]}>
                    <Ionicons name="pricetag-outline" size={13} color={t.textSub} />
                    <Text style={[styles.productTagLargeText, { color: t.textSub }]}>{selected.product_name}</Text>
                  </View>
                )}

                {selected.reply && (
                  <View style={[styles.prevReply, { backgroundColor: "#f0fdf4" }]}>
                    <View style={styles.prevReplyHeader}>
                      <Ionicons name="return-down-forward" size={13} color="#059669" />
                      <Text style={styles.prevReplyLabel}>Önceki yanıtın</Text>
                    </View>
                    <Text style={styles.prevReplyText}>{selected.reply}</Text>
                  </View>
                )}

                {/* Quick replies */}
                <Text style={[styles.replyLabel, { color: t.textSub }]}>Hızlı Şablonlar</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ gap: 8 }}>
                  {QUICK_REPLIES.map((qr) => (
                    <TouchableOpacity
                      key={qr.label}
                      style={[styles.templateBtn, { backgroundColor: t.input, borderColor: t.border }]}
                      onPress={() => { Haptics.selectionAsync(); setReply(qr.text); }}
                    >
                      <Text style={[styles.templateBtnText, { color: t.text }]}>{qr.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={[styles.replyLabel, { color: t.textSub }]}>Yanıt Yaz</Text>
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
                  onPress={sendReply}
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 22, fontWeight: "800" },
  unreadText: { fontSize: 12, color: "#f97316", fontWeight: "600", marginTop: 2 },
  countBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  countText: { fontSize: 13, fontWeight: "600" },
  filters: { flexDirection: "row", gap: 8, padding: 12, borderBottomWidth: 1 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  filterText: { fontSize: 12, fontWeight: "500" },
  list: { padding: 16, gap: 10, paddingBottom: 32 },
  card: { borderRadius: 16, padding: 14, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  avatarSmall: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  avatarSmallText: { fontSize: 14, fontWeight: "700" },
  cardMeta: { flex: 1 },
  customerName: { fontSize: 13, fontWeight: "600" },
  msgDate: { fontSize: 11, marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  subject: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  preview: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  productTag: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  productTagText: { fontSize: 10, fontWeight: "500" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15 },
  // Modal
  modalSafe: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalClose: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  customerInfo: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  avatarLarge: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  avatarLargeText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  customerNameLarge: { fontSize: 16, fontWeight: "700" },
  customerEmail: { fontSize: 13, marginTop: 2 },
  subjectLarge: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  msgDateLarge: { fontSize: 12, marginBottom: 16 },
  bodyBox: { borderRadius: 14, padding: 16, marginBottom: 16 },
  bodyText: { fontSize: 15, lineHeight: 22 },
  productTagLarge: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginBottom: 16 },
  productTagLargeText: { fontSize: 13, fontWeight: "500" },
  prevReply: { borderRadius: 14, padding: 14, marginBottom: 20 },
  prevReplyHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  prevReplyLabel: { fontSize: 12, fontWeight: "700", color: "#059669" },
  prevReplyText: { fontSize: 14, color: "#374151", lineHeight: 20 },
  replyLabel: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  templateBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  templateBtnText: { fontSize: 13, fontWeight: "600" },
  replyInput: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 15, minHeight: 110, marginBottom: 16 },
  replyBtn: { borderRadius: 14, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  replyBtnDisabled: { opacity: 0.5 },
  replyBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
