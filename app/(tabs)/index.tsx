import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomMapView from "../../components/MapView";

type WeatherInfo = {
  temp: number;
  condition: string;
  emoji: string;
};

async function fetchWeather(lat: number, lon: number): Promise<WeatherInfo> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&timezone=auto`,
    );
    const data = await res.json();
    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weathercode;
    let condition = "Despejado",
      emoji = "☀️";
    if (code === 0) {
      condition = "Despejado";
      emoji = "☀️";
    } else if (code <= 3) {
      condition = "Nublado";
      emoji = "⛅";
    } else if (code <= 49) {
      condition = "Neblina";
      emoji = "🌫️";
    } else if (code <= 67) {
      condition = "Lluvia";
      emoji = "🌧️";
    } else if (code <= 77) {
      condition = "Nieve";
      emoji = "❄️";
    } else {
      condition = "Tormenta";
      emoji = "⛈️";
    }
    return { temp, condition, emoji };
  } catch {
    return { temp: 0, condition: "Sin datos", emoji: "🌡️" };
  }
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [weather, setWeather] = useState<WeatherInfo | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          const w = await fetchWeather(
            loc.coords.latitude,
            loc.coords.longitude,
          );
          setWeather(w);
        }
      } catch {}
    })();
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerEmoji}>🏟️</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>SportMap</Text>
          {weather ? (
            <Text style={styles.weatherText}>
              {weather.emoji} {weather.temp}°C · {weather.condition}
            </Text>
          ) : (
            <Text style={styles.headerSub}>
              Encontrá tu lugar para entrenar
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => router.push("/ai-chat")}
          style={styles.aiBtn}
        >
          <Text style={{ fontSize: 20 }}>🤖</Text>
        </TouchableOpacity>
      </View>
      <CustomMapView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  headerEmoji: { fontSize: 28 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  headerSub: { fontSize: 12, color: "#9CA3AF", marginTop: 1 },
  weatherText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
    marginTop: 1,
  },
  aiBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
});
