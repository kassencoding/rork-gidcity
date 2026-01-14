import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

interface Sparkle {
  id: number;
  x: number;
  y: Animated.Value;
  size: number;
  opacity: Animated.Value;
  rotation: Animated.Value;
}

interface AnimatedSparklesProps {
  color: string;
}

export function AnimatedSparkles({ color }: AnimatedSparklesProps) {
  const sparkles = useRef<Sparkle[]>([]);

  useEffect(() => {
    sparkles.current = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: new Animated.Value(height + 50),
      size: Math.random() * 8 + 4,
      opacity: new Animated.Value(0),
      rotation: new Animated.Value(0),
    }));

    sparkles.current.forEach((sparkle) => {
      const animate = () => {
        sparkle.y.setValue(height + 50);
        sparkle.opacity.setValue(0);
        sparkle.rotation.setValue(0);

        Animated.parallel([
          Animated.timing(sparkle.y, {
            toValue: -50,
            duration: Math.random() * 5000 + 8000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(sparkle.opacity, {
              toValue: Math.random() * 0.5 + 0.3,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(sparkle.opacity, {
              toValue: 0,
              duration: 1000,
              delay: Math.random() * 5000 + 3000,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(sparkle.rotation, {
            toValue: 1,
            duration: Math.random() * 3000 + 3000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setTimeout(() => animate(), Math.random() * 3000);
        });
      };

      setTimeout(() => animate(), Math.random() * 5000);
    });
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {sparkles.current.map((sparkle) => {
        const rotation = sparkle.rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        });

        return (
          <Animated.View
            key={sparkle.id}
            style={[
              styles.sparkle,
              {
                left: sparkle.x,
                width: sparkle.size,
                height: sparkle.size,
                backgroundColor: color,
                opacity: sparkle.opacity,
                transform: [{ translateY: sparkle.y }, { rotate: rotation }],
              },
            ]}
          />
        );
      })}
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
  sparkle: {
    position: "absolute",
    borderRadius: 2,
  },
});
