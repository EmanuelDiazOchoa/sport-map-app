import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";

type Mode = "login" | "register";

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Completá todos los campos.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        router.replace("/");
      } else {
        await signUp(email, password);
        setSuccess("¡Cuenta creada! Revisá tu email para confirmar.");
        setTimeout(() => setMode("login"), 2500);
      }
    } catch (e: any) {
      setError(e.message ?? "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🏟️</Text>
          <Text style={styles.title}>SportMap</Text>
          <Text style={styles.subtitle}>
            {mode === "login"
              ? "Iniciá sesión para continuar"
              : "Creá tu cuenta gratis"}
          </Text>
        </View>

        <View style={styles.tabs}>
          {(["login", "register"] as Mode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.tab, mode === m && styles.tabActive]}
              onPress={() => {
                setMode(m);
                setError(null);
                setSuccess(null);
              }}
            >
              <Text
                style={[styles.tabText, mode === m && styles.tabTextActive]}
              >
                {m === "login" ? "Iniciar sesión" : "Registrarse"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}
          {success && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ {success}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.btnText}>
                {mode === "login" ? "Entrar" : "Crear cuenta"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F9FAFB" },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 28,
  },
  header: { alignItems: "center", gap: 8 },
  emoji: { fontSize: 56 },
  title: { fontSize: 32, fontWeight: "800", color: "#111827" },
  subtitle: { fontSize: 15, color: "#6B7280", textAlign: "center" },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive: {
    backgroundColor: "white",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  tabText: { fontSize: 14, fontWeight: "600", color: "#9CA3AF" },
  tabTextActive: { color: "#111827" },
  form: { gap: 16 },
  inputWrapper: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#374151" },
  input: {
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: "#111827",
  },
  errorBox: { backgroundColor: "#FEF2F2", borderRadius: 10, padding: 12 },
  errorText: { color: "#DC2626", fontSize: 13, fontWeight: "500" },
  successBox: { backgroundColor: "#F0FDF4", borderRadius: 10, padding: 12 },
  successText: { color: "#16A34A", fontSize: 13, fontWeight: "500" },
  btn: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { color: "white", fontWeight: "800", fontSize: 16 },
});
