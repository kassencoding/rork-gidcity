import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Text,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LucideIcon } from "lucide-react-native";

interface ChromaticGlassCardProps {
  title: string;
  description: string;
  onPress?: () => void;
  style?: ViewStyle;
  iconSet?: Array<{
    icon: LucideIcon;
    color: string;
  }>;
  crystallineType?: "city" | "order" | "booking";
}

export function ChromaticGlassCard({
  title,
  description,
  onPress,
  style,
  iconSet,
  crystallineType = "city",
}: ChromaticGlassCardProps) {
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

  const renderCrystallineContent = () => {
    switch (crystallineType) {
      case "city":
        return (
          <View style={styles.crystallineContainer}>
            <View style={[styles.crystalBuilding, { height: 30, left: 10 }]}>
              <LinearGradient
                colors={["rgba(64, 224, 208, 0.6)", "rgba(138, 43, 226, 0.3)"]}
                style={StyleSheet.absoluteFill}
              />
            </View>
            <View style={[styles.crystalBuilding, { height: 45, left: 30 }]}>
              <LinearGradient
                colors={["rgba(255, 140, 0, 0.5)", "rgba(255, 0, 128, 0.3)"]}
                style={StyleSheet.absoluteFill}
              />
            </View>
            <View style={[styles.crystalBuilding, { height: 35, left: 55 }]}>
              <LinearGradient
                colors={["rgba(138, 43, 226, 0.6)", "rgba(64, 224, 208, 0.3)"]}
                style={StyleSheet.absoluteFill}
              />
            </View>
            <View style={[styles.crystalBuilding, { height: 40, left: 75 }]}>
              <LinearGradient
                colors={["rgba(64, 224, 208, 0.5)", "rgba(255, 140, 0, 0.3)"]}
                style={StyleSheet.absoluteFill}
              />
            </View>
          </View>
        );
      case "order":
        return (
          <View style={styles.crystallineContainer}>
            <View style={styles.crystalItem}>
              <LinearGradient
                colors={["rgba(255, 193, 7, 0.6)", "rgba(255, 87, 34, 0.3)"]}
                style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
              />
            </View>
            <View style={[styles.crystalItem, { left: 30, top: 15, width: 28, height: 28 }]}>
              <LinearGradient
                colors={["rgba(33, 150, 243, 0.5)", "rgba(0, 188, 212, 0.3)"]}
                style={[StyleSheet.absoluteFill, { borderRadius: 6 }]}
              />
            </View>
            <View style={[styles.crystalItem, { left: 55, top: 8, width: 24, height: 24 }]}>
              <LinearGradient
                colors={["rgba(76, 175, 80, 0.5)", "rgba(139, 195, 74, 0.3)"]}
                style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
              />
            </View>
            <View style={[styles.crystalItem, { left: 75, top: 18, width: 22, height: 22 }]}>
              <LinearGradient
                colors={["rgba(156, 39, 176, 0.5)", "rgba(233, 30, 99, 0.3)"]}
                style={[StyleSheet.absoluteFill, { borderRadius: 4 }]}
              />
            </View>
          </View>
        );
      case "booking":
        return (
          <View style={styles.crystallineContainer}>
            <View style={[styles.crystalItem, { width: 32, height: 32, borderRadius: 16 }]}>
              <LinearGradient
                colors={["rgba(255, 215, 0, 0.6)", "rgba(255, 140, 0, 0.3)"]}
                style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
              />
            </View>
            <View style={[styles.crystalItem, { left: 35, top: 10, width: 26, height: 26, borderRadius: 4 }]}>
              <LinearGradient
                colors={["rgba(64, 224, 208, 0.5)", "rgba(30, 144, 255, 0.3)"]}
                style={[StyleSheet.absoluteFill, { borderRadius: 4 }]}
              />
            </View>
            <View style={[styles.crystalPlaque, { left: 60 }]}>
              <Text style={styles.plaqueText}>RESERVED</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={style}
    >
      <Animated.View
        style={[
          styles.container,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(255, 0, 128, 0.8)",
            "rgba(255, 140, 0, 0.8)",
            "rgba(64, 224, 208, 0.8)",
            "rgba(138, 43, 226, 0.8)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.chromaticBorder}
        />

        <View style={styles.innerContainer}>
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0.15)",
              "rgba(255, 255, 255, 0.05)",
              "rgba(255, 255, 255, 0.02)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.highlightTop} />

          <View style={styles.contentRow}>
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                {description}
              </Text>
            </View>

            <View style={styles.crystallineWrapper}>
              {renderCrystallineContent()}
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
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
  innerContainer: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(20, 10, 40, 0.6)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  highlightTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  contentRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.95)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  description: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.55)",
    lineHeight: 16,
  },
  crystallineWrapper: {
    width: 100,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  crystallineContainer: {
    width: 100,
    height: 50,
    position: "relative",
  },
  crystalBuilding: {
    position: "absolute",
    bottom: 0,
    width: 18,
    borderRadius: 3,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  crystalItem: {
    position: "absolute",
    width: 32,
    height: 32,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  crystalPlaque: {
    position: "absolute",
    top: 15,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  plaqueText: {
    fontSize: 7,
    fontWeight: "700",
    color: "rgba(255, 215, 0, 0.9)",
    letterSpacing: 0.5,
  },
});
