# 🏟️ SportMap

**Explorá y reservá espacios deportivos cerca tuyo.**

SportMap es una app mobile desarrollada con React Native + Expo que combina geolocalización, mapas interactivos, inteligencia artificial y un sistema de reservas completo. Pensada como proyecto de portfolio para demostrar habilidades full-stack en desarrollo móvil.

---

## 📱 Screenshots

> _Próximamente — mapa con markers / detalle del lugar / reservas / perfil_

---

## ✨ Features

- 🗺️ **Mapa interactivo** con OpenStreetMap + CartoDB (sin Google Maps, sin costo)
- 📍 **Lugares reales** desde OpenStreetMap via Overpass API + lugares propios en Supabase
- 🏋️ **35+ categorías deportivas** incluyendo todos los deportes olímpicos y simuladores (F1, vuelo, VR, golf, rally)
- 🔍 **Filtros por deporte** con scroll horizontal y preselección desde el explorador
- ❤️ **Favoritos** persistentes con AsyncStorage
- 📅 **Sistema de reservas** completo — selección de día, horario, confirmación y cancelación
- ⭐ **Valoración con estrellas** — rating interactivo por usuario, promedio en tiempo real desde Supabase
- 🔐 **Autenticación** con Supabase Auth (email/password, RLS por usuario)
- 🖼️ **Imágenes reales** por tipo de deporte via Unsplash API
- 🌤️ **Clima en tiempo real** en el header — Open-Meteo, sin API key, gratis
- 📆 **Pronóstico 7 días** con indicador outdoor/indoor por día
- 🤖 **IA recomendador** — chat con Groq (Llama 3.3, gratuito) con contexto de clima, hora y lugares disponibles
- ✨ **Splash screen animado** con fade + scale + dots al abrir la app

---

## 🛠️ Stack tecnológico

| Capa      | Tecnología                           |
| --------- | ------------------------------------ |
| Mobile    | React Native + Expo (SDK 55)         |
| Routing   | Expo Router (file-based)             |
| Mapas     | Leaflet.js + OpenStreetMap + CartoDB |
| Backend   | Supabase (PostgreSQL + Auth + RLS)   |
| Datos OSM | Overpass API                         |
| Imágenes  | Unsplash API                         |
| IA        | Groq API — Llama 3.3 (gratuita)      |
| Clima     | Open-Meteo API (gratuita, sin key)   |
| Estado    | React hooks + AsyncStorage           |
| Lenguaje  | TypeScript                           |

---

## 🗂️ Estructura del proyecto

sport-map-app/
├── app/
│ ├── (tabs)/
│ │ ├── index.tsx # Mapa principal + clima en tiempo real
│ │ ├── explore.tsx # Explorador por deporte (filtra el mapa)
│ │ └── profile.tsx # Perfil + favoritos
│ ├── place/[id].tsx # Detalle del lugar + rating interactivo
│ ├── booking/[id].tsx # Reserva — selección de día y horario
│ ├── my-bookings.tsx # Mis reservas + cancelar
│ ├── ai-chat.tsx # Chat IA con clima y recomendaciones
│ ├── weather.tsx # Pronóstico 7 días con outdoor/indoor
│ └── auth.tsx # Login / Registro
├── components/
│ ├── MapView.tsx # Mapa + markers + filtros + bottom sheet
│ ├── PlaceCard.tsx # Card reutilizable de lugar
│ └── SplashLoader.tsx # Animación de carga inicial
├── services/
│ ├── supabasePlaces.ts # Lugares desde Supabase
│ ├── overpass.ts # Lugares reales de OSM (radio 5km, 43 tags)
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
# Clonar el repo
git clone https://github.com/EmanuelDiazOchoa/sport-map-app.git
cd sport-map-app

# Instalar dependencias
npm install

# Correr en Expo Go
npx expo start --clear
```

### Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

EXPO_PUBLIC_GROQ_API_KEY=tu_key_aqui

La key de Groq es **gratuita** — registrate en [console.groq.com](https://console.groq.com) sin tarjeta de crédito.

Las claves de Supabase y Unsplash están hardcodeadas para simplificar el setup de demo. Para producción, moverlas también al `.env`.

### Base de datos (Supabase)

Correr el SQL en el SQL Editor de Supabase:

```sql
-- Tabla places
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

-- Tabla bookings
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

-- Tabla ratings
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

**Mapas sin costo:** Se usa Leaflet + OpenStreetMap en una WebView en lugar de `react-native-maps`, ya que Expo Go requiere Google Maps API key para Android. CartoDB Voyager como tile server (OSM directo bloqueaba por CORS/referer en WebView).

**IA gratuita:** Groq (Llama 3.3) en lugar de OpenAI — completamente gratuita sin tarjeta. La IA recibe contexto de clima actual, hora del día y la lista de lugares disponibles para dar recomendaciones relevantes.

**Clima sin API key:** Open-Meteo API — gratuita, sin registro. Usada en el header (temperatura actual), strip de pronóstico 3 días, pantalla completa de 7 días, y como contexto para la IA.

**Favoritos completos:** `useFavorites` guarda el objeto `Place[]` completo en lugar de solo IDs, para soportar lugares de OSM que no existen en Supabase.

**Datos reales:** Overpass API con 43 combinaciones de tags OSM cubre todos los deportes olímpicos y principales en un radio de 5km desde la ubicación del usuario.

**Geografía global:** El mapa funciona en cualquier ciudad del mundo — OSM y Overpass tienen datos globales. La app detecta la ubicación real del usuario independientemente del país.

---

## 📋 Roadmap

- [x] Mapa interactivo con OSM + CartoDB (sin Google Maps)
- [x] Markers por tipo de deporte con colores y emojis
- [x] Filtros por deporte + bottom sheet animado
- [x] Explorador de deportes que preselecciona filtro en el mapa
- [x] Pantalla de detalle con imagen real (Unsplash)
- [x] Favoritos persistentes con AsyncStorage
- [x] Autenticación con Supabase Auth (RLS por usuario)
- [x] Sistema de reservas completo (día + horario + cancelar)
- [x] Simuladores deportivos (F1, vuelo, rally, golf, VR, tiro)
- [x] Clima en tiempo real en header principal (Open-Meteo)
- [x] Pronóstico 7 días con indicador outdoor/indoor
- [x] IA recomendador con contexto de clima, hora y lugares (Groq, gratuito)
- [x] Splash screen animado (fade + scale + dots)
- [x] 35+ deportes olímpicos con tags OSM correctos
- [x] Sistema de valoración con estrellas (ratings en Supabase, promedio en tiempo real)
- [ ] Push notifications para recordar reservas (requiere EAS Build)
- [ ] Freemium con RevenueCat

---

## 👤 Autor

### Emanuel Díaz Ochoa

- GitHub: [@EmanuelDiazOchoa](https://github.com/EmanuelDiazOchoa)
- LinkedIn: [tu-linkedin](https://linkedin.com/in/tu-linkedin)

---

## Proyecto desarrollado como portfolio. Open to work 🚀
