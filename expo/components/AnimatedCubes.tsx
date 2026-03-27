import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

interface Cube {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: Animated.Value;
  opacity: number;
}

interface AnimatedCubesProps {
  color: string;
}

export function AnimatedCubes({ color }: AnimatedCubesProps) {
  const cubes = useRef<Cube[]>([]);

  useEffect(() => {
    cubes.current = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 30 + 20,
      rotation: new Animated.Value(0),
      opacity: Math.random() * 0.3 + 0.15,
    }));

    cubes.current.forEach((cube) => {
      Animated.loop(
        Animated.timing(cube.rotation, {
          toValue: 1,
          duration: Math.random() * 10000 + 15000,
          useNativeDriver: true,
        })
      ).start();
    });
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {cubes.current.map((cube) => {
        const rotation = cube.rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        });

        return (
          <Animated.View
            key={cube.id}
            style={[
              styles.cube,
              {
                left: cube.x,
                top: cube.y,
                width: cube.size,
                height: cube.size,
                backgroundColor: color,
                opacity: cube.opacity,
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
  cube: {
    position: "absolute",
    borderRadius: 8,
  },
});
