import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

interface AnimatedWavesProps {
  color: string;
}

export function AnimatedWaves({ color }: AnimatedWavesProps) {
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(wave1, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(wave2, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(wave3, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: true,
      })
    ).start();
  }, [wave1, wave2, wave3]);

  const translateX1 = wave1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width],
  });

  const translateX2 = wave2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width],
  });

  const translateX3 = wave3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.wave,
          {
            backgroundColor: color,
            opacity: 0.25,
            transform: [{ translateX: translateX1 }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.wave,
          {
            backgroundColor: color,
            opacity: 0.3,
            transform: [{ translateX: translateX2 }],
            top: 100,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.wave,
          {
            backgroundColor: color,
            opacity: 0.25,
            transform: [{ translateX: translateX3 }],
            top: 200,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  wave: {
    position: "absolute",
    width: width * 2,
    height: 150,
    borderRadius: 150,
  },
});
