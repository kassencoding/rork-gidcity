import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

interface Ring {
  id: number;
  scale: Animated.Value;
  opacity: Animated.Value;
  size: number;
  x: number;
  y: number;
}

interface AnimatedRingsProps {
  color: string;
}

export function AnimatedRings({ color }: AnimatedRingsProps) {
  const rings = useRef<Ring[]>([]);

  useEffect(() => {
    rings.current = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      scale: new Animated.Value(0.5),
      opacity: new Animated.Value(0.4),
      size: Math.random() * 100 + 80,
      x: Math.random() * width,
      y: Math.random() * height,
    }));

    rings.current.forEach((ring) => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(ring.scale, {
              toValue: 1.5,
              duration: Math.random() * 3000 + 4000,
              useNativeDriver: true,
            }),
            Animated.timing(ring.scale, {
              toValue: 0.5,
              duration: Math.random() * 3000 + 4000,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(ring.opacity, {
              toValue: 0,
              duration: Math.random() * 3000 + 4000,
              useNativeDriver: true,
            }),
            Animated.timing(ring.opacity, {
              toValue: 0.4,
              duration: Math.random() * 3000 + 4000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {rings.current.map((ring) => (
        <Animated.View
          key={ring.id}
          style={[
            styles.ring,
            {
              left: ring.x,
              top: ring.y,
              width: ring.size,
              height: ring.size,
              borderRadius: ring.size / 2,
              borderColor: color,
              opacity: ring.opacity,
              transform: [{ scale: ring.scale }],
            },
          ]}
        />
      ))}
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
  },
  ring: {
    position: "absolute",
    borderWidth: 2,
  },
});
