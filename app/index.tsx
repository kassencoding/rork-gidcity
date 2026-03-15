import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ActivityIndicator, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useAppState } from "@/contexts/AppStateContext";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const { hasSeenWelcome, setHasSeenWelcome, isLoaded } = useAppState();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isLoaded) return;

    if (hasSeenWelcome) {
      const timer = setTimeout(() => {
        router.replace("/main" as any);
      }, 100);
      return () => clearTimeout(timer);
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const navigateTimer = setTimeout(() => {
      setHasSeenWelcome(true);
      router.replace("/main" as any);
    }, 2500);

    return () => clearTimeout(navigateTimer);
  }, [hasSeenWelcome, isLoaded, router, fadeAnim, setHasSeenWelcome]);

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/splash.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
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
  backgroundImage: {
    width: width,
    height: height,
    position: "absolute" as const,
    top: 0,
    left: 0,
  },
  loaderContainer: {
    position: "absolute" as const,
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center" as const,
  },
});
