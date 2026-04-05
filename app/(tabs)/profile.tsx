import { useRouter } from "expo-router";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MARKER_CONFIG } from "../../components/MapView";
import { useAuth } from "../../hooks/useAuth";
import { useFavorites } from "../../hooks/useFavorites";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { favorites, toggle } = useFavorites();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={[styles.userHeader, { paddingTop: insets.top + 12 }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user ? user.email?.[0].toUpperCase() : "?"}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>
            {user ? user.email : "No estás logueado"}
          </Text>
          <Text style={styles.userSub}>
            {user ? "Cuenta activa" : "Iniciá sesión para guardar favoritos"}
          </Text>
        </View>
        {user ? (
          <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => router.push("/auth")}
            style={styles.loginBtn}
          >
            <Text style={styles.loginText}>Entrar</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionTitle}>
        Mis favoritos {favorites.length > 0 && `(${favorites.length})`}
      </Text>

      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🤍</Text>
          <Text style={styles.emptyTitle}>Sin favoritos aún</Text>
          <Text style={styles.emptyText}>
            Tocá el corazón en cualquier lugar para guardarlo acá.
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
          data={favorites}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => {
            const cfg = MARKER_CONFIG[item.type] ?? {
              color: "#2563EB",
              emoji: "📍",
              label: item.type,
            };
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/place/[id]",
                    params: {
                      id: item.id,
                      placeData: JSON.stringify(item),
                    },
                  })
                }
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.cardIcon,
                    { backgroundColor: cfg.color + "20" },
                  ]}
                >
                  <Text style={{ fontSize: 26 }}>{cfg.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  {item.address && (
                    <Text style={styles.cardAddress}>📍 {item.address}</Text>
                  )}
                  {item.rating && (
                    <Text style={styles.cardRating}>
                      {"★".repeat(Math.round(item.rating))}{" "}
                      {item.rating.toFixed(1)}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => toggle(item)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={{ fontSize: 22 }}>❤️</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F9FAFB" },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "white", fontWeight: "800", fontSize: 20 },
  userName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  userSub: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  logoutText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  loginBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },
  loginText: { fontSize: 13, fontWeight: "600", color: "white" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#374151" },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
  exploreBtn: {
    marginTop: 4,
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  exploreBtnText: { color: "white", fontWeight: "700", fontSize: 14 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    gap: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  cardAddress: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  cardRating: {
    fontSize: 12,
    color: "#FBBF24",
    marginTop: 3,
    fontWeight: "600",
  },
});
