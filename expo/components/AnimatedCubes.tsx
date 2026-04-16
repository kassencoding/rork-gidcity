import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated, View } from "react-native";

interface AnimatedCubesProps {
  color: string;
}

export function AnimatedCubes({ color }: AnimatedCubesProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [rotateAnim, scaleAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.cubeWrapper,
          {
            transform: [{ rotate: rotation }, { scale: scaleAnim }],
          },
        ]}
      >
        <View style={[styles.cube, { borderColor: color }]} />
        <View style={[styles.cubeInner, { borderColor: color }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  cubeWrapper: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  cube: {
    position: "absolute",
    width: 120,
    height: 120,
    borderWidth: 2,
    borderRadius: 12,
    opacity: 0.3,
  },
  cubeInner: {
    position: "absolute",
    width: 80,
    height: 80,
    borderWidth: 2,
    borderRadius: 8,
    opacity: 0.5,
  },
});
