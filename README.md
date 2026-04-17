# 🏟️ SportMap

**Explorá y reservá espacios deportivos cerca tuyo.**

SportMap es una app mobile desarrollada con React Native + Expo que combina geolocalización, mapas interactivos, inteligencia artificial y un sistema de reservas completo. Pensada como proyecto de portfolio para demostrar habilidades full-stack en desarrollo móvil.

---

## 📱 Screenshots

> _Mapa con markers / Detalle del lugar / Reservas / Perfil_

---

## ✨ Features

- 🗺️ **Mapa interactivo** con OpenStreetMap + CartoDB (sin Google Maps, sin costo)
- 📍 **Lugares reales** desde OpenStreetMap via API Overpass + lugares propios en Supabase
- 🏎️ **25+ categorías deportivas** incluyendo simuladores (F1, vuelo, VR, golf, rally)
- 🔍 **Filtros por deporte** con scroll horizontal
- ❤️ **Favoritos** persistentes con AsyncStorage
- 📅 **Sistema de reservas** completo con selección de día y horario
- 🔐 **Autenticación** con Supabase Auth (email/password)
- 🖼️ **Imágenes reales** por tipo de lugar via Unsplash API
- 🌤️ **Clima en tiempo real** en el header — sin API key, gratis
- 🤖 **IA recomendador** — chat inteligente con contexto de clima, hora del día y lugares disponibles

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
| IA        | Groq API (Llama 3.3 — gratuito)      |
| Clima     | Open-Meteo API (gratuita, sin key)   |
| Estado    | React hooks + AsyncStorage           |
| Lenguaje  | TypeScript                           |

---

## 🗂️ Estructura del proyecto

sport-map-app/
├── app/
│ ├── (tabs)/
│ │ ├── index.tsx # Mapa principal + clima en tiempo real
│ │ ├── explore.tsx # Explorador por deporte
│ │ └── profile.tsx # Perfil + favoritos
│ ├── place/[id].tsx # Detalle del lugar
│ ├── booking/[id].tsx # Pantalla de reserva
│ ├── my-bookings.tsx # Mis reservas
│ ├── ai-chat.tsx # Chat IA con clima y recomendaciones
│ └── auth.tsx # Login / Registro
├── components/
│ ├── MapView.tsx # Mapa + markers + filtros + bottom sheet
│ └── PlaceCard.tsx # Card reutilizable de lugar
├── services/
│ ├── supabasePlaces.ts # Lugares desde Supabase
│ ├── overpass.ts # Lugares reales de OSM
│ ├── bookings.ts # CRUD de reservas
│ └── unsplash.ts # Imágenes por categoría
├── hooks/
│ ├── useAuth.ts # Autenticación
│ └── useFavorites.ts # Favoritos persistentes
├── types/
│ └── place.ts # Tipos TypeScript
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
La key de Groq es **gratuita** — registrate en [console.groq.com](https://console.groq.com) sin tarjeta de crédito.

El resto de las claves (Supabase, Unsplash) están hardcodeadas para simplificar el setup de demo. Para producción, moverlas también al `.env`.

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

-- RLS bookings
alter table bookings enable row level security;
create policy "Users see own bookings" on bookings
  for all using (auth.uid() = user_id);
```

---

## 📋 Roadmap

- [x] Mapa con OSM + CartoDB (sin Google Maps)
- [x] Markers por tipo de deporte con colores y emojis
- [x] Filtros por deporte + bottom sheet animado
- [x] Pantalla de detalle con imagen real (Unsplash)
- [x] Favoritos persistentes con AsyncStorage
- [x] Autenticación con Supabase Auth
- [x] Sistema de reservas completo (día + horario + cancelar)
- [x] Simuladores deportivos (F1, vuelo, rally, golf, VR, tiro)
- [x] Clima en tiempo real en header principal (Open-Meteo)
- [x] IA recomendador con contexto de clima, hora y lugares
- [ ] Push notifications para recordar reservas
- [ ] Freemium con RevenueCat

---

## 👤 Autor

Emanuel Díaz Ochoa

- GitHub: [@EmanuelDiazOchoa](https://github.com/EmanuelDiazOchoa)
- LinkedIn: [tu-linkedin](https://linkedin.com/in/tu-linkedin)

---

## Proyecto desarrollado como portfolio. Open to work 🚀
