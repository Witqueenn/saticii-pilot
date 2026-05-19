import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";

interface Result {
  id: string;
  type: "review" | "return" | "product";
  title: string;
  subtitle: string;
  meta?: string;
}

const TYPE_CONFIG = {
  review: { icon: "chatbubble-outline" as const, label: "Yorum", color: "#3b82f6" },
  return: { icon: "cube-outline" as const, label: "İade", color: "#f97316" },
  product: { icon: "pricetag-outline" as const, label: "Ürün", color: "#8b5cf6" },
};

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SearchModal({ visible, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [visible]);

  useEffect(() => {
    clearTimeout(timer.current);
    if (!query.trim() || query.length < 2) { setResults([]); return; }
    timer.current = setTimeout(() => search(query), 350);
    return () => clearTimeout(timer.current);
  }, [query]);

  async function search(q: string) {
    setSearching(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [rRes, retRes, pRes] = await Promise.all([
      supabase.from("reviews").select("id, comment, product_name, rating, status")
        .eq("seller_id", user.id).ilike("comment", `%${q}%`).limit(5),
      supabase.from("returns").select("id, product_name, reason, status")
        .eq("seller_id", user.id).ilike("product_name", `%${q}%`).limit(5),
      supabase.from("products").select("id, name, sku, stock")
        .eq("seller_id", user.id).ilike("name", `%${q}%`).limit(5),
    ]);

    const all: Result[] = [
      ...(rRes.data ?? []).map((r) => ({
        id: r.id, type: "review" as const,
        title: r.product_name, subtitle: r.comment,
        meta: `${r.rating}★ · ${r.status}`,
      })),
      ...(retRes.data ?? []).map((r) => ({
        id: r.id, type: "return" as const,
        title: r.product_name, subtitle: r.reason,
        meta: r.status,
      })),
      ...(pRes.data ?? []).map((p) => ({
        id: p.id, type: "product" as const,
        title: p.name, subtitle: p.sku,
        meta: `Stok: ${p.stock}`,
      })),
    ];

    setResults(all);
    setSearching(false);
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container} edges={["top"]}>
          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#9ca3af" />
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="Yorum, iade veya ürün ara..."
              placeholderTextColor="#9ca3af"
              returnKeyType="search"
            />
            {searching && <ActivityIndicator size="small" color="#9ca3af" />}
            <TouchableOpacity onPress={() => { Haptics.selectionAsync(); onClose(); }} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>İptal</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={results}
            keyExtractor={(r) => `${r.type}-${r.id}`}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item: r }) => {
              const cfg = TYPE_CONFIG[r.type];
              return (
                <TouchableOpacity style={styles.result} onPress={() => { Haptics.selectionAsync(); onClose(); }}>
                  <View style={[styles.resultIcon, { backgroundColor: cfg.color + "18" }]}>
                    <Ionicons name={cfg.icon} size={16} color={cfg.color} />
                  </View>
                  <View style={styles.resultBody}>
                    <View style={styles.resultTop}>
                      <Text style={styles.resultTitle} numberOfLines={1}>{r.title}</Text>
                      <View style={[styles.typeBadge, { backgroundColor: cfg.color + "18" }]}>
                        <Text style={[styles.typeBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.resultSub} numberOfLines={1}>{r.subtitle}</Text>
                    {r.meta && <Text style={styles.resultMeta}>{r.meta}</Text>}
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              query.length >= 2 && !searching ? (
                <View style={styles.empty}>
                  <Ionicons name="search" size={40} color="#e5e7eb" />
                  <Text style={styles.emptyText}>Sonuç bulunamadı</Text>
                </View>
              ) : query.length < 2 ? (
                <View style={styles.empty}>
                  <Ionicons name="flash-outline" size={40} color="#e5e7eb" />
                  <Text style={styles.emptyText}>En az 2 karakter yaz</Text>
                </View>
              ) : null
            }
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  container: { flex: 1, backgroundColor: "#fff", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6", backgroundColor: "#fff" },
  input: { flex: 1, fontSize: 16, color: "#111827", paddingVertical: 0 },
  cancelBtn: { paddingLeft: 4 },
  cancelText: { fontSize: 15, color: "#f97316", fontWeight: "600" },
  list: { padding: 12, gap: 8 },
  result: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#f9fafb", borderRadius: 14, padding: 12 },
  resultIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  resultBody: { flex: 1 },
  resultTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 2 },
  resultTitle: { flex: 1, fontSize: 14, fontWeight: "700", color: "#111827" },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  typeBadgeText: { fontSize: 10, fontWeight: "700" },
  resultSub: { fontSize: 12, color: "#6b7280" },
  resultMeta: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  empty: { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 14, color: "#9ca3af" },
});
