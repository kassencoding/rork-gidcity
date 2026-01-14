import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  size: number;
  opacity: Animated.Value;
}

interface AnimatedParticlesProps {
  color: string;
}

export function AnimatedParticles({ color }: AnimatedParticlesProps) {
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    particles.current = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(Math.random() * height),
      size: Math.random() * 4 + 2,
      opacity: new Animated.Value(Math.random() * 0.5 + 0.3),
    }));

    particles.current.forEach((particle) => {
      const animateParticle = () => {
        Animated.parallel([
          Animated.loop(
            Animated.sequence([
              Animated.timing(particle.x, {
                toValue: Math.random() * width,
                duration: Math.random() * 10000 + 15000,
                useNativeDriver: true,
              }),
              Animated.timing(particle.x, {
                toValue: Math.random() * width,
                duration: Math.random() * 10000 + 15000,
                useNativeDriver: true,
              }),
            ])
          ),
          Animated.loop(
            Animated.sequence([
              Animated.timing(particle.y, {
                toValue: Math.random() * height,
                duration: Math.random() * 12000 + 18000,
                useNativeDriver: true,
              }),
              Animated.timing(particle.y, {
                toValue: Math.random() * height,
                duration: Math.random() * 12000 + 18000,
                useNativeDriver: true,
              }),
            ])
          ),
          Animated.loop(
            Animated.sequence([
              Animated.timing(particle.opacity, {
                toValue: Math.random() * 0.5 + 0.3,
                duration: Math.random() * 3000 + 2000,
                useNativeDriver: true,
              }),
              Animated.timing(particle.opacity, {
                toValue: Math.random() * 0.5 + 0.3,
                duration: Math.random() * 3000 + 2000,
                useNativeDriver: true,
              }),
            ])
          ),
        ]).start();
      };

      animateParticle();
    });
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.current.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              width: particle.size,
              height: particle.size,
              borderRadius: particle.size / 2,
              backgroundColor: color,
              opacity: particle.opacity,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
              ],
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
  particle: {
    position: "absolute",
  },
});
