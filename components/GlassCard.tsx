import React, { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useAppState } from "@/contexts/AppStateContext";

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  neonColor?: string;
  solidBackground?: string;
}

export function GlassCard({ children, style, neonColor, solidBackground }: GlassCardProps) {
  const { glassOpacity } = useAppState();
  
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: solidBackground || `rgba(255, 255, 255, ${glassOpacity})` },
        neonColor && { borderColor: neonColor + "40" },
        style,
      ]}
    >
      <View style={styles.glassOverlay} />
      <View style={styles.highlightTop} />
      <View style={styles.contentWrapper}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    overflow: "hidden",
    position: "relative" as const,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  glassOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 26,
  },
  highlightTop: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  contentWrapper: {
    position: "relative" as const,
    zIndex: 1,
  },
});
