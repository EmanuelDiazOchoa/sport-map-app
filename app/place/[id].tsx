import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MARKER_CONFIG } from "../../components/MapView";
import { useFavorites } from "../../hooks/useFavorites";
import { fetchPlaces } from "../../services/supabasePlaces";
import { getPlaceImage } from "../../services/unsplash";
import { Place } from "../../types/place";

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text
          key={i}
          style={{
            fontSize: 18,
            color: i <= Math.round(rating) ? "#FBBF24" : "#E5E7EB",
          }}
        >
          ★
        </Text>
      ))}
      <Text
        style={{
          fontSize: 15,
          color: "#6B7280",
          marginLeft: 4,
          fontWeight: "600",
        }}
      >
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}

const INFO_ROWS = [
  {
    icon: "🕐",
    label: "Horario",
    key: "schedule",
    fallback: "Consultar en el lugar",
  },
  { icon: "💰", label: "Precio", key: "price", fallback: "Sin información" },
  { icon: "📞", label: "Contacto", key: "phone", fallback: "Sin información" },
];

function getSports(type: string) {
  const map: Record<string, { emoji: string; label: string }[]> = {
    running: [
      { emoji: "🏃", label: "Running" },
      { emoji: "🚴", label: "Ciclismo" },
      { emoji: "🧘", label: "Yoga" },
    ],
    padel: [
      { emoji: "🎾", label: "Pádel" },
      { emoji: "🏸", label: "Badminton" },
    ],
    gym: [
      { emoji: "💪", label: "Calistenia" },
      { emoji: "🏋️", label: "Pesas" },
      { emoji: "🤸", label: "Funcional" },
    ],
    football: [{ emoji: "⚽", label: "Fútbol" }],
    basketball: [{ emoji: "🏀", label: "Básquet" }],
    tennis: [{ emoji: "🎾", label: "Tenis" }],
    swimming: [{ emoji: "🏊", label: "Natación" }],
    volleyball: [{ emoji: "🏐", label: "Vóley" }],
    cycling: [{ emoji: "🚴", label: "Ciclismo" }],
    hockey: [{ emoji: "🏑", label: "Hockey" }],
    rugby: [{ emoji: "🏉", label: "Rugby" }],
    boxing: [{ emoji: "🥊", label: "Boxeo" }],
    martial_arts: [{ emoji: "🥋", label: "Artes Marciales" }],
  };
  return map[type] ?? [{ emoji: "🏅", label: "Deporte" }];
}

export default function PlaceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isFavorite, toggle } = useFavorites();

  const [place, setPlace] = useState<Place | undefined>(undefined);
  const [loadingPlace, setLoadingPlace] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchPlaces().then((data) => {
      const found = data.find((p) => p.id === id);
      setPlace(found);
      setLoadingPlace(false);
    });
  }, [id]);

  useEffect(() => {
    if (place) getPlaceImage(place.type).then(setImageUrl);
  }, [place]);

  if (loadingPlace) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!place) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>Lugar no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#2563EB", marginTop: 12, fontWeight: "600" }}>
            ← Volver
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cfg = MARKER_CONFIG[place.type] ?? {
    color: "#2563EB",
    emoji: "📍",
    label: place.type,
  };
  const fav = isFavorite(place.id);

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Hero con imagen */}
      <View style={styles.heroContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, { backgroundColor: cfg.color }]} />
        )}
        <View style={styles.heroOverlay} />

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggle(place)} style={styles.favBtn}>
          <Text style={{ fontSize: 22 }}>{fav ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>

        <View style={styles.heroInfo}>
          <View style={[styles.heroBadge, { backgroundColor: cfg.color }]}>
            <Text style={styles.heroBadgeText}>
              {cfg.emoji} {cfg.label}
            </Text>
          </View>
          <Text style={styles.heroTitle}>{place.name}</Text>
          {place.address && (
            <Text style={styles.heroAddress}>📍 {place.address}</Text>
          )}
        </View>
      </View>

      {/* Scroll */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {place.rating && (
          <>
            <View style={styles.section}>
              <StarRating rating={place.rating} />
            </View>
            <View style={styles.divider} />
          </>
        )}

        {place.description && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sobre este lugar</Text>
              <Text style={styles.description}>{place.description}</Text>
            </View>
            <View style={styles.divider} />
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          {INFO_ROWS.map((row) => (
            <View key={row.key} style={styles.infoRow}>
              <Text style={styles.infoIcon}>{row.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>
                  {(place as any)[row.key] ?? row.fallback}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deportes disponibles</Text>
          <View style={styles.sportsRow}>
            {getSports(place.type).map((sport) => (
              <View
                key={sport.label}
                style={[
                  styles.sportChip,
                  { backgroundColor: cfg.color + "15" },
                ]}
              >
                <Text style={{ fontSize: 18 }}>{sport.emoji}</Text>
                <Text style={[styles.sportLabel, { color: cfg.color }]}>
                  {sport.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: cfg.color }]}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>Reservar lugar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F9FAFB" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  notFoundText: { fontSize: 16, color: "#6B7280" },

  heroContainer: { height: 280, position: "relative" },
  heroImage: { width: "100%", height: 280, resizeMode: "cover" },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backBtn: {
    position: "absolute",
    top: 52,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: { color: "white", fontSize: 20, fontWeight: "700" },
  favBtn: {
    position: "absolute",
    top: 52,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroInfo: { position: "absolute", bottom: 20, left: 20, right: 20, gap: 6 },
  heroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroBadgeText: { color: "white", fontWeight: "700", fontSize: 12 },
  heroTitle: { fontSize: 24, fontWeight: "800", color: "white" },
  heroAddress: { fontSize: 13, color: "rgba(255,255,255,0.85)" },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  section: { padding: 20, gap: 10 },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginHorizontal: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  description: { fontSize: 15, color: "#374151", lineHeight: 22 },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 4,
  },
  infoIcon: { fontSize: 20, marginTop: 1 },
  infoLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    marginTop: 1,
  },
  sportsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  sportChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  sportLabel: { fontSize: 13, fontWeight: "600" },
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  ctaBtn: { borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  ctaBtnText: { color: "white", fontWeight: "800", fontSize: 16 },
});
