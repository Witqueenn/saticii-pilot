import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";

const STEPS = [
  {
    icon: "storefront" as const,
    title: "Mağazanı tanıyalım",
    subtitle: "Mağaza adını girerek başla",
  },
  {
    icon: "link" as const,
    title: "Pazaryeri bağlantısı",
    subtitle: "Hangi pazaryerinde satış yapıyorsun?",
  },
  {
    icon: "checkmark-circle" as const,
    title: "Hazırsın! 🎉",
    subtitle: "SatıcıPilot kullanmaya başlayabilirsin",
  },
];

const MARKETPLACES = [
  { id: "trendyol", label: "Trendyol", color: "#f27a1a" },
  { id: "hepsiburada", label: "Hepsiburada", color: "#ff6000" },
  { id: "n11", label: "n11", color: "#5c2d91" },
  { id: "amazon", label: "Amazon TR", color: "#ff9900" },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [shopName, setShopName] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("");
  const [saving, setSaving] = useState(false);

  async function next() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      await finish();
    }
  }

  async function finish() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.auth.updateUser({ data: { shop_name: shopName, onboarded: true } });
      await supabase.from("sellers").update({ shop_name: shopName }).eq("id", user.id);
    }
    setSaving(false);
    router.replace("/(tabs)");
  }

  const canNext =
    step === 0 ? shopName.trim().length > 0 :
    step === 1 ? true :
    true;

  const prog = (step + 1) / STEPS.length;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Progress */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${prog * 100}%` }]} />
        </View>

        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconWrap}>
            <Ionicons name={STEPS[step].icon} size={40} color="#f97316" />
          </View>

          <Text style={styles.title}>{STEPS[step].title}</Text>
          <Text style={styles.subtitle}>{STEPS[step].subtitle}</Text>

          {/* Step 0: Shop name */}
          {step === 0 && (
            <TextInput
              style={styles.input}
              value={shopName}
              onChangeText={setShopName}
              placeholder="Mağaza adı"
              placeholderTextColor="#9ca3af"
              autoFocus
              returnKeyType="next"
              onSubmitEditing={canNext ? next : undefined}
            />
          )}

          {/* Step 1: Marketplace */}
          {step === 1 && (
            <View style={styles.marketGrid}>
              {MARKETPLACES.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.marketBtn,
                    selectedMarket === m.id && { borderColor: m.color, backgroundColor: m.color + "12" },
                  ]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedMarket(m.id); }}
                >
                  {selectedMarket === m.id && (
                    <Ionicons name="checkmark-circle" size={16} color={m.color} style={styles.marketCheck} />
                  )}
                  <Text style={[styles.marketLabel, selectedMarket === m.id && { color: m.color, fontWeight: "700" }]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.marketBtn, styles.marketSkip]}
                onPress={() => { setSelectedMarket(""); next(); }}
              >
                <Text style={styles.marketSkipText}>Şimdi değil</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Done */}
          {step === 2 && (
            <View style={styles.doneList}>
              {[
                "Yorum merkezi",
                "İade takibi",
                "Anlık bildirimler",
                "AI destekli yanıt önerileri",
              ].map((f) => (
                <View key={f} style={styles.doneRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#059669" />
                  <Text style={styles.doneText}>{f}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btn, !canNext && styles.btnDisabled]}
            onPress={next}
            disabled={!canNext || saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Text style={styles.btnText}>
                    {step === STEPS.length - 1 ? "Başla" : "Devam Et"}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
            }
          </TouchableOpacity>

          <Text style={styles.stepText}>{step + 1} / {STEPS.length}</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  progressBar: { height: 4, backgroundColor: "#f3f4f6", marginHorizontal: 0 },
  progressFill: { height: 4, backgroundColor: "#f97316", borderRadius: 2 },
  content: { flex: 1, paddingHorizontal: 28, paddingTop: 48 },
  iconWrap: { width: 72, height: 72, borderRadius: 24, backgroundColor: "#fff7ed", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  title: { fontSize: 26, fontWeight: "800", color: "#111827", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#6b7280", marginBottom: 32, lineHeight: 22 },
  input: { backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16, fontSize: 17, color: "#111827" },
  marketGrid: { gap: 10 },
  marketBtn: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16, backgroundColor: "#fff" },
  marketCheck: { marginRight: 8 },
  marketLabel: { fontSize: 15, color: "#374151" },
  marketSkip: { borderStyle: "dashed", borderColor: "#d1d5db" },
  marketSkipText: { fontSize: 14, color: "#9ca3af" },
  doneList: { gap: 14 },
  doneRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  doneText: { fontSize: 15, color: "#374151", fontWeight: "500" },
  footer: { paddingHorizontal: 28, paddingBottom: 16, gap: 12 },
  btn: { backgroundColor: "#f97316", borderRadius: 16, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  stepText: { textAlign: "center", fontSize: 13, color: "#9ca3af" },
});
