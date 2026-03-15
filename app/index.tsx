import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useAppState } from "@/contexts/AppStateContext";
import { Image } from "expo-image";

export default function WelcomeScreen() {
  const router = useRouter();
  const { hasSeenWelcome, setHasSeenWelcome, isLoaded } = useAppState();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [_imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (hasSeenWelcome) {
      const timer = setTimeout(() => {
        router.replace("/main" as any);
      }, 50);
      return () => clearTimeout(timer);
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    const navigateTimer = setTimeout(() => {
      setHasSeenWelcome(true);
      router.replace("/main" as any);
    }, 2000);

    return () => clearTimeout(navigateTimer);
  }, [hasSeenWelcome, isLoaded, router, fadeAnim, setHasSeenWelcome]);

  return (
    <View style={styles.container}>
      <Image
        source={Platform.OS === "web"
          ? require("@/assets/images/splash.png")
          : require("@/assets/images/splash.png")
        }
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        priority="high"
        onLoad={() => setImageLoaded(true)}
      />
      <Animated.View style={[styles.loaderContainer, { opacity: fadeAnim }]}>
        <ActivityIndicator size="large" color="#5bbde8" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1628",
  },
  loaderContainer: {
    position: "absolute" as const,
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center" as const,
  },
});
