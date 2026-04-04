import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import WebView from "react-native-webview";
import { fetchPlaces } from "../services/supabasePlaces";
import { Place } from "../types/place";

type Coords = { latitude: number; longitude: number };
type FilterType = "all" | "running" | "padel" | "gym";

export const MARKER_CONFIG: Record<
  string,
  { color: string; emoji: string; label: string }
> = {
  running: { color: "#EA580C", emoji: "🏃", label: "Running" },
  padel: { color: "#16A34A", emoji: "🎾", label: "Pádel" },
  gym: { color: "#7C3AED", emoji: "💪", label: "Gym" },
};

const FILTERS: { key: FilterType; label: string; color: string }[] = [
  { key: "all", label: "Todos", color: "#2563EB" },
  { key: "running", label: "🏃 Running", color: "#EA580C" },
  { key: "padel", label: "🎾 Pádel", color: "#16A34A" },
  { key: "gym", label: "💪 Gym", color: "#7C3AED" },
];

const buildHTML = (coords: Coords, filteredPlaces: Place[]) => {
  const markersJS = filteredPlaces
    .map((p) => {
      const cfg = MARKER_CONFIG[p.type] ?? { color: "#2563EB", emoji: "📍" };
      return `
      L.marker([${p.latitude}, ${p.longitude}], {
        icon: L.divIcon({
          className: '',
          html: \`<div style="background:${cfg.color};width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
            <span style="transform:rotate(45deg);font-size:16px;line-height:1">${cfg.emoji}</span>
          </div>\`,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -38],
        })
      })
      .addTo(map)
      .on('click', () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ id: '${p.id}' }));
      });
    `;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body,#map{width:100%;height:100%}
    .leaflet-popup-content-wrapper{border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.15)}
  </style>
</head>
<body>
<div id="map"></div>
<script>
  const map = L.map('map').setView([${coords.latitude},${coords.longitude}],15);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{
    attribution:'© OpenStreetMap © CARTO',subdomains:'abcd',maxZoom:19
  }).addTo(map);
  L.marker([${coords.latitude},${coords.longitude}],{
    icon:L.divIcon({
      className:'',
      html:'<div style="background:#2563EB;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(37,99,235,.5)"></div>',
      iconSize:[20,20],iconAnchor:[10,10]
    })
  }).addTo(map);
  ${markersJS}
</script>
</body>
</html>`;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text
          key={i}
          style={{
            fontSize: 14,
            color: i <= Math.round(rating) ? "#FBBF24" : "#D1D5DB",
          }}
        >
          ★
        </Text>
      ))}
      <Text style={{ fontSize: 13, color: "#6B7280", marginLeft: 2 }}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}

export default function CustomMapView() {
  const router = useRouter();
  const [coords, setCoords] = useState<Coords | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const webViewRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        const loc =
          status === "granted"
            ? await Location.getCurrentPositionAsync({})
            : null;
        setCoords(
          loc
            ? { latitude: loc.coords.latitude, longitude: loc.coords.longitude }
            : { latitude: -34.6037, longitude: -58.565 },
        );
      } catch {
        setCoords({ latitude: -34.6037, longitude: -58.565 });
      }
    })();
  }, []);

  useEffect(() => {
    fetchPlaces().then((data) => {
      setPlaces(data);
      setLoading(false);
    });
  }, []);

  const showCard = (place: Place) => {
    setSelectedPlace(place);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const hideCard = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setSelectedPlace(null));
  };

  const onMessage = (event: any) => {
    try {
      const { id } = JSON.parse(event.nativeEvent.data);
      const place = places.find((p) => p.id === id);
      if (place) showCard(place);
    } catch {}
  };

  const filtered =
    filter === "all" ? places : places.filter((p) => p.type === filter);
  const html = coords && !loading ? buildHTML(coords, filtered) : null;

  if (!html) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 12, color: "#6B7280", fontSize: 14 }}>
          {!coords ? "Obteniendo ubicación..." : "Cargando lugares..."}
        </Text>
      </View>
    );
  }

  const cfg = selectedPlace ? MARKER_CONFIG[selectedPlace.type] : null;

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => {
                  setFilter(f.key);
                  hideCard();
                }}
                style={[
                  styles.chip,
                  { borderColor: f.color },
                  active && { backgroundColor: f.color },
                ]}
                activeOpacity={0.75}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ html }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        onMessage={onMessage}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        )}
      />

      {selectedPlace && cfg && (
        <Animated.View
          style={[styles.card, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.handle} />
          <View style={styles.cardHeader}>
            <View style={[styles.badge, { backgroundColor: cfg.color + "20" }]}>
              <Text style={[styles.badgeText, { color: cfg.color }]}>
                {cfg.emoji} {cfg.label}
              </Text>
            </View>
            <TouchableOpacity onPress={hideCard} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardTitle}>{selectedPlace.name}</Text>
          {selectedPlace.rating && <StarRating rating={selectedPlace.rating} />}
          {selectedPlace.address && (
            <Text style={styles.cardAddress}>📍 {selectedPlace.address}</Text>
          )}
          {selectedPlace.description && (
            <Text style={styles.cardDesc}>{selectedPlace.description}</Text>
          )}
          <TouchableOpacity
            style={[styles.detailBtn, { backgroundColor: cfg.color }]}
            onPress={() => {
              hideCard();
              router.push(`/place/${selectedPlace.id}`);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.detailBtnText}>Ver detalle completo →</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  map: { flex: 1 },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  filterBar: {
    backgroundColor: "white",
    paddingVertical: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    zIndex: 10,
  },
  filterScroll: { paddingHorizontal: 12, gap: 8 },
  chip: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  chipText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  chipTextActive: { color: "white" },
  card: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    gap: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    alignSelf: "center",
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: { fontSize: 13, fontWeight: "700" },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  cardTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  cardAddress: { fontSize: 13, color: "#6B7280" },
  cardDesc: { fontSize: 14, color: "#374151", lineHeight: 20 },
  detailBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  detailBtnText: { color: "white", fontWeight: "700", fontSize: 15 },
});
