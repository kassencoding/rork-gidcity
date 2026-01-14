import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAppState } from "@/contexts/AppStateContext";
import { commonColors } from "@/constants/colors";

export default function WelcomeScreen() {
  const router = useRouter();
  const { hasSeenWelcome, setHasSeenWelcome, currentTheme, t, isLoaded } = useAppState();
  const [showKazakh, setShowKazakh] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isLoaded) return;

    if (hasSeenWelcome) {
      const timer = setTimeout(() => {
        router.replace("/main" as any);
      }, 100);
      return () => clearTimeout(timer);
    }

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        delay: 1500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowKazakh(false);
      
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          delay: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setHasSeenWelcome(true);
        setTimeout(() => {
          router.replace("/main" as any);
        }, 100);
      });
    });

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
  }, [hasSeenWelcome, isLoaded, router, fadeAnim, glowAnim, setHasSeenWelcome]);

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0a0015', '#1a0b2e', '#2d1b4e']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>
    );
  }

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0015', '#1a0b2e', '#2d1b4e']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Animated.Text
            style={[
              styles.welcomeText,
              {
                color: currentTheme.neon,
                textShadowColor: currentTheme.neon,
                opacity: glowOpacity,
              },
            ]}
          >
            {showKazakh ? t.welcome1 : t.welcome2}
          </Animated.Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: "800" as const,
    textAlign: "center",
    color: commonColors.textPrimary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
    letterSpacing: -0.5,
  },
});
