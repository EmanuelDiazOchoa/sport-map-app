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

const SUGGESTIONS = [
  "Quiero entrenar pierna al aire libre 💪",
  "Busco una cancha de fútbol cerca",
  "¿Dónde puedo correr por las mañanas?",
  "Algo para relajarme y hacer yoga",
  "Quiero probar un simulador de F1 🏎️",
];

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

  useEffect(() => {
    fetchPlaces().then(setAllPlaces);
  }, []);

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
          return `- ${p.name} (${cfg.label}): ${p.description ?? "Sin descripción"}. Dirección: ${p.address ?? "Sin dirección"}.`;
        })
        .join("\n");

      const systemPrompt = `Sos un asistente deportivo amigable para la app SportMap, una app argentina de búsqueda de espacios deportivos.

Tenés acceso a estos lugares disponibles en el mapa:
${placesContext}

Tu trabajo es:
1. Entender qué quiere hacer el usuario (deporte, objetivo, estado de ánimo)
2. Recomendar 1 a 3 lugares de la lista que mejor se ajusten
3. Explicar brevemente por qué cada lugar es una buena opción
4. Ser amigable, usar español rioplatense y emojis ocasionalmente

IMPORTANTE: Al final de tu respuesta, siempre incluí una línea con los IDs de los lugares recomendados en este formato exacto:
LUGARES_IDS: id1,id2,id3

Si no hay lugares que se ajusten, igualmente respondé con sugerencias y poné LUGARES_IDS: ninguno`;

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

      // Extraer IDs de lugares recomendados
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

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: cleanText,
        places: recommendedPlaces.length > 0 ? recommendedPlaces : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
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
          <Text style={styles.headerSub}>IA para recomendarte lugares</Text>
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
                      onPress={(): void =>
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
            data={SUGGESTIONS}
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
