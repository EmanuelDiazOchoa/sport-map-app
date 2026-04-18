import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MARKER_CONFIG } from "../components/MapView";
import { fetchPlaces } from "../services/supabasePlaces";
import { Place } from "../types/place";

const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  places?: Place[];
};

type WeatherInfo = {
  temp: number;
  condition: string;
  emoji: string;
  isOutdoorFriendly: boolean;
};

async function fetchWeather(lat: number, lon: number): Promise<WeatherInfo> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();
    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weathercode;

    let condition = "Despejado";
    let emoji = "☀️";
    let isOutdoorFriendly = true;

    if (code === 0) {
      condition = "Cielo despejado";
      emoji = "☀️";
    } else if (code <= 3) {
      condition = "Parcialmente nublado";
      emoji = "⛅";
    } else if (code <= 49) {
      condition = "Nublado / neblina";
      emoji = "🌫️";
      isOutdoorFriendly = false;
    } else if (code <= 67) {
      condition = "Lluvia";
      emoji = "🌧️";
      isOutdoorFriendly = false;
    } else if (code <= 77) {
      condition = "Nieve";
      emoji = "❄️";
      isOutdoorFriendly = false;
    } else if (code <= 82) {
      condition = "Lluvia intensa";
      emoji = "⛈️";
      isOutdoorFriendly = false;
    } else {
      condition = "Tormenta";
      emoji = "⛈️";
      isOutdoorFriendly = false;
    }

    if (temp > 35) isOutdoorFriendly = false;

    return { temp, condition, emoji, isOutdoorFriendly };
  } catch {
    return {
      temp: 20,
      condition: "Sin datos",
      emoji: "🌡️",
      isOutdoorFriendly: true,
    };
  }
}

function getTimeContext(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "mañana";
  if (hour >= 12 && hour < 18) return "tarde";
  if (hour >= 18 && hour < 22) return "noche";
  return "madrugada";
}

function buildSuggestions(
  weather: WeatherInfo | null,
  timeOfDay: string,
): string[] {
  const base = [
    "¿Qué puedo hacer ahora mismo? 🤔",
    "Quiero algo para quemar calorías 🔥",
    "Busco un lugar para entrenar solo",
    "Quiero probar algo nuevo este finde 🎯",
    "Quiero probar un simulador de F1 🏎️",
  ];

  if (!weather) return base;

  const dynamic: string[] = [];

  if (!weather.isOutdoorFriendly) {
    dynamic.push(
      `Está ${weather.condition.toLowerCase()} ${weather.emoji}, ¿qué puedo hacer bajo techo?`,
    );
    dynamic.push("Llueve afuera, quiero algo indoor 🏠");
  } else {
    dynamic.push(
      `Hace ${weather.temp}°C y buen tiempo, ¿algo al aire libre? ${weather.emoji}`,
    );
  }

  if (timeOfDay === "mañana")
    dynamic.push("Quiero entrenar antes del trabajo 💪");
  if (timeOfDay === "tarde")
    dynamic.push("Tengo la tarde libre, ¿qué me recomendás?");
  if (timeOfDay === "noche")
    dynamic.push("Busco algo para hacer esta noche 🌙");

  return [...dynamic, ...base].slice(0, 5);
}

function PlaceChip({ place, onPress }: { place: Place; onPress: () => void }) {
  const cfg = MARKER_CONFIG[place.type] ?? MARKER_CONFIG.other;
  return (
    <TouchableOpacity
      style={[styles.placeChip, { borderColor: cfg.color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={{ fontSize: 16 }}>{cfg.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.placeChipName} numberOfLines={1}>
          {place.name}
        </Text>
        {place.address && (
          <Text style={styles.placeChipAddr} numberOfLines={1}>
            📍 {place.address}
          </Text>
        )}
      </View>
      <Text style={[styles.placeChipType, { color: cfg.color }]}>
        {cfg.label}
      </Text>
    </TouchableOpacity>
  );
}

function WeatherBadge({ weather }: { weather: WeatherInfo }) {
  return (
    <View style={styles.weatherBadge}>
      <Text style={styles.weatherEmoji}>{weather.emoji}</Text>
      <Text style={styles.weatherText}>
        {weather.temp}°C · {weather.condition}
      </Text>
    </View>
  );
}

export default function AIChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "¡Hola! 👋 Soy tu asistente deportivo. Contame qué querés hacer hoy y te recomiendo los mejores lugares cerca tuyo.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [timeOfDay] = useState(getTimeContext());

  useEffect(() => {
    fetchPlaces().then(setAllPlaces);

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          const w = await fetchWeather(
            loc.coords.latitude,
            loc.coords.longitude,
          );
          setWeather(w);
        }
      } catch {}
    })();
  }, []);

  const suggestions = buildSuggestions(weather, timeOfDay);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const placesContext = allPlaces
        .map((p) => {
          const cfg = MARKER_CONFIG[p.type] ?? MARKER_CONFIG.other;
          const isIndoor = [
            "gym",
            "swimming",
            "boxing",
            "martial_arts",
            "crossfit",
            "simulator_f1",
            "simulator_flight",
            "simulator_rally",
            "simulator_golf",
            "simulator_vr",
            "simulator_shooting",
          ].includes(p.type);
          return `- ID:${p.id} | ${p.name} (${cfg.label}) | ${isIndoor ? "INDOOR" : "OUTDOOR"} | ${p.description ?? "Sin descripción"} | Dirección: ${p.address ?? "Sin dirección"} | Precio: ${p.price ?? "Sin info"} | Horario: ${p.schedule ?? "Sin info"}`;
        })
        .join("\n");

      const weatherContext = weather
        ? `Clima actual: ${weather.temp}°C, ${weather.condition}. ${weather.isOutdoorFriendly ? "Buen clima para actividades al aire libre." : "Clima no favorable para actividades al aire libre — preferir opciones INDOOR."}`
        : "Clima: sin datos disponibles.";

      const systemPrompt = `Sos SportMap AI, un asistente deportivo experto para una app argentina de espacios deportivos en Buenos Aires y alrededores.

${weatherContext}
Momento del día: ${timeOfDay}

LUGARES DISPONIBLES EN EL MAPA:
${placesContext}

═══════════════════════════════
TUS CAPACIDADES
═══════════════════════════════

1. BÚSQUEDA DE LUGARES
Cuando el usuario quiere encontrar un lugar para practicar un deporte:
- Recomendá 1 a 3 lugares del mapa que correspondan
- Considerá clima (outdoor/indoor), horario, precio y momento del día
- Explicá brevemente por qué cada lugar es buena opción
- Termina con: LUGARES_IDS: id1,id2,id3

2. CONOCIMIENTO DEPORTIVO OLÍMPICO Y GENERAL
Podés responder preguntas sobre cualquier deporte, incluyendo todos los deportes olímpicos:
atletismo, natación, ciclismo, boxing, judo, taekwondo, lucha, esgrima, tiro con arco,
halterofilia, gimnasia artística y rítmica, remo, canotaje, triatlón, equitación,
handball, tenis de mesa, bádminton, vóley, básquet, fútbol, hockey, rugby, padel, etc.

Para cada deporte podés explicar:
- Reglas básicas y formato de competencia
- Técnica y fundamentos
- Entrenamiento y preparación física
- Equipamiento necesario
- Nivel de dificultad y cómo empezar
- Categorías y divisiones (ej: pesos en boxeo/judo/lucha)
- Eventos olímpicos y mundiales relevantes

3. PLANES Y RUTINAS DE ENTRENAMIENTO
Si el usuario pide una rutina:
- Preguntá nivel (principiante/intermedio/avanzado) si no lo mencionó
- Sugerí días, ejercicios, series y repeticiones
- Adaptá según objetivo (fuerza, resistencia, técnica, competencia)

4. NUTRICIÓN DEPORTIVA BÁSICA
- Alimentación pre y post entrenamiento
- Hidratación
- Suplementación básica (siempre recomendando consultar nutricionista)

5. CLIMA Y PLANIFICACIÓN
- Usá el clima actual para sugerir outdoor o indoor
- Si llueve, sugerí deportes bajo techo con entusiasmo

═══════════════════════════════
REGLAS IMPORTANTES
═══════════════════════════════
- Respondé en español rioplatense, amigable y directo
- Usá emojis con moderación
- Para lesiones o dolores físicos: siempre derivá a médico/kinesiólogo
- Para nutrición específica: derivá a nutricionista deportivo
- Si no hay lugares en el mapa para ese deporte, decilo claramente y sugerí alternativas
- Cuando NO recomendás lugar: LUGARES_IDS: ninguno
- Cuando SÍ recomendás lugares: LUGARES_IDS: id1,id2,id3 (última línea siempre)`;

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            max_tokens: 1000,
            messages: [
              { role: "system", content: systemPrompt },
              ...messages
                .filter((m) => m.id !== "welcome")
                .map((m) => ({ role: m.role, content: m.text })),
              { role: "user", content: text.trim() },
            ],
          }),
        },
      );

      const data = await response.json();
      const fullText =
        data.choices?.[0]?.message?.content ?? "No pude procesar tu consulta.";

      const idsMatch = fullText.match(/LUGARES_IDS:\s*(.+)/);
      const idsRaw = idsMatch?.[1]?.trim() ?? "";
      const recommendedIds =
        idsRaw === "ninguno"
          ? []
          : idsRaw.split(",").map((s: string) => s.trim());
      const recommendedPlaces = allPlaces.filter((p) =>
        recommendedIds.includes(p.id),
      );
      const cleanText = fullText.replace(/LUGARES_IDS:.*$/m, "").trim();

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: cleanText,
          places: recommendedPlaces.length > 0 ? recommendedPlaces : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: "Hubo un error al conectar con la IA. Revisá tu conexión e intentá de nuevo.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={insets.bottom}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>🤖 Asistente SportMap</Text>
          {weather ? (
            <WeatherBadge weather={weather} />
          ) : (
            <Text style={styles.headerSub}>IA para recomendarte lugares</Text>
          )}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === "user" ? styles.bubbleUser : styles.bubbleAssistant,
            ]}
          >
            {item.role === "assistant" && (
              <Text style={styles.bubbleIcon}>🤖</Text>
            )}
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.bubbleText,
                  item.role === "user" && styles.bubbleTextUser,
                ]}
              >
                {item.text}
              </Text>
              {item.places && item.places.length > 0 && (
                <View style={styles.placesContainer}>
                  <Text style={styles.placesLabel}>
                    📍 Lugares recomendados:
                  </Text>
                  {item.places.map((place: Place) => (
                    <PlaceChip
                      key={place.id}
                      place={place}
                      onPress={() =>
                        router.push({
                          pathname: "/place/[id]",
                          params: {
                            id: place.id,
                            placeData: JSON.stringify(place),
                          },
                        })
                      }
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingBubble}>
              <Text style={styles.bubbleIcon}>🤖</Text>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.loadingText}>Pensando...</Text>
            </View>
          ) : null
        }
      />

      {messages.length <= 1 && (
        <View style={styles.suggestions}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={suggestions}
            keyExtractor={(s) => s}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => sendMessage(item)}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="¿Qué querés hacer hoy?"
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={300}
          onSubmitEditing={() => sendMessage(input)}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!input.trim() || loading) && styles.sendBtnDisabled,
          ]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          activeOpacity={0.85}
        >
          <Text style={styles.sendBtnText}>→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  headerSub: { fontSize: 12, color: "#9CA3AF", marginTop: 1 },
  weatherBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  weatherEmoji: { fontSize: 13 },
  weatherText: { fontSize: 12, color: "#059669", fontWeight: "600" },
  messagesList: { padding: 16, gap: 12, paddingBottom: 8 },
  bubble: { flexDirection: "row", gap: 8, maxWidth: "90%" },
  bubbleUser: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  bubbleAssistant: { alignSelf: "flex-start" },
  bubbleIcon: { fontSize: 20, marginTop: 2 },
  bubbleText: {
    backgroundColor: "white",
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bubbleTextUser: {
    backgroundColor: "#2563EB",
    color: "white",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  placesContainer: { marginTop: 8, gap: 8 },
  placesLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 4,
  },
  placeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  placeChipName: { fontSize: 13, fontWeight: "700", color: "#111827" },
  placeChipAddr: { fontSize: 11, color: "#9CA3AF", marginTop: 1 },
  placeChipType: { fontSize: 11, fontWeight: "700" },
  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
  },
  loadingText: { fontSize: 13, color: "#9CA3AF" },
  suggestions: { paddingVertical: 8 },
  suggestionChip: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  suggestionText: { fontSize: 13, color: "#374151", fontWeight: "500" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  input: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "#E5E7EB" },
  sendBtnText: { color: "white", fontSize: 18, fontWeight: "700" },
});
