import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MARKER_CONFIG } from "../../components/MapView";
import { useAuth } from "../../hooks/useAuth";
import { createBooking } from "../../services/bookings";

const TIME_SLOTS = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];

function getNext7Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function formatDayLabel(date: Date) {
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  return {
    day: days[date.getDay()],
    num: date.getDate(),
    month: months[date.getMonth()],
  };
}

export default function BookingScreen() {
  const { id, placeName, placeType } = useLocalSearchParams<{
    id: string;
    placeName: string;
    placeType: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = getNext7Days();
  const cfg = MARKER_CONFIG[placeType ?? "other"] ?? MARKER_CONFIG.other;

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    if (!user) {
      router.push("/auth");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await createBooking({
      place_id: id,
      place_name: placeName ?? "Lugar",
      place_type: placeType ?? "other",
      date: formatDate(selectedDate),
      time_slot: selectedSlot,
    });
    setLoading(false);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error ?? "Error al reservar.");
    }
  };

  if (success) {
    return (
      <View style={[styles.root, styles.centered]}>
        <Text style={{ fontSize: 64 }}>🎉</Text>
        <Text style={styles.successTitle}>¡Reserva confirmada!</Text>
        <Text style={styles.successSub}>
          {placeName}
          {"\n"}
          {formatDate(selectedDate)} a las {selectedSlot} hs
        </Text>
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            { backgroundColor: cfg.color, marginTop: 24 },
          ]}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.confirmBtnText}>Volver al mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginTop: 12, padding: 8 }}
          onPress={() => router.push("/my-bookings")}
        >
          <Text style={{ color: cfg.color, fontWeight: "700", fontSize: 14 }}>
            Ver mis reservas
          </Text>
          <Ionicons name="chevron-forward" size={18} color={cfg.color} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: cfg.color, paddingTop: insets.top + 8 },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerEmoji}>{cfg.emoji}</Text>
          <View>
            <Text style={styles.headerTitle}>Reservar lugar</Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {placeName}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Días */}
        <Text style={styles.sectionLabel}>Seleccioná el día</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysRow}
        >
          {days.map((day) => {
            const isSelected = formatDate(day) === formatDate(selectedDate);
            const label = formatDayLabel(day);
            return (
              <TouchableOpacity
                key={day.toISOString()}
                onPress={() => {
                  setSelectedDate(day);
                  setSelectedSlot(null);
                }}
                style={[
                  styles.dayCard,
                  isSelected && {
                    backgroundColor: cfg.color,
                    borderColor: cfg.color,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.dayName, isSelected && styles.dayTextActive]}
                >
                  {label.day}
                </Text>
                <Text
                  style={[styles.dayNum, isSelected && styles.dayTextActive]}
                >
                  {label.num}
                </Text>
                <Text
                  style={[styles.dayMonth, isSelected && styles.dayTextActive]}
                >
                  {label.month}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Horarios */}
        <Text style={styles.sectionLabel}>Seleccioná el horario</Text>
        <View style={styles.slotsGrid}>
          {TIME_SLOTS.map((slot) => {
            const isSelected = selectedSlot === slot;
            return (
              <TouchableOpacity
                key={slot}
                onPress={() => setSelectedSlot(slot)}
                style={[
                  styles.slotChip,
                  isSelected && {
                    backgroundColor: cfg.color,
                    borderColor: cfg.color,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.slotText, isSelected && styles.slotTextActive]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Resumen */}
        {selectedSlot && (
          <View
            style={[
              styles.summary,
              {
                borderColor: cfg.color + "40",
                backgroundColor: cfg.color + "08",
              },
            ]}
          >
            <Text style={styles.summaryTitle}>Resumen de tu reserva</Text>
            <Text style={styles.summaryText}>📍 {placeName}</Text>
            <Text style={styles.summaryText}>
              📅 {formatDayLabel(selectedDate).day}{" "}
              {formatDayLabel(selectedDate).num}{" "}
              {formatDayLabel(selectedDate).month}
            </Text>
            <Text style={styles.summaryText}>🕐 {selectedSlot} hs</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Botón confirmar */}
      <View
        style={[styles.ctaContainer, { paddingBottom: insets.bottom + 12 }]}
      >
        {!user && (
          <Text style={styles.loginWarning}>
            ⚠️ Necesitás iniciar sesión para reservar
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            { backgroundColor: selectedSlot ? cfg.color : "#E5E7EB" },
            loading && { opacity: 0.7 },
          ]}
          onPress={handleConfirm}
          disabled={!selectedSlot || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              style={[
                styles.confirmBtnText,
                !selectedSlot && { color: "#9CA3AF" },
              ]}
            >
              {selectedSlot
                ? `Confirmar — ${selectedSlot} hs`
                : "Elegí un horario"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F9FAFB" },
  centered: { justifyContent: "center", alignItems: "center", padding: 32 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  backBtnText: { color: "white", fontSize: 20, fontWeight: "700" },
  headerInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerEmoji: { fontSize: 36 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "white" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 120 },
  sectionLabel: { fontSize: 15, fontWeight: "700", color: "#111827" },
  daysRow: { gap: 10, paddingVertical: 4 },
  dayCard: {
    width: 60,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
    gap: 2,
  },
  dayName: { fontSize: 11, fontWeight: "600", color: "#9CA3AF" },
  dayNum: { fontSize: 20, fontWeight: "800", color: "#111827" },
  dayMonth: { fontSize: 10, color: "#9CA3AF" },
  dayTextActive: { color: "white" },
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  slotChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
  },
  slotText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  slotTextActive: { color: "white" },
  summary: { borderWidth: 1.5, borderRadius: 16, padding: 16, gap: 6 },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  summaryText: { fontSize: 14, color: "#374151" },
  errorBox: { backgroundColor: "#FEF2F2", borderRadius: 10, padding: 12 },
  errorText: { color: "#DC2626", fontSize: 13 },
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 8,
  },
  loginWarning: {
    fontSize: 12,
    color: "#F59E0B",
    textAlign: "center",
    fontWeight: "500",
  },
  confirmBtn: { borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  confirmBtnText: { color: "white", fontWeight: "800", fontSize: 16 },
  successTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginTop: 16,
    textAlign: "center",
  },
  successSub: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
});
