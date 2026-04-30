import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DayForecast = {
  date: string;
  dayLabel: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  emoji: string;
  condition: string;
  isOutdoorFriendly: boolean;
};

function getWeatherInfo(code: number): {
  emoji: string;
  condition: string;
  isOutdoorFriendly: boolean;
} {
  if (code === 0)
    return { emoji: "☀️", condition: "Despejado", isOutdoorFriendly: true };
  if (code <= 3)
    return {
      emoji: "⛅",
      condition: "Parcialmente nublado",
      isOutdoorFriendly: true,
    };
  if (code <= 49)
    return { emoji: "🌫️", condition: "Neblina", isOutdoorFriendly: false };
  if (code <= 67)
    return { emoji: "🌧️", condition: "Lluvia", isOutdoorFriendly: false };
  if (code <= 77)
    return { emoji: "❄️", condition: "Nieve", isOutdoorFriendly: false };
  if (code <= 82)
    return {
      emoji: "⛈️",
      condition: "Lluvia intensa",
      isOutdoorFriendly: false,
    };
  return { emoji: "⛈️", condition: "Tormenta", isOutdoorFriendly: false };
}

function getDayLabel(dateStr: string): string {
  const days = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const date = new Date(dateStr + "T12:00:00");
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Hoy";
  if (date.toDateString() === tomorrow.toDateString()) return "Mañana";
  return days[date.getDay()];
}

function getOutdoorSuggestion(forecast: DayForecast[]): string {
  const bestDays = forecast
    .filter((d) => d.isOutdoorFriendly)
    .map((d) => d.dayLabel);

  if (bestDays.length === 0)
    return "Esta semana no hay buenos días para actividades al aire libre. ¡Perfecto para indoor! 🏠";
  if (bestDays.includes("Hoy"))
    return `Hoy es un buen día para salir a entrenar al aire libre ${forecast[0].emoji}`;
  if (bestDays.includes("Mañana"))
    return `Mañana mejora el clima, ideal para actividades outdoor ${forecast[1]?.emoji ?? "☀️"}`;
  return `Los mejores días esta semana son: ${bestDays.slice(0, 3).join(", ")} ☀️`;
}

export default function WeatherScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState<string>("Tu ubicación");

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;

        const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geo[0]?.city) setCity(geo[0].city);

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;
        const res = await fetch(url);
        const data = await res.json();

        const days: DayForecast[] = data.daily.time.map(
          (date: string, i: number) => {
            const code = data.daily.weathercode[i];
            const { emoji, condition, isOutdoorFriendly } =
              getWeatherInfo(code);
            const maxTemp = Math.round(data.daily.temperature_2m_max[i]);
            return {
              date,
              dayLabel: getDayLabel(date),
              maxTemp,
              minTemp: Math.round(data.daily.temperature_2m_min[i]),
              weatherCode: code,
              emoji,
              condition,
              isOutdoorFriendly: isOutdoorFriendly && maxTemp <= 35,
            };
          },
        );

        setForecast(days);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const suggestion =
    forecast.length > 0 ? getOutdoorSuggestion(forecast) : null;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>🌤️ Pronóstico</Text>
          <Text style={styles.headerSub}>{city}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Obteniendo pronóstico...</Text>
        </View>
      ) : forecast.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ fontSize: 48 }}>📡</Text>
          <Text style={styles.emptyTitle}>Sin datos de clima</Text>
          <Text style={styles.emptyText}>
            Activá la ubicación para ver el pronóstico.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {suggestion && (
            <View style={styles.suggestionCard}>
              <Text style={styles.suggestionIcon}>🤖</Text>
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          )}

          {forecast[0] && (
            <View
              style={[
                styles.todayCard,
                {
                  borderColor: forecast[0].isOutdoorFriendly
                    ? "#10B981"
                    : "#F59E0B",
                },
              ]}
            >
              <View style={styles.todayLeft}>
                <Text style={styles.todayLabel}>HOY</Text>
                <Text style={styles.todayEmoji}>{forecast[0].emoji}</Text>
                <Text style={styles.todayCondition}>
                  {forecast[0].condition}
                </Text>
                <View
                  style={[
                    styles.outdoorBadge,
                    {
                      backgroundColor: forecast[0].isOutdoorFriendly
                        ? "#D1FAE5"
                        : "#FEF3C7",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.outdoorBadgeText,
                      {
                        color: forecast[0].isOutdoorFriendly
                          ? "#059669"
                          : "#D97706",
                      },
                    ]}
                  >
                    {forecast[0].isOutdoorFriendly
                      ? "✓ Apto outdoor"
                      : "⚠ Mejor indoor"}
                  </Text>
                </View>
              </View>
              <View style={styles.todayRight}>
                <Text style={styles.todayMax}>{forecast[0].maxTemp}°</Text>
                <Text style={styles.todayMin}>{forecast[0].minTemp}°</Text>
                <Text style={styles.todayMinLabel}>mín</Text>
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>Próximos días</Text>
          {forecast.slice(1).map((day) => (
            <View key={day.date} style={styles.dayRow}>
              <Text style={styles.dayEmoji}>{day.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.dayName}>{day.dayLabel}</Text>
                <Text style={styles.dayCondition}>{day.condition}</Text>
              </View>
              <View
                style={[
                  styles.outdoorDot,
                  {
                    backgroundColor: day.isOutdoorFriendly
                      ? "#10B981"
                      : "#F59E0B",
                  },
                ]}
              />
              <View style={styles.dayTemps}>
                <Text style={styles.dayMax}>{day.maxTemp}°</Text>
                <Text style={styles.dayMin}>{day.minTemp}°</Text>
              </View>
            </View>
          ))}

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.outdoorDot, { backgroundColor: "#10B981" }]}
              />
              <Text style={styles.legendText}>
                Apto para actividades outdoor
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.outdoorDot, { backgroundColor: "#F59E0B" }]}
              />
              <Text style={styles.legendText}>Mejor ir a lugares indoor</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.aiBtn}
            onPress={() => router.push("/ai-chat")}
          >
            <Text style={styles.aiBtnText}>
              🤖 Pedirle al asistente qué hacer
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: { fontSize: 18, fontWeight: "700", color: "#374151" },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  headerSub: { fontSize: 12, color: "#9CA3AF", marginTop: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14, color: "#9CA3AF" },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#374151" },
  emptyText: { fontSize: 14, color: "#9CA3AF", textAlign: "center" },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  suggestionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  suggestionIcon: { fontSize: 20 },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: "500",
    lineHeight: 20,
  },
  todayCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  todayLeft: { flex: 1, gap: 6 },
  todayLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9CA3AF",
    letterSpacing: 1,
  },
  todayEmoji: { fontSize: 48 },
  todayCondition: { fontSize: 16, fontWeight: "700", color: "#111827" },
  outdoorBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  outdoorBadgeText: { fontSize: 12, fontWeight: "700" },
  todayRight: { alignItems: "flex-end", gap: 2 },
  todayMax: {
    fontSize: 52,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 56,
  },
  todayMin: { fontSize: 22, fontWeight: "600", color: "#9CA3AF" },
  todayMinLabel: { fontSize: 11, color: "#9CA3AF" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginTop: 8,
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    gap: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  dayEmoji: { fontSize: 28 },
  dayName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  dayCondition: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  outdoorDot: { width: 10, height: 10, borderRadius: 999 },
  dayTemps: { alignItems: "flex-end" },
  dayMax: { fontSize: 18, fontWeight: "700", color: "#111827" },
  dayMin: { fontSize: 13, color: "#9CA3AF" },
  legend: { gap: 6, marginTop: 4 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendText: { fontSize: 12, color: "#6B7280" },
  aiBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  aiBtnText: { color: "white", fontWeight: "700", fontSize: 15 },
});
