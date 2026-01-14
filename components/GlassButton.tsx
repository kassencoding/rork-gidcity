import React, { useRef } from "react";
import { StyleSheet, TouchableOpacity, Text, ViewStyle, TextStyle, View, Animated } from "react-native";
import { commonColors } from "@/constants/colors";
import { useAppState } from "@/contexts/AppStateContext";

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "glass";
  accentColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  buttonColor?: string;
}

export function GlassButton({
  title,
  onPress,
  variant = "glass",
  accentColor = commonColors.white,
  style,
  textStyle,
  disabled = false,
  buttonColor,
}: GlassButtonProps) {
  const { glassOpacity } = useAppState();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };

  if (variant === "primary") {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity 
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={[styles.buttonBase, styles.primaryButtonBase, style]}
          disabled={disabled}
        >
          <View style={[styles.primaryButton, { backgroundColor: `rgba(255, 255, 255, ${glassOpacity + 0.07})` }]}>
            <View style={styles.highlightTop} />
            <Text style={[styles.primaryText, textStyle]}>{title}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === "secondary") {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={[styles.buttonBase, styles.secondaryButton, { backgroundColor: `rgba(255, 255, 255, ${glassOpacity - 0.02})` }, style]}
          disabled={disabled}
        >
          <View style={styles.secondaryInner}>
            <View style={styles.highlightTop} />
            <Text style={[styles.secondaryText, textStyle]}>{title}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[styles.buttonBase, styles.glassButton, { backgroundColor: `rgba(255, 255, 255, ${glassOpacity + 0.02})` }, style]}
        disabled={disabled}
      >
        <View style={styles.glassInner}>
          <View style={styles.highlightTop} />
          <Text style={[styles.glassText, textStyle]}>{title}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: 22,
    overflow: "hidden" as const,
  },
  primaryButtonBase: {
    minHeight: 44,
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 12,
    paddingHorizontal: 20,
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  highlightTop: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  glassButton: {
    minHeight: 44,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  glassInner: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 12,
    paddingHorizontal: 20,
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    minHeight: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  secondaryInner: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 10,
    paddingHorizontal: 16,
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  primaryText: {
    fontSize: 13,
    fontWeight: "600" as const,
    letterSpacing: -0.2,
    color: "rgba(255, 255, 255, 0.95)",
    zIndex: 10,
  },
  glassText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "rgba(255, 255, 255, 0.9)",
    letterSpacing: -0.2,
    zIndex: 10,
  },
  secondaryText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: -0.2,
    zIndex: 10,
  },
});
