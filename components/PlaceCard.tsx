import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Place } from "../types/place";
import { MARKER_CONFIG } from "./MapView";
import SportIcon from "./SportIcon";

type Props = {
  place: Place;
  onFavoriteToggle?: () => void;
  isFavorite?: boolean;
};

export default function PlaceCard({
  place,
  onFavoriteToggle,
  isFavorite,
}: Props) {
  const router = useRouter();
  const cfg = MARKER_CONFIG[place.type] ?? {
    color: "#2563EB",
    emoji: "📍",
    label: place.type,
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/place/[id]",
          params: { id: place.id, placeData: JSON.stringify(place) },
        })
      }
      activeOpacity={0.8}
    >
      <View style={[styles.icon, { backgroundColor: cfg.color + "20" }]}>
        <SportIcon type={place.type} size={26} color={cfg.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{place.name}</Text>
        {place.address && (
          <Text style={styles.address}>📍 {place.address}</Text>
        )}
        {place.rating && (
          <Text style={styles.rating}>
            {"★".repeat(Math.round(place.rating))} {place.rating.toFixed(1)}
          </Text>
        )}
        <View style={[styles.badge, { backgroundColor: cfg.color + "20" }]}>
          <Text style={[styles.badgeText, { color: cfg.color }]}>
            {cfg.emoji} {cfg.label}
          </Text>
        </View>
      </View>
      {onFavoriteToggle && (
        <TouchableOpacity
          onPress={onFavoriteToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={{ fontSize: 22 }}>{isFavorite ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  icon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 15, fontWeight: "700", color: "#111827" },
  address: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  rating: { fontSize: 12, color: "#FBBF24", marginTop: 3, fontWeight: "600" },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 5,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
});
