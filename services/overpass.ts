import { Place } from "../types/place";

const TAG_QUERIES = [
  { key: "leisure", value: "pitch", type: "football" },
  { key: "leisure", value: "park", type: "running" },
  { key: "leisure", value: "fitness_station", type: "gym" },
  { key: "leisure", value: "swimming_pool", type: "swimming" },
  { key: "leisure", value: "track", type: "athletics" },
  { key: "leisure", value: "skateboard_park", type: "skateboarding" },
  { key: "amenity", value: "gym", type: "gym" },
  { key: "amenity", value: "swimming_pool", type: "swimming" },
  { key: "sport", value: "padel", type: "padel" },
  { key: "sport", value: "tennis", type: "tennis" },
  { key: "sport", value: "soccer", type: "football" },
  { key: "sport", value: "football", type: "football" },
  { key: "sport", value: "basketball", type: "basketball" },
  { key: "sport", value: "volleyball", type: "volleyball" },
  { key: "sport", value: "cycling", type: "cycling" },
  { key: "sport", value: "hockey", type: "hockey" },
  { key: "sport", value: "rugby", type: "rugby" },
  { key: "sport", value: "boxing", type: "boxing" },
  { key: "sport", value: "martial_arts", type: "martial_arts" },
  { key: "sport", value: "athletics", type: "athletics" },
  { key: "sport", value: "running", type: "running" },
  { key: "sport", value: "climbing", type: "climbing" },
  { key: "sport", value: "skateboard", type: "skateboarding" },
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
  const sport = tags.sport;
  const leisure = tags.leisure;
  const amenity = tags.amenity;

  if (sport === "padel") return "padel";
  if (sport === "tennis") return "tennis";
  if (sport === "soccer" || sport === "football") return "football";
  if (sport === "basketball") return "basketball";
  if (sport === "volleyball") return "volleyball";
  if (sport === "cycling") return "cycling";
  if (sport === "hockey") return "hockey";
  if (sport === "rugby") return "rugby";
  if (sport === "boxing") return "boxing";
  if (sport === "martial_arts") return "martial_arts";
  if (sport === "athletics" || leisure === "track") return "athletics";
  if (sport === "running" || leisure === "park") return "running";
  if (sport === "climbing") return "climbing";
  if (sport === "skateboard" || leisure === "skateboard_park")
    return "skateboarding";
  if (leisure === "fitness_station" || amenity === "gym") return "gym";
  if (leisure === "swimming_pool" || amenity === "swimming_pool")
    return "swimming";
  if (leisure === "pitch") return "football";
  return "other";
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

    const text = await res.text();
    if (!text.startsWith("{") && !text.startsWith("[")) {
      console.warn(
        "Overpass respondió con formato inesperado, usando fallback",
      );
      return [];
    }

    const json = JSON.parse(text);

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
