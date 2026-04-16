import React, { useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Animated, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LucideIcon } from "lucide-react-native";

interface GlassTabButtonProps {
  title: string;
  icon: LucideIcon;
  isActive: boolean;
  onPress: () => void;
}

export function GlassTabButton({
  title,
  icon: Icon,
  isActive,
  onPress,
}: GlassTabButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.buttonContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {isActive && (
          <LinearGradient
            colors={[
              "#ff0080",
              "#ff8c00",
              "#40e0d0",
              "#8a2be2",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.chromaticBorder}
          />
        )}

        <View
          style={[
            styles.innerButton,
            isActive && styles.innerButtonActive,
          ]}
        >
          <LinearGradient
            colors={
              isActive
                ? [
                    "rgba(255, 255, 255, 0.2)",
                    "rgba(255, 255, 255, 0.08)",
                  ]
                : [
                    "rgba(255, 255, 255, 0.08)",
                    "rgba(255, 255, 255, 0.02)",
                  ]
            }
            style={StyleSheet.absoluteFill}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.7, y: 1 }}
          />

          <View style={styles.highlightTop} />

          <Icon
            size={18}
            color={isActive ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.5)"}
            strokeWidth={isActive ? 2 : 1.5}
          />
          <Text
            style={[
              styles.title,
              isActive && styles.titleActive,
            ]}
          >
            {title}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    borderRadius: 16,
    padding: 2,
    position: "relative",
  },
  chromaticBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  innerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  innerButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#ff0080",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  highlightTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.5)",
    letterSpacing: 0.3,
  },
  titleActive: {
    color: "rgba(255, 255, 255, 0.95)",
    textShadowColor: "rgba(255, 255, 255, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
