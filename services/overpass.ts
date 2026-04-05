import { Place } from "../types/place";

const TAG_QUERIES = [
  { key: "leisure", value: "pitch", type: "padel" },
  { key: "leisure", value: "park", type: "running" },
  { key: "leisure", value: "fitness_station", type: "gym" },
  { key: "amenity", value: "gym", type: "gym" },
  { key: "sport", value: "padel", type: "padel" },
  { key: "sport", value: "tennis", type: "padel" },
];

function buildQuery(lat: number, lng: number, radius = 2000): string {
  const filters = TAG_QUERIES.map(
    ({ key, value }) => `
    node["${key}"="${value}"](around:${radius},${lat},${lng});
    way["${key}"="${value}"](around:${radius},${lat},${lng});
  `,
  ).join("\n");

  return `[out:json][timeout:15];(${filters});out center;`;
}

function inferType(tags: any): Place["type"] {
  if (tags.sport === "padel" || tags.sport === "tennis") return "padel";
  if (tags.leisure === "park" || tags.sport === "running") return "running";
  return "gym";
}

function inferName(tags: any, type: Place["type"]): string {
  if (tags.name) return tags.name;
  if (tags["name:es"]) return tags["name:es"];

  const defaults: Partial<Record<Place["type"], string>> = {
    running: "Espacio para running",
    padel: "Cancha deportiva",
    gym: "Gimnasio al aire libre",
    football: "Cancha de fútbol",
    basketball: "Cancha de básquet",
    tennis: "Cancha de tenis",
    swimming: "Pileta / natación",
    volleyball: "Cancha de vóley",
    cycling: "Circuito de ciclismo",
    hockey: "Cancha de hockey",
    rugby: "Cancha de rugby",
    boxing: "Gimnasio de boxeo",
    martial_arts: "Dojo / artes marciales",
    athletics: "Pista de atletismo",
    crossfit: "Box de crossfit",
    climbing: "Rocódromo",
    skateboarding: "Skate park",
    other: "Espacio deportivo",
  };

  return defaults[type] ?? "Espacio deportivo";
}

function dedup(places: Place[]): Place[] {
  const seen = new Set<string>();
  return places.filter((p) => {
    const key = `${p.latitude.toFixed(4)},${p.longitude.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
): Promise<Place[]> {
  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: buildQuery(lat, lng),
    });
    const json = await res.json();

    const places: Place[] = json.elements
      .filter(
        (el: any) => (el.lat ?? el.center?.lat) && (el.lon ?? el.center?.lon),
      )
      .map((el: any): Place => {
        const tags = el.tags ?? {};
        const type = inferType(tags);
        return {
          id: `osm-${el.id}`,
          name: inferName(tags, type),
          latitude: el.lat ?? el.center.lat,
          longitude: el.lon ?? el.center.lon,
          type,
          address: tags["addr:street"] ?? undefined,
          description: tags.description ?? undefined,
        };
      });

    return dedup(places);
  } catch (err) {
    console.error("Overpass error:", err);
    return [];
  }
}
