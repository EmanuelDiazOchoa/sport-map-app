import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type Props = {
  onFinish: () => void;
};

export default function SplashLoader({ onFinish }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const dotLoop = Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(dotAnim1, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim1, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(dotAnim2, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim2, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(dotAnim3, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim3, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    dotLoop.start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        dotLoop.stop();
        onFinish();
      });
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.root}>
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.emoji}>🏟️</Text>
        <Text style={styles.title}>SportMap</Text>
        <Text style={styles.subtitle}>Encontrá tu lugar para entrenar</Text>
        <View style={styles.dots}>
          {[dotAnim1, dotAnim2, dotAnim3].map((anim, i) => (
            <Animated.View key={i} style={[styles.dot, { opacity: anim }]} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  content: { alignItems: "center", gap: 8 },
  emoji: { fontSize: 72, marginBottom: 8 },
  title: { fontSize: 36, fontWeight: "800", color: "#111827" },
  subtitle: { fontSize: 15, color: "#9CA3AF", fontWeight: "500" },
  dots: { flexDirection: "row", gap: 8, marginTop: 24 },
  dot: { width: 8, height: 8, borderRadius: 999, backgroundColor: "#2563EB" },
});
