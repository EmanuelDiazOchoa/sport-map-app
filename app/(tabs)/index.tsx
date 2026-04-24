import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomMapView from "../../components/MapView";
import SplashLoader from "../../components/SplashLoader";

type WeatherDay = {
  label: string;
  emoji: string;
  max: number;
  min: number;
  isOutdoor: boolean;
};

type WeatherData = {
  current: { temp: number; condition: string; emoji: string };
  forecast: WeatherDay[];
};

function getWeatherEmoji(code: number) {
  if (code === 0)
    return { emoji: "☀️", condition: "Despejado", isOutdoor: true };
  if (code <= 3) return { emoji: "⛅", condition: "Nublado", isOutdoor: true };
  if (code <= 49)
    return { emoji: "🌫️", condition: "Neblina", isOutdoor: false };
  if (code <= 67) return { emoji: "🌧️", condition: "Lluvia", isOutdoor: false };
  if (code <= 77) return { emoji: "❄️", condition: "Nieve", isOutdoor: false };
  return { emoji: "⛈️", condition: "Tormenta", isOutdoor: false };
}

async function fetchWeatherData(
  lat: number,
  lon: number,
): Promise<WeatherData | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`,
    );
    const data = await res.json();

    const curCode = data.current.weathercode;
    const curInfo = getWeatherEmoji(curCode);

    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const labels = [
      "Hoy",
      "Mañana",
      days[new Date(data.daily.time[2] + "T12:00:00").getDay()],
    ];

    const forecast: WeatherDay[] = [0, 1, 2].map((i) => {
      const info = getWeatherEmoji(data.daily.weathercode[i]);
      const max = Math.round(data.daily.temperature_2m_max[i]);
      return {
        label: labels[i],
        emoji: info.emoji,
        max,
        min: Math.round(data.daily.temperature_2m_min[i]),
        isOutdoor: info.isOutdoor && max <= 35,
      };
    });

    return {
      current: {
        temp: Math.round(data.current.temperature_2m),
        condition: curInfo.condition,
        emoji: curInfo.emoji,
      },
      forecast,
    };
  } catch {
    return null;
  }
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { filter } = useLocalSearchParams();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          const w = await fetchWeatherData(
            loc.coords.latitude,
            loc.coords.longitude,
          );
          setWeatherData(w);
        }
      } catch {}
    })();
  }, []);

  return (
    <View style={styles.container}>
      {!splashDone && <SplashLoader onFinish={() => setSplashDone(true)} />}

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.headerEmoji}>🏟️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>SportMap</Text>
            {weatherData && (
              <Text style={styles.currentWeather}>
                {weatherData.current.emoji} {weatherData.current.temp}°C ·{" "}
                {weatherData.current.condition}
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

        {weatherData && (
          <TouchableOpacity
            style={styles.forecastStrip}
            onPress={() => router.push("/weather")}
            activeOpacity={0.8}
          >
            {weatherData.forecast.map((day, i) => (
              <View
                key={i}
                style={[styles.forecastDay, i < 2 && styles.forecastDayBorder]}
              >
                <Text style={styles.forecastLabel}>{day.label}</Text>
                <Text style={styles.forecastEmoji}>{day.emoji}</Text>
                <Text style={styles.forecastTemps}>
                  <Text style={styles.forecastMax}>{day.max}°</Text>
                  <Text style={styles.forecastMin}> {day.min}°</Text>
                </Text>
                <View
                  style={[
                    styles.outdoorPill,
                    { backgroundColor: day.isOutdoor ? "#D1FAE5" : "#FEF3C7" },
                  ]}
                >
                  <Text
                    style={[
                      styles.outdoorPillText,
                      { color: day.isOutdoor ? "#059669" : "#D97706" },
                    ]}
                  >
                    {day.isOutdoor ? "outdoor" : "indoor"}
                  </Text>
                </View>
              </View>
            ))}
            <View style={styles.forecastArrow}>
              <Text style={styles.forecastArrowText}>›</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <CustomMapView initialFilter={filter as string} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerEmoji: { fontSize: 28 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  currentWeather: {
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
  forecastStrip: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginBottom: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  forecastDay: { flex: 1, alignItems: "center", paddingVertical: 8, gap: 3 },
  forecastDayBorder: { borderRightWidth: 1, borderRightColor: "#E5E7EB" },
  forecastLabel: { fontSize: 11, fontWeight: "700", color: "#6B7280" },
  forecastEmoji: { fontSize: 20 },
  forecastTemps: { fontSize: 13 },
  forecastMax: { fontWeight: "700", color: "#111827" },
  forecastMin: { color: "#9CA3AF" },
  outdoorPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  outdoorPillText: { fontSize: 9, fontWeight: "700" },
  forecastArrow: { paddingHorizontal: 8 },
  forecastArrowText: { fontSize: 20, color: "#9CA3AF", fontWeight: "300" },
});
