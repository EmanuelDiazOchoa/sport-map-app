import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomMapView from "../../components/MapView";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerEmoji}>🏟️</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>SportMap</Text>
          <Text style={styles.headerSub}>Encontrá tu lugar para entrenar</Text>
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
  aiBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
});
