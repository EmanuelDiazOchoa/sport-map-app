import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MARKER_CONFIG } from "../../components/MapView";
import PlaceCard from "../../components/PlaceCard";
import SportIcon from "../../components/SportIcon";
import { useFavorites } from "../../hooks/useFavorites";
import { fetchNearbyPlaces } from "../../services/overpass";
import { fetchPlaces } from "../../services/supabasePlaces";
import { Place } from "../../types/place";

const SPORTS = Object.entries(MARKER_CONFIG)
  .filter(([key]) => key !== "other")
  .map(([key, val]) => ({ key, ...val }))
  .sort((a, b) => a.label.localeCompare(b.label));

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { toggle, isFavorite } = useFavorites();

  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        const loc =
          status === "granted"
            ? await Location.getCurrentPositionAsync({})
            : null;
        const lat = loc?.coords.latitude ?? -34.6037;
        const lng = loc?.coords.longitude ?? -58.565;

        const [supabasePlaces, osmPlaces] = await Promise.all([
          fetchPlaces(),
          fetchNearbyPlaces(lat, lng),
        ]);

        const supabaseIds = new Set(supabasePlaces.map((p) => p.id));
        const combined = [
          ...supabasePlaces,
          ...osmPlaces.filter((p) => !supabaseIds.has(p.id)),
        ];
        setAllPlaces(combined);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const filtered = selectedSport
    ? allPlaces.filter((p) => p.type === selectedSport)
    : [];

  const selectedCfg = selectedSport ? MARKER_CONFIG[selectedSport] : null;

  if (selectedSport && selectedCfg) {
    return (
      <View style={styles.root}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={() => setSelectedSport(null)}
            style={styles.backBtn}
          >
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backLabel}>Deportes</Text>
          </TouchableOpacity>
          <View style={styles.headerRow}>
            <View
              style={[
                styles.headerIconBox,
                { backgroundColor: selectedCfg.color + "20" },
              ]}
            >
              <Text style={styles.headerIconText}>{selectedCfg.emoji}</Text>
            </View>
            <View>
              <Text style={styles.title}>{selectedCfg.label}</Text>
              <Text style={styles.subtitle}>
                {loading
                  ? "Cargando..."
                  : `${filtered.length} lugares encontrados`}
              </Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Buscando lugares...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyEmoji}>{selectedCfg.emoji}</Text>
            <Text style={styles.emptyTitle}>
              No hay lugares de {selectedCfg.label} cerca
            </Text>
            <Text style={styles.emptyText}>
              OpenStreetMap no tiene registros en tu zona.
            </Text>
            <TouchableOpacity
              style={styles.aiBtn}
              onPress={() => router.push("/ai-chat")}
            >
              <Text style={styles.aiBtnText}>🤖 Consultar al asistente</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mapBtn}
              onPress={() =>
                router.push({
                  pathname: "/",
                  params: { filter: selectedSport },
                })
              }
            >
              <Text style={styles.mapBtnText}>Ver en el mapa</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(p) => p.id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <TouchableOpacity
                style={[
                  styles.mapBtnInline,
                  { borderColor: selectedCfg.color },
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/",
                    params: { filter: selectedSport },
                  })
                }
              >
                <Text
                  style={[
                    styles.mapBtnInlineText,
                    { color: selectedCfg.color },
                  ]}
                >
                  🗺️ Ver estos lugares en el mapa
                </Text>
              </TouchableOpacity>
            }
            renderItem={({ item }) => (
              <PlaceCard
                place={item}
                isFavorite={isFavorite(item.id)}
                onFavoriteToggle={() => toggle(item)}
              />
            )}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>Explorar deportes</Text>
        <Text style={styles.subtitle}>
          Elegí un deporte para ver lugares cerca tuyo
        </Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Cargando lugares...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {SPORTS.map((sport) => (
            <TouchableOpacity
              key={sport.key}
              style={styles.sportCard}
              onPress={() => setSelectedSport(sport.key)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: sport.color + "20" },
                ]}
              >
                <SportIcon type={sport.key} size={28} color={sport.color} />
              </View>
              <Text style={styles.sportLabel}>{sport.label}</Text>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: sport.color + "15" },
                ]}
              >
                <Text style={[styles.countText, { color: sport.color }]}>
                  {allPlaces.filter((p) => p.type === sport.key).length} lugares
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconText: { fontSize: 22 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  backArrow: { fontSize: 16, color: "#6B7280" },
  backLabel: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtitle: { fontSize: 13, color: "#9CA3AF", marginTop: 2 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  loadingText: { fontSize: 14, color: "#9CA3AF" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 10,
    paddingBottom: 32,
  },
  sportCard: {
    width: "47%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
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
  iconText: { fontSize: 28 },
  sportLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  countText: { fontSize: 11, fontWeight: "700" },

  listContent: { padding: 16, gap: 12, paddingBottom: 32 },
  mapBtnInline: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 4,
    backgroundColor: "white",
  },
  mapBtnInlineText: { fontWeight: "700", fontSize: 14 },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
  aiBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 4,
  },
  aiBtnText: { color: "white", fontWeight: "700", fontSize: 14 },
  mapBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  mapBtnText: { color: "#374151", fontWeight: "600", fontSize: 14 },
});
