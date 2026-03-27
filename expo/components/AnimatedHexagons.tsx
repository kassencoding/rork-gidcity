import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

interface Hexagon {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: Animated.Value;
  rotation: Animated.Value;
}

interface AnimatedHexagonsProps {
  color: string;
}

export function AnimatedHexagons({ color }: AnimatedHexagonsProps) {
  const hexagons = useRef<Hexagon[]>([]);

  useEffect(() => {
    hexagons.current = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 40 + 30,
      opacity: new Animated.Value(Math.random() * 0.3 + 0.15),
      rotation: new Animated.Value(0),
    }));

    hexagons.current.forEach((hexagon) => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(hexagon.opacity, {
              toValue: Math.random() * 0.4 + 0.2,
              duration: Math.random() * 3000 + 3000,
              useNativeDriver: true,
            }),
            Animated.timing(hexagon.opacity, {
              toValue: Math.random() * 0.2 + 0.1,
              duration: Math.random() * 3000 + 3000,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(hexagon.rotation, {
            toValue: 1,
            duration: Math.random() * 15000 + 20000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {hexagons.current.map((hexagon) => {
        const rotation = hexagon.rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        });

        return (
          <Animated.View
            key={hexagon.id}
            style={[
              styles.hexagon,
              {
                left: hexagon.x,
                top: hexagon.y,
                width: hexagon.size,
                height: hexagon.size * 0.87,
                backgroundColor: color,
                opacity: hexagon.opacity,
                transform: [{ rotate: rotation }],
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
  hexagon: {
    position: "absolute",
    borderRadius: 6,
  },
});
