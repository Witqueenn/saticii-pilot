import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";

const BIOMETRIC_KEY = "biometric_enabled";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const tryBiometric = useCallback(async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "SatıcıPilot'a giriş yap",
      fallbackLabel: "Şifre kullan",
      cancelLabel: "İptal",
    });
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert("Oturum süresi dolmuş", "Lütfen tekrar giriş yapın.");
      }
    }
  }, []);

  useEffect(() => {
    async function checkBiometric() {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const enabled = await AsyncStorage.getItem(BIOMETRIC_KEY);
      if (compatible && enrolled && enabled === "true") {
        setBiometricAvailable(true);
        tryBiometric();
      } else if (compatible && enrolled) {
        setBiometricAvailable(true);
      }
    }
    checkBiometric();
  }, [tryBiometric]);

  async function handleSubmit() {
    if (!email || !password) return;
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          Alert.alert("Hata", error.message);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          const biometric = await LocalAuthentication.hasHardwareAsync();
          const enrolled = await LocalAuthentication.isEnrolledAsync();
          const enabled = await AsyncStorage.getItem(BIOMETRIC_KEY);
          if (biometric && enrolled && enabled !== "true") {
            Alert.alert(
              "Face ID / Touch ID",
              "Bir sonraki girişte biyometrik kimlik doğrulama kullanmak ister misin?",
              [
                { text: "Hayır", style: "cancel" },
                { text: "Evet", onPress: () => AsyncStorage.setItem(BIOMETRIC_KEY, "true") },
              ]
            );
          }
        }
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) Alert.alert("Hata", error.message);
        else Alert.alert("Başarılı", "E-posta adresini doğrula ve giriş yap.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>SP</Text>
          </View>
          <Text style={styles.appName}>SatıcıPilot</Text>
          <Text style={styles.tagline}>AI destekli e-ticaret asistanın</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {mode === "login" ? "Giriş Yap" : "Hesap Oluştur"}
          </Text>

          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@email.com"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={styles.label}>Şifre</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPassword}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>{mode === "login" ? "Giriş Yap" : "Hesap Oluştur"}</Text>
            }
          </TouchableOpacity>

          {/* Biometric button */}
          {mode === "login" && biometricAvailable && (
            <TouchableOpacity style={styles.biometricBtn} onPress={tryBiometric}>
              <Ionicons name="finger-print" size={22} color="#f97316" />
              <Text style={styles.biometricText}>Face ID / Touch ID ile giriş yap</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.switchBtn} onPress={() => setMode(mode === "login" ? "register" : "login")}>
            <Text style={styles.switchText}>
              {mode === "login" ? "Hesabın yok mu? Kayıt ol" : "Zaten hesabın var mı? Giriş yap"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff7f0" },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  logoWrap: { alignItems: "center", marginBottom: 32 },
  logoCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#f97316", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  logoText: { color: "#fff", fontSize: 22, fontWeight: "800" },
  appName: { fontSize: 24, fontWeight: "800", color: "#111827" },
  tagline: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 24, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#111827", backgroundColor: "#f9fafb", marginBottom: 16 },
  passwordWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, backgroundColor: "#f9fafb", marginBottom: 16 },
  passwordInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#111827" },
  eyeBtn: { paddingHorizontal: 14 },
  btn: { backgroundColor: "#f97316", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  biometricBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 14, paddingVertical: 10, borderWidth: 1, borderColor: "#fed7aa", borderRadius: 12, backgroundColor: "#fff7ed" },
  biometricText: { color: "#f97316", fontSize: 14, fontWeight: "600" },
  switchBtn: { marginTop: 16, alignItems: "center" },
  switchText: { fontSize: 13, color: "#f97316", fontWeight: "600" },
});
