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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/theme";

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
  const [email, setEmail] = useState("");
  const [shopName, setShopName] = useState("");
  const [plan, setPlan] = useState("temel");
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      setShopName(user.user_metadata?.shop_name ?? "");
      const { data: seller } = await supabase
        .from("sellers")
        .select("plan, referral_code, referral_count")
        .eq("id", user.id)
        .single();
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
      setLoading(false);
    }
    load();
  }, []);

  async function shareReferral() {
    const link = `https://saticipilot.com/beta?ref=${referralCode}`;
    await Share.share({
      message: `SatıcıPilot ile mağazanı büyüt! Davet linkimle erken erişim kazan: ${link}`,
      url: link,
    });
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
        <View style={[styles.profileCard, { backgroundColor: t.card }]}>
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
                <Text style={styles.upgradeTitle}>Pro'ya geç</Text>
                <Text style={styles.upgradeSub}>14 gün ücretsiz dene · ₺799/ay</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Hesap */}
        <Text style={[styles.sectionLabel, { color: t.textMuted }]}>HESAP</Text>
        <View style={[styles.card, { backgroundColor: t.card }]}>
          <InfoRow icon="mail-outline" label="E-posta" value={email} t={t} />
          <InfoRow icon="storefront-outline" label="Mağaza" value={shopName || "—"} t={t} />
          <TouchableOpacity onPress={() => router.push("/plan-yukselt")}>
            <InfoRow icon="ribbon-outline" label="Plan" value={planLabel[plan] ?? plan} last t={t} />
          </TouchableOpacity>
        </View>

        {/* Uygulama */}
        <Text style={[styles.sectionLabel, { color: t.textMuted }]}>UYGULAMA</Text>
        <View style={[styles.card, { backgroundColor: t.card }]}>
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
            Her Pro'ya geçen davetinde{" "}
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
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
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
});
