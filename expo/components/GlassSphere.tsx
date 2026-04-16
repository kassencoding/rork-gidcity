import React, { useRef, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Animated, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LucideIcon } from "lucide-react-native";

interface GlassSphereProps {
  size?: number;
  icon?: LucideIcon;
  label?: string;
  onPress?: () => void;
  badge?: number;
  textContent?: string;
  textStyle?: any;
}

export function GlassSphere({
  size = 50,
  icon: Icon,
  label,
  onPress,
  badge,
  textContent,
  textStyle,
}: GlassSphereProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
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

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={[styles.container, { width: size, height: size + (label ? 20 : 0) }]}
    >
      <Animated.View
        style={[
          styles.sphereContainer,
          {
            width: size,
            height: size,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(255, 255, 255, 0.25)",
            "rgba(255, 255, 255, 0.05)",
            "rgba(255, 255, 255, 0.02)",
          ]}
          style={[styles.sphereBase, { width: size, height: size, borderRadius: size / 2 }]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
        />
        
        <Animated.View
          style={[
            styles.chromaticRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity: glowOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={[
              "#ff0080",
              "#ff8c00",
              "#40e0d0",
              "#8a2be2",
              "#ff0080",
            ]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        <View
          style={[
            styles.innerGlass,
            {
              width: size - 4,
              height: size - 4,
              borderRadius: (size - 4) / 2,
            },
          ]}
        >
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0.4)",
              "rgba(255, 255, 255, 0.1)",
              "rgba(255, 255, 255, 0.02)",
            ]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.7, y: 1 }}
          />
          
          <View
            style={[
              styles.highlight,
              {
                width: size * 0.35,
                height: size * 0.2,
                top: size * 0.12,
                left: size * 0.18,
              },
            ]}
          />
        </View>

        {Icon && (
          <View style={styles.iconContainer}>
            <Icon
              size={size * 0.35}
              color="rgba(255, 255, 255, 0.95)"
              strokeWidth={1.8}
            />
          </View>
        )}

        {textContent && (
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.sphereText,
                { fontSize: size * 0.28 },
                textStyle,
              ]}
            >
              {textContent}
            </Text>
          </View>
        )}

        {badge !== undefined && badge > 0 && (
          <View style={[styles.badge, { backgroundColor: "#ff4757" }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </Animated.View>

      {label && (
        <Text style={[styles.label, { width: size + 20 }]} numberOfLines={2}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  sphereContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  sphereBase: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  chromaticRing: {
    position: "absolute",
    padding: 2,
  },
  innerGlass: {
    position: "absolute",
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  highlight: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 50,
    transform: [{ rotate: "-20deg" }],
  },
  iconContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  sphereText: {
    color: "#ffffff",
    fontWeight: "800",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.3)",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },
  label: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 6,
    letterSpacing: 0.2,
    lineHeight: 14,
  },
});
