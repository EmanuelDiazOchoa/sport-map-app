import PlaceCard from "@/components/PlaceCard";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../hooks/useAuth";
import { useFavorites } from "../../hooks/useFavorites";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { favorites, toggle } = useFavorites();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* Header usuario */}
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

      {/* Botón mis reservas */}
      <TouchableOpacity
        style={styles.bookingsBtn}
        onPress={() => router.push("/my-bookings")}
      >
        <Text style={styles.bookingsBtnText}>📅 Ver mis reservas</Text>
      </TouchableOpacity>

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
            <Text style={styles.exploreBtnText}>Explorar el mapa</Text>
            <Ionicons name="chevron-forward" size={18} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <PlaceCard
              place={item}
              isFavorite={true}
              onFavoriteToggle={() => toggle(item)}
            />
          )}
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
  bookingsBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  bookingsBtnText: { fontSize: 14, fontWeight: "700", color: "#374151" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    paddingHorizontal: 20,
    paddingTop: 12,
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
});
