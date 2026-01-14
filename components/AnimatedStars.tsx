import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: Animated.Value;
  scale: Animated.Value;
}

interface AnimatedStarsProps {
  color: string;
}

export function AnimatedStars({ color }: AnimatedStarsProps) {
  const stars = useRef<Star[]>([]);

  useEffect(() => {
    stars.current = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 6 + 3,
      opacity: new Animated.Value(0),
      scale: new Animated.Value(1),
    }));

    stars.current.forEach((star) => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(star.opacity, {
              toValue: Math.random() * 0.6 + 0.3,
              duration: Math.random() * 1000 + 800,
              useNativeDriver: true,
            }),
            Animated.timing(star.opacity, {
              toValue: 0,
              duration: Math.random() * 1000 + 800,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(star.scale, {
              toValue: Math.random() * 0.5 + 1.2,
              duration: Math.random() * 1000 + 800,
              useNativeDriver: true,
            }),
            Animated.timing(star.scale, {
              toValue: 1,
              duration: Math.random() * 1000 + 800,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {stars.current.map((star) => (
        <Animated.View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              backgroundColor: color,
              opacity: star.opacity,
              transform: [{ scale: star.scale }],
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
  star: {
    position: "absolute",
    borderRadius: 3,
  },
});
