import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MARKER_CONFIG } from "../components/MapView";
import { Booking, cancelBooking, fetchMyBookings } from "../services/bookings";

export default function MyBookingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings().then((data) => {
      setBookings(data);
      setLoading(false);
    });
  }, []);

  const handleCancel = async (id: string) => {
    const ok = await cancelBooking(id);
    if (ok) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
      );
    }
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis reservas</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ fontSize: 48 }}>📅</Text>
          <Text style={styles.emptyTitle}>Sin reservas aún</Text>
          <Text style={styles.emptyText}>
            Reservá un lugar desde la pantalla de detalle.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.push("/")}
          >
            <Text style={styles.exploreBtnText}>Explorar el mapa →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b) => b.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => {
            const cfg = MARKER_CONFIG[item.place_type] ?? MARKER_CONFIG.other;
            const cancelled = item.status === "cancelled";
            return (
              <View style={[styles.card, cancelled && styles.cardCancelled]}>
                <View
                  style={[
                    styles.cardIcon,
                    { backgroundColor: cfg.color + "20" },
                  ]}
                >
                  <Text style={{ fontSize: 24 }}>{cfg.emoji}</Text>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text
                    style={[styles.cardName, cancelled && styles.textCancelled]}
                  >
                    {item.place_name}
                  </Text>
                  <Text style={styles.cardDetail}>📅 {item.date}</Text>
                  <Text style={styles.cardDetail}>🕐 {item.time_slot} hs</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: cancelled
                          ? "#F3F4F6"
                          : cfg.color + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: cancelled ? "#9CA3AF" : cfg.color },
                      ]}
                    >
                      {cancelled ? "Cancelada" : "✓ Confirmada"}
                    </Text>
                  </View>
                </View>
                {!cancelled && (
                  <TouchableOpacity
                    onPress={() => handleCancel(item.id)}
                    style={styles.cancelBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F9FAFB" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
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
  title: { fontSize: 20, fontWeight: "800", color: "#111827" },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#374151" },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
  exploreBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 8,
  },
  exploreBtnText: { color: "white", fontWeight: "700", fontSize: 14 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardCancelled: { opacity: 0.6 },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  textCancelled: { color: "#9CA3AF" },
  cardDetail: { fontSize: 13, color: "#6B7280" },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 4,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
    alignSelf: "flex-start",
  },
  cancelBtnText: { fontSize: 12, fontWeight: "600", color: "#DC2626" },
});
