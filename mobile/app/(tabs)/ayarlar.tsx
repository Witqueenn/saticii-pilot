import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Share,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/theme";
import { useThemeContext } from "@/lib/ThemeContext";

interface Credential { id: string; marketplace: string; }

const PLATFORMS = [
  {
    id: "trendyol",
    name: "Trendyol",
    initials: "TY",
    color: "#f97316",
    bg: "#fff7ed",
    active: true,
    fields: [
      { key: "api_key",     label: "API Key",     placeholder: "Trendyol API Key" },
      { key: "api_secret",  label: "API Secret",  placeholder: "Trendyol API Secret" },
      { key: "supplier_id", label: "Supplier ID", placeholder: "Mağaza ID" },
    ],
  },
  { id: "hepsiburada", name: "Hepsiburada", initials: "HB", color: "#3b82f6", bg: "#eff6ff", active: false, fields: [] },
  { id: "n11",          name: "N11",          initials: "N11", color: "#7c3aed", bg: "#ede9fe", active: false, fields: [] },
  { id: "amazon_tr",    name: "Amazon TR",    initials: "AZ", color: "#6b7280", bg: "#f3f4f6", active: false, fields: [] },
];

const planLabel: Record<string, string> = {
  temel: "Temel",
  profesyonel: "Pro",
  marketing: "Marketing",
};

const planColor: Record<string, string> = {
  temel: "#6b7280",
  profesyonel: "#f97316",
  marketing: "#6366f1",
};

export default function AyarlarScreen() {
  const t = useTheme();
  const { mode, setMode, isDark } = useThemeContext();
  const [email, setEmail] = useState("");
  const [shopName, setShopName] = useState("");
  const [plan, setPlan] = useState("temel");
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [userId, setUserId] = useState("");
  const [connected, setConnected] = useState<Credential[]>([]);
  const [connectModal, setConnectModal] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [editNameModal, setEditNameModal] = useState(false);
  const [newShopName, setNewShopName] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      setShopName(user.user_metadata?.shop_name ?? "");
      setUserId(user.id);
      const [sellerRes, credRes] = await Promise.all([
        supabase.from("sellers").select("plan, referral_code, referral_count").eq("id", user.id).single(),
        supabase.from("marketplace_credentials").select("id, marketplace").eq("seller_id", user.id),
      ]);
      const seller = sellerRes.data;
      if (seller) {
        setPlan(seller.plan ?? "temel");
        setReferralCount(seller.referral_count ?? 0);
        if (seller.referral_code) {
          setReferralCode(seller.referral_code);
        } else {
          const code = "SP" + Math.random().toString(36).toUpperCase().slice(2, 8);
          await supabase.from("sellers").update({ referral_code: code }).eq("id", user.id);
          setReferralCode(code);
        }
      }
      setConnected(credRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  function isConnected(platformId: string) {
    return connected.some((c) => c.marketplace === platformId);
  }

  async function credentialsApiCall(method: "POST" | "DELETE", body: object) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "";
    const res = await fetch(`${apiUrl}/api/credentials`, {
      method,
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
  }

  async function handleConnect(platformId: string) {
    setSaving(true);
    try {
      await credentialsApiCall("POST", {
        marketplace: platformId,
        api_key: fieldValues.api_key ?? "",
        api_secret: fieldValues.api_secret ?? "",
        supplier_id: fieldValues.supplier_id ?? null,
      });
      const { data } = await supabase.from("marketplace_credentials").select("id, marketplace").eq("seller_id", userId);
      setConnected(data ?? []);
      setConnectModal(null);
      setFieldValues({});
      Alert.alert("Bağlandı ✓", `${PLATFORMS.find(p => p.id === platformId)?.name} başarıyla bağlandı.`);
    } catch {
      Alert.alert("Hata", "Bağlantı kaydedilemedi. Lütfen tekrar dene.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect(platformId: string) {
    Alert.alert(
      "Bağlantıyı Kes",
      `${PLATFORMS.find(p => p.id === platformId)?.name} bağlantısını kesmek istediğine emin misin?`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Kes", style: "destructive", onPress: async () => {
            setDisconnecting(platformId);
            try {
              await credentialsApiCall("DELETE", { marketplace: platformId });
            } catch {
              await supabase.from("marketplace_credentials").delete().eq("seller_id", userId).eq("marketplace", platformId);
            }
            setConnected((prev) => prev.filter((c) => c.marketplace !== platformId));
            setDisconnecting(null);
          }
        },
      ]
    );
  }

  async function shareReferral() {
    const link = `https://saticipilot.com/beta?ref=${referralCode}`;
    await Share.share({
      message: `SatıcıPilot ile mağazanı büyüt! Davet linkimle erken erişim kazan: ${link}`,
      url: link,
    });
  }

  async function saveShopName() {
    if (!newShopName.trim()) return;
    setSavingName(true);
    await supabase.auth.updateUser({ data: { shop_name: newShopName.trim() } });
    setShopName(newShopName.trim());
    setSavingName(false);
    setEditNameModal(false);
  }

  async function signOut() {
    Alert.alert("Çıkış Yap", "Çıkış yapmak istediğine emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Çıkış Yap", style: "destructive", onPress: () => supabase.auth.signOut() },
    ]);
  }

  const initials = (shopName || email).slice(0, 2).toUpperCase();
  const color = planColor[plan] ?? "#6b7280";

  if (loading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: t.bg }]}>
        <ActivityIndicator color={t.orange} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: t.text }]}>Ayarlar</Text>

        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: t.card, borderColor: t.borderStrong }]}>
          <View style={[styles.avatar, { backgroundColor: t.orange }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: t.text }]}>{shopName || "Mağaza adı yok"}</Text>
            <Text style={[styles.profileEmail, { color: t.textSub }]} numberOfLines={1}>{email}</Text>
            <View style={[styles.planBadge, { backgroundColor: color + "18" }]}>
              <Text style={[styles.planText, { color }]}>{planLabel[plan] ?? plan} Plan</Text>
            </View>
          </View>
        </View>

        {/* Plan yükselt kartı */}
        {plan === "temel" && (
          <TouchableOpacity
            style={[styles.upgradeCard, { backgroundColor: t.orange }]}
            onPress={() => router.push("/plan-yukselt")}
          >
            <View style={styles.upgradeLeft}>
              <Ionicons name="flash" size={20} color="#fff" />
              <View>
                <Text style={styles.upgradeTitle}>{"Pro'ya geç"}</Text>
                <Text style={styles.upgradeSub}>14 gün ücretsiz dene · ₺799/ay</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Hesap */}
        <Text style={[styles.sectionLabel, { color: t.textMuted }]}>HESAP</Text>
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.borderStrong }]}>
          <InfoRow icon="mail-outline" label="E-posta" value={email} t={t} />
          <TouchableOpacity onPress={() => { setNewShopName(shopName); setEditNameModal(true); }}>
            <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: t.border }]}>
              <View style={styles.rowLeft}>
                <Ionicons name="storefront-outline" size={16} color={t.textMuted} style={styles.rowIcon} />
                <Text style={[styles.rowLabel, { color: t.textSub }]}>Mağaza</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={[styles.rowValue, { color: t.text }]} numberOfLines={1}>{shopName || "—"}</Text>
                <Ionicons name="pencil-outline" size={14} color={t.textMuted} />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/plan-yukselt")}>
            <InfoRow icon="ribbon-outline" label="Plan" value={planLabel[plan] ?? plan} last t={t} />
          </TouchableOpacity>
        </View>

        {/* Platformlar */}
        <Text style={[styles.sectionLabel, { color: t.textMuted }]}>PLATFORMLAR</Text>
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.borderStrong }]}>
          {PLATFORMS.map((p, i) => {
            const conn = isConnected(p.id);
            const last = i === PLATFORMS.length - 1;
            return (
              <View
                key={p.id}
                style={[styles.platformRow, !last && { borderBottomWidth: 1, borderBottomColor: t.border }]}
              >
                <View style={[styles.platformInitials, { backgroundColor: p.bg }]}>
                  <Text style={[styles.platformInitialsText, { color: p.color }]}>{p.initials}</Text>
                </View>
                <Text style={[styles.platformName, { color: t.text }]}>{p.name}</Text>
                {!p.active ? (
                  <View style={[styles.platformBadge, { backgroundColor: t.input }]}>
                    <Text style={[styles.platformBadgeText, { color: t.textMuted }]}>Yakında</Text>
                  </View>
                ) : conn ? (
                  <TouchableOpacity
                    style={[styles.platformBadge, { backgroundColor: "#d1fae5" }]}
                    onPress={() => handleDisconnect(p.id)}
                    disabled={disconnecting === p.id}
                  >
                    {disconnecting === p.id
                      ? <ActivityIndicator size="small" color="#059669" />
                      : <>
                          <Ionicons name="checkmark-circle" size={13} color="#059669" />
                          <Text style={[styles.platformBadgeText, { color: "#059669" }]}>Bağlı</Text>
                        </>
                    }
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.platformBadge, { backgroundColor: p.color + "18" }]}
                    onPress={() => { setConnectModal(p.id); setFieldValues({}); }}
                  >
                    <Ionicons name="add-circle-outline" size={13} color={p.color} />
                    <Text style={[styles.platformBadgeText, { color: p.color }]}>Bağla</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Uygulama */}
        <Text style={[styles.sectionLabel, { color: t.textMuted }]}>UYGULAMA</Text>
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.borderStrong }]}>
          <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: t.border }]}>
            <View style={styles.rowLeft}>
              <Ionicons name="moon-outline" size={16} color={t.textMuted} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, { color: t.textSub }]}>Karanlık Mod</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={(v) => setMode(v ? "dark" : "light")}
              trackColor={{ false: t.border, true: t.orange }}
              thumbColor="#fff"
            />
          </View>
          <InfoRow icon="information-circle-outline" label="Versiyon" value="1.0.0" last t={t} />
        </View>

        {/* Referans */}
        <Text style={[styles.sectionLabel, { color: t.textMuted }]}>ARKADAŞINI DAVET ET</Text>
        <View style={[styles.referralCard, { backgroundColor: t.card }]}>
          <View style={styles.referralHeader}>
            <Ionicons name="gift-outline" size={18} color={t.orange} />
            <Text style={[styles.referralTitle, { color: t.text }]}>Davet Et, Ödül Kazan</Text>
          </View>
          <Text style={[styles.referralDesc, { color: t.textSub }]}>
            {"Her Pro'ya geçen davetinde"}{" "}
            <Text style={{ color: t.orange, fontWeight: "700" }}>1 ay ücretsiz Pro</Text> kazanırsın.
          </Text>

          <View style={[styles.codeBox, { backgroundColor: t.input, borderColor: t.border }]}>
            <Text style={[styles.codeText, { color: t.text }]}>
              saticipilot.com/beta?ref={referralCode}
            </Text>
          </View>

          <View style={styles.referralRow}>
            <View style={[styles.countPill, { backgroundColor: t.orange + "18" }]}>
              <Ionicons name="people-outline" size={14} color={t.orange} />
              <Text style={[styles.countText, { color: t.orange }]}>{referralCount} davet</Text>
            </View>
            <TouchableOpacity style={[styles.shareBtn, { backgroundColor: t.orange }]} onPress={shareReferral}>
              <Ionicons name="share-outline" size={16} color="#fff" />
              <Text style={styles.shareBtnText}>Paylaş</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Çıkış */}
        <TouchableOpacity style={[styles.signOutBtn, { backgroundColor: t.card, borderColor: "#fecaca" }]} onPress={signOut}>
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text style={styles.signOutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Mağaza adı düzenleme modal */}
      <Modal visible={editNameModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditNameModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <SafeAreaView style={[styles.modalSafe, { backgroundColor: t.card }]} edges={["top"]}>
            <View style={[styles.modalHeader, { borderBottomColor: t.border }]}>
              <TouchableOpacity onPress={() => setEditNameModal(false)} style={[styles.modalClose, { backgroundColor: t.input }]}>
                <Ionicons name="close" size={22} color={t.textSub} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: t.text }]}>Mağaza Adı</Text>
              <View style={{ width: 36 }} />
            </View>
            <View style={styles.modalBody}>
              <Text style={[styles.fieldLabel, { color: t.textSub }]}>Mağaza Adı</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: t.input, color: t.text, borderColor: t.border }]}
                value={newShopName}
                onChangeText={setNewShopName}
                placeholder="Mağaza adınız"
                placeholderTextColor={t.textMuted}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: t.orange, marginTop: 8 }, savingName && { opacity: 0.6 }]}
                onPress={saveShopName}
                disabled={savingName || !newShopName.trim()}
              >
                {savingName
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveBtnText}>Kaydet</Text>
                }
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Platform bağlantı modal */}
      {PLATFORMS.filter(p => p.active).map((platform) => (
        <Modal
          key={platform.id}
          visible={connectModal === platform.id}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setConnectModal(null)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <SafeAreaView style={[styles.modalSafe, { backgroundColor: t.card }]} edges={["top"]}>
              <View style={[styles.modalHeader, { borderBottomColor: t.border }]}>
                <TouchableOpacity onPress={() => setConnectModal(null)} style={[styles.modalClose, { backgroundColor: t.input }]}>
                  <Ionicons name="close" size={22} color={t.textSub} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: t.text }]}>{platform.name} Bağla</Text>
                <View style={{ width: 36 }} />
              </View>

              <ScrollView contentContainerStyle={styles.modalBody}>
                <View style={[styles.platformModalIcon, { backgroundColor: platform.bg }]}>
                  <Text style={[styles.platformModalInitials, { color: platform.color }]}>{platform.initials}</Text>
                </View>
                <Text style={[styles.modalDesc, { color: t.textSub }]}>
                  {"API bilgilerini girerek "}{platform.name}{" mağazanı SatıcıPilot'a bağla."}
                </Text>

                {platform.fields.map((field) => (
                  <View key={field.key} style={styles.fieldWrap}>
                    <Text style={[styles.fieldLabel, { color: t.textSub }]}>{field.label}</Text>
                    <TextInput
                      style={[styles.fieldInput, { backgroundColor: t.input, color: t.text, borderColor: t.border }]}
                      placeholder={field.placeholder}
                      placeholderTextColor={t.textMuted}
                      value={fieldValues[field.key] ?? ""}
                      onChangeText={(v) => setFieldValues((prev) => ({ ...prev, [field.key]: v }))}
                      autoCapitalize="none"
                      autoCorrect={false}
                      secureTextEntry={field.key === "api_secret"}
                    />
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: platform.color }, saving && { opacity: 0.6 }]}
                  onPress={() => handleConnect(platform.id)}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.saveBtnText}>Bağlan</Text>
                  }
                </TouchableOpacity>
              </ScrollView>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Modal>
      ))}
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last,
  t,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  last?: boolean;
  t: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: t.border }]}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={16} color={t.textMuted} style={styles.rowIcon} />
        <Text style={[styles.rowLabel, { color: t.textSub }]}>{label}</Text>
      </View>
      <Text style={[styles.rowValue, { color: t.text }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 20 },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: "700" },
  profileEmail: { fontSize: 13, marginTop: 2 },
  planBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  planText: { fontSize: 12, fontWeight: "700" },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowIcon: {},
  rowLabel: { fontSize: 14 },
  rowValue: { fontSize: 14, fontWeight: "600", maxWidth: "55%", textAlign: "right" },
  upgradeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#f97316",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  upgradeLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  upgradeTitle: { color: "#fff", fontSize: 15, fontWeight: "700" },
  upgradeSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  signOutBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  signOutText: { color: "#ef4444", fontSize: 15, fontWeight: "700" },
  referralCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  referralHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  referralTitle: { fontSize: 15, fontWeight: "700" },
  referralDesc: { fontSize: 13, marginBottom: 12, lineHeight: 18 },
  codeBox: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  codeText: { fontSize: 11, fontFamily: "monospace" },
  referralRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  countPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  countText: { fontSize: 13, fontWeight: "600" },
  shareBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  shareBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  // Platform rows
  platformRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  platformInitials: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  platformInitialsText: { fontSize: 11, fontWeight: "800" },
  platformName: { flex: 1, fontSize: 14, fontWeight: "600" },
  platformBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  platformBadgeText: { fontSize: 12, fontWeight: "700" },
  // Connect modal
  modalSafe: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalClose: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  modalBody: { padding: 24, paddingBottom: 40 },
  platformModalIcon: { width: 64, height: 64, borderRadius: 18, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 16 },
  platformModalInitials: { fontSize: 18, fontWeight: "800" },
  modalDesc: { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 28 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  fieldInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
