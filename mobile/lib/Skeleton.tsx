import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";

export function Skeleton({ width, height, style }: { width: number | string; height: number; style?: ViewStyle }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[styles.base, { width: width as number, height, opacity: anim }, style]}
    />
  );
}

export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.row}>
        <Skeleton width={80} height={12} style={{ borderRadius: 6 }} />
        <Skeleton width={50} height={20} style={{ borderRadius: 10 }} />
      </View>
      <Skeleton width="90%" height={12} style={{ borderRadius: 6, marginTop: 10 }} />
      <Skeleton width="70%" height={12} style={{ borderRadius: 6, marginTop: 6 }} />
      <Skeleton width={80} height={10} style={{ borderRadius: 5, marginTop: 10 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: "#e5e7eb" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
