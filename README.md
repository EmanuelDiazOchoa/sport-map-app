# 🏟️ SportMap

**Explorá y reservá espacios deportivos cerca tuyo.**

App mobile desarrollada con React Native + Expo que combina geolocalización, mapas interactivos, inteligencia artificial y un sistema de reservas completo. Proyecto de portfolio para demostrar habilidades full-stack en desarrollo móvil.

---

## 📱 Demo

[▶️ Ver demo en YouTube](https://www.youtube.com/shorts/eirs4aGKUoE)

---

## ✨ Features

- 🗺️ Mapa interactivo con OpenStreetMap + CartoDB — sin Google Maps, sin costo
- 📍 Lugares reales desde Overpass API (OSM) + base propia en Supabase
- 🏋️ 35+ categorías deportivas con íconos vectoriales (MaterialCommunityIcons)
- 🔍 Explorador por deporte con grilla visual y lista de lugares cercanos
- ❤️ Favoritos persistentes con AsyncStorage
- 📅 Sistema de reservas completo — selección de día, horario, confirmación y cancelación
- ⭐ Rating interactivo con promedio en tiempo real desde Supabase
- 🔐 Autenticación con Supabase Auth — email/password con RLS por usuario
- 🖼️ Imágenes reales por deporte via Unsplash API
- 🌤️ Clima en tiempo real + pronóstico 7 días — Open-Meteo, sin API key
- 🤖 Chat IA con Groq (Llama 3.3) — contexto de clima, hora y lugares cercanos
- ✨ Splash screen animado con fade + scale + dots

---

## 🛠️ Stack tecnológico

| Capa      | Tecnología                                     |
| --------- | ---------------------------------------------- |
| Mobile    | React Native + Expo SDK 55                     |
| Routing   | Expo Router (file-based)                       |
| Mapas     | Leaflet.js + OpenStreetMap + CartoDB (WebView) |
| Backend   | Supabase — PostgreSQL + Auth + RLS             |
| Datos OSM | Overpass API                                   |
| Imágenes  | Unsplash API                                   |
| IA        | Groq API — Llama 3.3 (gratuita, sin tarjeta)   |
| Clima     | Open-Meteo API (gratuita, sin key)             |
| Íconos    | MaterialCommunityIcons + Ionicons              |
| Estado    | React hooks + AsyncStorage                     |
| Lenguaje  | TypeScript                                     |

---

## 🗂️ Estructura del proyecto

sport-map-app/
├── app/
│ ├── (tabs)/
│ │ ├── index.tsx # Mapa principal + clima en tiempo real
│ │ ├── explore.tsx # Explorador por deporte con grilla y lista
│ │ └── profile.tsx # Perfil + favoritos + mis reservas
│ ├── place/[id].tsx # Detalle del lugar + rating interactivo
│ ├── booking/[id].tsx # Reserva — día, horario, confirmación
│ ├── my-bookings.tsx # Mis reservas + cancelar
│ ├── ai-chat.tsx # Chat IA con clima y recomendaciones
│ ├── weather.tsx # Pronóstico 7 días con outdoor/indoor
│ └── auth.tsx # Login / Registro
├── components/
│ ├── MapView.tsx # Mapa + markers + filtros + bottom sheet
│ ├── PlaceCard.tsx # Card reutilizable de lugar
│ ├── SportIcon.tsx # Íconos vectoriales por deporte
│ └── SplashLoader.tsx # Animación de carga inicial
├── constants/
│ ├── markerConfig.ts # Colores y labels por deporte
│ └── sportIcons.ts # Mapeo de íconos MaterialCommunityIcons
├── services/
│ ├── supabasePlaces.ts # Lugares desde Supabase
│ ├── overpass.ts # Lugares reales de OSM (radio 4km, 43 tags)
│ ├── bookings.ts # CRUD de reservas
│ ├── ratings.ts # Sistema de valoraciones por usuario
│ └── unsplash.ts # Imágenes por categoría de deporte
├── hooks/
│ ├── useAuth.ts # Autenticación con Supabase
│ └── useFavorites.ts # Favoritos persistentes (AsyncStorage)
├── types/
│ └── place.ts # 35+ SportTypes con deportes olímpicos
└── lib/
└── supabase.ts # Cliente Supabase

---

## 🚀 Setup

```bash
git clone https://github.com/EmanuelDiazOchoa/sport-map-app.git
cd sport-map-app
npm install
npx expo start --clear
```

### Variables de entorno

Crear `.env` en la raíz del proyecto:
EXPO_PUBLIC_GROQ_API_KEY=tu_key_aqui

La key de Groq es gratuita — registrate en [console.groq.com](https://console.groq.com) sin tarjeta de crédito.

Las claves de Supabase y Unsplash están en `lib/supabase.ts` y `services/unsplash.ts` para simplificar el setup de demo. Para producción moverlas al `.env`.

### Base de datos (Supabase)

Correr el SQL en el SQL Editor de Supabase:

```sql
create table places (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  type text not null,
  description text,
  rating numeric(2,1),
  address text,
  schedule text,
  price text,
  phone text,
  created_at timestamp with time zone default now()
);

create table bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  place_id text not null,
  place_name text not null,
  place_type text not null,
  date date not null,
  time_slot text not null,
  status text default 'confirmed',
  created_at timestamp with time zone default now()
);

alter table bookings enable row level security;
create policy "Users see own bookings" on bookings
  for all using (auth.uid() = user_id);

create table ratings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  place_id text not null,
  rating integer not null check (rating between 1 and 5),
  created_at timestamp with time zone default now(),
  unique(user_id, place_id)
);

alter table ratings enable row level security;
create policy "Users manage own ratings" on ratings
  for all using (auth.uid() = user_id);
```

---

## 🧠 Decisiones técnicas

**Mapas sin costo:** Leaflet + OpenStreetMap en WebView en lugar de `react-native-maps` — Expo Go requiere Google Maps API key para Android. CartoDB Voyager como tile server (OSM directo bloqueaba por CORS en WebView).

**IA gratuita:** Groq (Llama 3.3) en lugar de OpenAI — completamente gratuita sin tarjeta. El prompt usa formato pipe-separated compacto para no superar el límite de 12.000 tokens por minuto del free tier.

**Ciclo de dependencias resuelto:** `MARKER_CONFIG` extraído a `constants/markerConfig.ts` para romper el ciclo circular `MapView ↔ overpass` que generaba warnings en Metro.

**Caché de OSM:** Resultados de Overpass guardados en AsyncStorage por coordenadas redondeadas — evita llamadas repetidas y mejora el tiempo de carga en aperturas subsiguientes.

**Favoritos completos:** `useFavorites` persiste el objeto `Place[]` completo en lugar de solo IDs, para soportar lugares de OSM que no existen en Supabase.

**Geografía global:** OSM y Overpass tienen datos mundiales — la app funciona en cualquier ciudad sin ningún cambio de configuración.

---

## 📋 Roadmap

- [x] Mapa interactivo con OSM + CartoDB (sin Google Maps)
- [x] Markers por deporte con colores e íconos vectoriales
- [x] Filtros por deporte + bottom sheet animado
- [x] Explorador con grilla visual y lista de lugares cercanos
- [x] Detalle del lugar con imagen real (Unsplash)
- [x] Favoritos persistentes con AsyncStorage
- [x] Autenticación con Supabase Auth (RLS por usuario)
- [x] Sistema de reservas completo (día + horario + cancelar)
- [x] Simuladores deportivos (F1, vuelo, rally, golf, VR, tiro)
- [x] Clima en tiempo real en header principal (Open-Meteo)
- [x] Pronóstico 7 días con indicador outdoor/indoor
- [x] Chat IA con contexto de clima, hora y lugares (Groq, gratuito)
- [x] Splash screen animado (fade + scale + dots)
- [x] 35+ deportes olímpicos con tags OSM correctos
- [x] Sistema de valoración con estrellas (ratings en Supabase, promedio en tiempo real)
- [x] Íconos vectoriales en toda la app (MaterialCommunityIcons)
- [ ] Push notifications para recordar reservas (requiere EAS Build)
- [ ] Validación de disponibilidad real de horarios
- [ ] Freemium con RevenueCat

---

## 👤 Autor

Emanuel Díaz Ochoa

- GitHub: [@EmanuelDiazOchoa](https://github.com/EmanuelDiazOchoa/sport-map-app)
- LinkedIn: [linkedin.com/in/tu-linkedin](https://linkedin.com/in/tu-linkedin)

---

## 📝 Nota

Proyecto desarrollado como portfolio. Open to work 🚀
