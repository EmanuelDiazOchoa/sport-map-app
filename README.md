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
- 🤖 **IA recomendador** — chat inteligente que sugiere lugares según tu objetivo

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
│ │ ├── index.tsx # Mapa principal
│ │ ├── explore.tsx # Explorador por deporte
│ │ └── profile.tsx # Perfil + favoritos
│ ├── place/[id].tsx # Detalle del lugar
│ ├── booking/[id].tsx # Pantalla de reserva
│ ├── my-bookings.tsx # Mis reservas
│ └── auth.tsx # Login / Registro
├── components/
│ └── MapView.tsx # Mapa + markers + bottom sheet
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
git clone https://github.com/tu-usuario/sport-map-app.git
cd sport-map-app

# Instalar dependencias
npm install

# Correr en Expo Go
npx expo start
```

### Variables de entorno

El proyecto usa claves directamente en el código para simplificar el setup. Para producción, moverlas a `.env`:
SUPABASE_URL=<https://xxx.supabase.co>
SUPABASE_KEY=sb_publishable_xxx
UNSPLASH_KEY=xxx
ANTHROPIC_KEY=xxx

### Base de datos (Supabase)

Correr el SQL en Supabase SQL Editor:

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
```

---

## 📋 Roadmap

- [x] Mapa con OSM + CartoDB
- [x] Markers por tipo de deporte
- [x] Filtros + bottom sheet
- [x] Pantalla de detalle con imagen real
- [x] Favoritos persistentes
- [x] Autenticación con Supabase
- [x] Sistema de reservas
- [x] Simuladores deportivos
- [x] IA recomendador con clima en tiempo real
- [x] Clima en pantalla principal
- [ ] Push notifications
- [ ] Freemium con RevenueCat

---

## 👤 Autor

### Emanuel Díaz Ochoa

- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- LinkedIn: [tu-linkedin](https://linkedin.com/in/tu-linkedin)

---

Proyecto desarrollado como portfolio. Open to work 🚀
