import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface AnimatedGradientFlowProps {
  color: string;
}

export function AnimatedGradientFlow({ color }: AnimatedGradientFlowProps) {
  const translateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [translateAnim, opacityAnim]);

  const translateY = translateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.gradientContainer,
          {
            transform: [{ translateY }],
            opacity: opacityAnim,
          },
        ]}
      >
        <LinearGradient
          colors={[color + "00", color + "40", color + "00"]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.gradientContainer,
          {
            transform: [{ translateY: Animated.multiply(translateAnim, -80) }],
            opacity: opacityAnim,
          },
        ]}
      >
        <LinearGradient
          colors={[color + "00", color + "30", color + "00"]}
          style={styles.gradient}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  gradientContainer: {
    position: "absolute",
    top: -100,
    left: 0,
    right: 0,
    height: 400,
  },
  gradient: {
    width: "100%",
    height: "100%",
  },
});
