import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

interface Line {
  id: number;
  x: Animated.Value;
  y: number;
  length: number;
  opacity: Animated.Value;
}

interface AnimatedLinesProps {
  color: string;
}

export function AnimatedLines({ color }: AnimatedLinesProps) {
  const lines = useRef<Line[]>([]);

  useEffect(() => {
    lines.current = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: new Animated.Value(-200),
      y: Math.random() * height,
      length: Math.random() * 150 + 50,
      opacity: new Animated.Value(Math.random() * 0.5 + 0.2),
    }));

    lines.current.forEach((line) => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(line.x, {
            toValue: width + 200,
            duration: Math.random() * 8000 + 12000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(line.opacity, {
              toValue: Math.random() * 0.6 + 0.3,
              duration: Math.random() * 2000 + 1500,
              useNativeDriver: true,
            }),
            Animated.timing(line.opacity, {
              toValue: Math.random() * 0.3 + 0.1,
              duration: Math.random() * 2000 + 1500,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {lines.current.map((line) => (
        <Animated.View
          key={line.id}
          style={[
            styles.line,
            {
              top: line.y,
              width: line.length,
              height: 2,
              backgroundColor: color,
              opacity: line.opacity,
              transform: [{ translateX: line.x }],
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
  line: {
    position: "absolute",
  },
});
