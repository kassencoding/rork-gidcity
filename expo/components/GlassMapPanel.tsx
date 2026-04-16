import React, { useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Animated, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, ChevronRight } from "lucide-react-native";

interface GlassMapPanelProps {
  onPress: () => void;
}

export function GlassMapPanel({ onPress }: GlassMapPanelProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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
          styles.panelContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(64, 224, 208, 0.6)",
            "rgba(138, 43, 226, 0.6)",
            "rgba(255, 0, 128, 0.4)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.chromaticBorder}
        />

        <View style={styles.innerPanel}>
          <LinearGradient
            colors={[
              "rgba(20, 10, 40, 0.8)",
              "rgba(10, 5, 25, 0.9)",
            ]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.mapGrid}>
            <View style={styles.gridLineH1} />
            <View style={styles.gridLineH2} />
            <View style={styles.gridLineV1} />
            <View style={styles.gridLineV2} />
            <View style={styles.gridIntersection1} />
            <View style={styles.gridIntersection2} />
            <View style={styles.gridIntersection3} />
            <View style={styles.gridIntersection4} />
          </View>

          <View style={styles.glassOverlay}>
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0.1)",
                "rgba(255, 255, 255, 0.02)",
              ]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <View style={styles.mapIconContainer}>
              <View style={styles.iconGlow}>
                <LinearGradient
                  colors={["rgba(64, 224, 208, 0.8)", "rgba(138, 43, 226, 0.6)"]}
                  style={StyleSheet.absoluteFill}
                  borderRadius={30}
                />
              </View>
              <MapPin size={24} color="rgba(255, 255, 255, 0.95)" strokeWidth={2} />
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0.15)",
              "rgba(255, 255, 255, 0.05)",
            ]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.7, y: 1 }}
          />
          <View style={styles.buttonHighlight} />
          <Text style={styles.buttonText}>Открыть карту</Text>
          <ChevronRight size={16} color="rgba(255, 255, 255, 0.7)" />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  panelContainer: {
    height: 160,
    borderRadius: 20,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  chromaticBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  innerPanel: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
  },
  mapGrid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLineH1: {
    position: "absolute",
    top: "33%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(64, 224, 208, 0.3)",
  },
  gridLineH2: {
    position: "absolute",
    top: "66%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(138, 43, 226, 0.3)",
  },
  gridLineV1: {
    position: "absolute",
    left: "33%",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(255, 0, 128, 0.25)",
  },
  gridLineV2: {
    position: "absolute",
    left: "66%",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(255, 140, 0, 0.25)",
  },
  gridIntersection1: {
    position: "absolute",
    top: "33%",
    left: "33%",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(64, 224, 208, 0.6)",
    transform: [{ translateX: -2.5 }, { translateY: -2.5 }],
  },
  gridIntersection2: {
    position: "absolute",
    top: "33%",
    left: "66%",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 0, 128, 0.5)",
    transform: [{ translateX: -2.5 }, { translateY: -2.5 }],
  },
  gridIntersection3: {
    position: "absolute",
    top: "66%",
    left: "33%",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 140, 0, 0.5)",
    transform: [{ translateX: -2.5 }, { translateY: -2.5 }],
  },
  gridIntersection4: {
    position: "absolute",
    top: "66%",
    left: "66%",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(138, 43, 226, 0.5)",
    transform: [{ translateX: -2.5 }, { translateY: -2.5 }],
  },
  glassOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 40,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  mapIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  iconGlow: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.6,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 44,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  buttonHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    letterSpacing: 0.3,
  },
});
