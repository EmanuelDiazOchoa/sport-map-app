import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MARKER_CONFIG } from "../../components/MapView";

const SPORTS = Object.entries(MARKER_CONFIG)
  .map(([key, val]) => ({ key, ...val }))
  .sort((a, b) => a.label.localeCompare(b.label));

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>Explorar deportes</Text>
      </View>

      <Text style={{ paddingHorizontal: 20, marginTop: 8 }}>
        Elegí un deporte y te mostramos lugares reales cerca tuyo
      </Text>

      <ScrollView contentContainerStyle={styles.grid}>
        {SPORTS.map((sport) => (
          <TouchableOpacity
            key={sport.key}
            style={styles.card}
            onPress={() =>
              router.push({ pathname: "/", params: { filter: sport.key } })
            }
            activeOpacity={0.8}
          >
            <View
              style={[styles.iconBox, { backgroundColor: sport.color + "20" }]}
            >
              <Text style={styles.icon}>{sport.emoji}</Text>
            </View>
            <Text style={styles.label}>{sport.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  title: { fontSize: 24, fontWeight: "800", color: "#111827" },
  subtitle: { fontSize: 14, color: "#9CA3AF", marginTop: 4 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 12,
    paddingBottom: 32,
  },
  card: {
    width: "46%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 28 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
  },
});
