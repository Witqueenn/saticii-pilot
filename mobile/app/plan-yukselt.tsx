import { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/lib/theme";

const PLANS = [
  {
    id: "temel",
    name: "Temel",
    price: 0,
    label: "Sonsuza kadar ücretsiz",
    highlight: false,
    badge: null as string | null,
    color: "#6b7280",
    features: [
      "Trendyol bağlantısı",
      "Yorum merkezi (50 yorum/ay)",
      "İade takibi",
      "Temel ürün yönetimi",
      "E-posta desteği",
    ],
  },
  {
    id: "profesyonel",
    name: "Pro",
    price: 799,
    label: "ay",
    highlight: true,
    badge: "En Popüler",
    color: "#f97316",
    features: [
      "Temel planın her şeyi",
      "Sınırsız yorum yönetimi",
      "AI yorum yanıtlama",
      "Rakip fiyat & yorum analizi",
      "Haftalık e-posta raporu",
      "Müşteri takibi & QR form",
      "Tüm pazaryeri bağlantıları",
      "Öncelikli destek",
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    price: 1999,
    label: "ay",
    highlight: false,
    badge: "Tam Güç",
    color: "#6366f1",
    features: [
      "Pro planın her şeyi",
      "Kampanya planlayıcı",
      "E-posta & SMS kampanyası",
      "Otomasyon & AI içerik",
      "Çoklu mağaza yönetimi",
      "API erişimi",
      "Dedike hesap yöneticisi",
    ],
  },
];

export default function PlanYukseltScreen() {
  const t = useTheme();
  const [selected, setSelected] = useState("profesyonel");

  function handleUpgrade(planId: string) {
    if (planId === "marketing") {
      Linking.openURL("mailto:satis@saticipilot.com?subject=Marketing Plan");
    } else {
      Linking.openURL(`https://saticipilot.com/kayit?plan=${planId}`);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.text }]}>Plan Seç</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: t.text }]}>Mağazana uygun planı seç</Text>
        <Text style={[styles.subtitle, { color: t.textSub }]}>
          14 gün ücretsiz dene · kredi kartı gerekmez
        </Text>

        {PLANS.map((plan) => {
          const isSelected = selected === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              onPress={() => setSelected(plan.id)}
              style={[
                styles.planCard,
                { backgroundColor: t.card, borderColor: isSelected ? plan.color : t.border },
                isSelected && { shadowColor: plan.color, shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
              ]}
            >
              {plan.badge && (
                <View style={[styles.badge, { backgroundColor: plan.color }]}>
                  <Text style={styles.badgeText}>{plan.badge}</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View>
                  <Text style={[styles.planName, { color: t.text }]}>{plan.name}</Text>
                  {plan.price === 0 ? (
                    <View style={styles.priceRow}>
                      <Text style={[styles.priceMain, { color: t.text }]}>Ücretsiz</Text>
                    </View>
                  ) : (
                    <View style={styles.priceRow}>
                      <Text style={[styles.priceMain, { color: t.text }]}>₺{plan.price.toLocaleString("tr-TR")}</Text>
                      <Text style={[styles.pricePer, { color: t.textMuted }]}>/{plan.label}</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.radio, { borderColor: isSelected ? plan.color : t.borderStrong }]}>
                  {isSelected && <View style={[styles.radioDot, { backgroundColor: plan.color }]} />}
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: t.border }]} />

              <View style={styles.featureList}>
                {plan.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#22c55e" style={styles.featureIcon} />
                    <Text style={[styles.featureText, { color: t.textSub }]}>{f}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Upgrade CTA */}
        {(() => {
          const plan = PLANS.find((p) => p.id === selected)!;
          const isMarketing = selected === "marketing";
          const isFree = selected === "temel";
          return (
            <TouchableOpacity
              style={[styles.ctaBtn, { backgroundColor: isFree ? t.card : plan.color, borderWidth: isFree ? 1 : 0, borderColor: t.border }]}
              onPress={() => handleUpgrade(selected)}
            >
              <Text style={[styles.ctaText, { color: isFree ? t.text : "#fff" }]}>
                {isFree ? "Ücretsiz Başla" : isMarketing ? "Satış Ekibiyle Görüş" : `${plan.name} Planı Seç`}
              </Text>
              <Ionicons name="arrow-forward" size={18} color={isFree ? t.text : "#fff"} />
            </TouchableOpacity>
          );
        })()}

        <Text style={[styles.note, { color: t.textMuted }]}>
          Ödeme ve plan yönetimi web tarayıcınızda açılır.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  container: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  planCard: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 20,
    marginBottom: 16,
    position: "relative",
    overflow: "visible",
  },
  badge: {
    position: "absolute",
    top: -12,
    alignSelf: "center",
    left: "50%",
    transform: [{ translateX: -40 }],
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  planHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 4 },
  planName: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  priceMain: { fontSize: 28, fontWeight: "900" },
  pricePer: { fontSize: 13 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  divider: { height: 1, marginVertical: 16 },
  featureList: { gap: 10 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureIcon: { flexShrink: 0 },
  featureText: { fontSize: 14, flex: 1 },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#f97316",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  ctaText: { fontSize: 16, fontWeight: "700" },
  note: { fontSize: 12, textAlign: "center" },
});
