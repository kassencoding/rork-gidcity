import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

interface AnimatedGradientFlowProps {
  color: string;
}

export function AnimatedGradientFlow({ color }: AnimatedGradientFlowProps) {
  const flow1 = useRef(new Animated.Value(0)).current;
  const flow2 = useRef(new Animated.Value(0)).current;
  const flow3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(flow1, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(flow2, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(flow3, {
        toValue: 1,
        duration: 25000,
        useNativeDriver: true,
      })
    ).start();
  }, [flow1, flow2, flow3]);

  const translateX1 = flow1.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const translateY1 = flow1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.5],
  });

  const translateX2 = flow2.interpolate({
    inputRange: [0, 1],
    outputRange: [width, -width],
  });

  const translateY2 = flow2.interpolate({
    inputRange: [0, 1],
    outputRange: [height * 0.3, height * 0.8],
  });

  const translateX3 = flow3.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.5, width * 1.5],
  });

  const translateY3 = flow3.interpolate({
    inputRange: [0, 1],
    outputRange: [height * 0.6, height * 0.2],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.flowBlob,
          {
            backgroundColor: color,
            opacity: 0.2,
            transform: [{ translateX: translateX1 }, { translateY: translateY1 }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.flowBlob,
          {
            backgroundColor: color,
            opacity: 0.15,
            width: 250,
            height: 250,
            borderRadius: 125,
            transform: [{ translateX: translateX2 }, { translateY: translateY2 }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.flowBlob,
          {
            backgroundColor: color,
            opacity: 0.25,
            width: 180,
            height: 180,
            borderRadius: 90,
            transform: [{ translateX: translateX3 }, { translateY: translateY3 }],
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
  flowBlob: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
  },
});
