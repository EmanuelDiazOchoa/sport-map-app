import { Place } from "../types/place";

const TAG_QUERIES = [
  { key: "leisure", value: "pitch", type: "football" },
  { key: "leisure", value: "park", type: "running" },
  { key: "leisure", value: "fitness_station", type: "gym" },
  { key: "leisure", value: "swimming_pool", type: "swimming" },
  { key: "leisure", value: "track", type: "athletics" },
  { key: "leisure", value: "skateboard_park", type: "skateboarding" },
  { key: "leisure", value: "sports_centre", type: "gym" },
  { key: "leisure", value: "stadium", type: "athletics" },
  { key: "amenity", value: "gym", type: "gym" },
  { key: "amenity", value: "swimming_pool", type: "swimming" },
  { key: "amenity", value: "sports_centre", type: "gym" },
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
  { key: "sport", value: "handball", type: "handball" },
  { key: "sport", value: "table_tennis", type: "table_tennis" },
  { key: "sport", value: "badminton", type: "badminton" },
  { key: "sport", value: "rowing", type: "rowing" },
  { key: "sport", value: "canoe", type: "kayak" },
  { key: "sport", value: "kayak", type: "kayak" },
  { key: "sport", value: "wrestling", type: "wrestling" },
  { key: "sport", value: "judo", type: "judo" },
  { key: "sport", value: "taekwondo", type: "taekwondo" },
  { key: "sport", value: "fencing", type: "fencing" },
  { key: "sport", value: "archery", type: "archery" },
  { key: "sport", value: "weightlifting", type: "weightlifting" },
  { key: "sport", value: "gymnastics", type: "gymnastics" },
  { key: "sport", value: "triathlon", type: "triathlon" },
  { key: "sport", value: "equestrian", type: "equestrian" },
  { key: "sport", value: "swimming", type: "swimming" },
  { key: "sport", value: "multi", type: "gym" },
];

function buildQuery(lat: number, lng: number, radius = 8000): string {
  const filters = TAG_QUERIES.map(
    ({ key, value }) => `
    node["${key}"="${value}"](around:${radius},${lat},${lng});
    way["${key}"="${value}"](around:${radius},${lat},${lng});
    relation["${key}"="${value}"](around:${radius},${lat},${lng});
  `,
  ).join("\n");
  return `[out:json][timeout:30];(${filters});out center;`;
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
  if (sport === "judo") return "judo";
  if (sport === "taekwondo") return "taekwondo";
  if (sport === "wrestling") return "wrestling";
  if (sport === "fencing") return "fencing";
  if (sport === "archery") return "archery";
  if (sport === "weightlifting") return "weightlifting";
  if (sport === "gymnastics") return "gymnastics";
  if (sport === "triathlon") return "triathlon";
  if (sport === "equestrian") return "equestrian";
  if (sport === "handball") return "handball";
  if (sport === "table_tennis") return "table_tennis";
  if (sport === "badminton") return "badminton";
  if (sport === "rowing") return "rowing";
  if (sport === "canoe" || sport === "kayak") return "kayak";
  if (sport === "martial_arts") return "martial_arts";
  if (sport === "athletics" || leisure === "track") return "athletics";
  if (sport === "running" || leisure === "park") return "running";
  if (sport === "climbing") return "climbing";
  if (sport === "skateboard" || leisure === "skateboard_park")
    return "skateboarding";
  if (
    sport === "swimming" ||
    amenity === "swimming_pool" ||
    leisure === "swimming_pool"
  )
    return "swimming";
  if (
    sport === "multi" ||
    leisure === "sports_centre" ||
    amenity === "sports_centre" ||
    leisure === "fitness_station" ||
    amenity === "gym"
  )
    return "gym";
  if (leisure === "pitch") return "football";
  if (leisure === "stadium") return "athletics";
  return "other";
}

function inferName(tags: any, type: Place["type"]): string {
  if (tags.name) return tags.name;
  if (tags["name:es"]) return tags["name:es"];

  const defaults: Partial<Record<Place["type"], string>> = {
    running: "Espacio para running",
    padel: "Cancha de pádel",
    gym: "Gimnasio / Centro deportivo",
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
    handball: "Cancha de handball",
    table_tennis: "Mesa de ping pong",
    badminton: "Cancha de bádminton",
    rowing: "Club de remo",
    kayak: "Club de canotaje",
    wrestling: "Sala de lucha",
    judo: "Dojo de judo",
    taekwondo: "Dojo de taekwondo",
    fencing: "Sala de esgrima",
    archery: "Campo de tiro con arco",
    weightlifting: "Sala de halterofilia",
    gymnastics: "Gimnasio artístico",
    triathlon: "Club de triatlón",
    equestrian: "Club hípico",
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
  const SERVERS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];

  for (const server of SERVERS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(server, {
        method: "POST",
        body: buildQuery(lat, lng),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const text = await res.text();
      if (!text.startsWith("{") && !text.startsWith("[")) continue;

      const json = JSON.parse(text);

      const places: Place[] = json.elements
        .filter((el: any) => {
          const lat = el.lat ?? el.center?.lat;
          const lon = el.lon ?? el.center?.lon;
          return lat && lon;
        })
        .map((el: any): Place => {
          const tags = el.tags ?? {};
          const type = inferType(tags);
          return {
            id: `osm-${el.id}`,
            name: inferName(tags, type),
            latitude: el.lat ?? el.center.lat,
            longitude: el.lon ?? el.center.lon,
            type,
            address: tags["addr:street"]
              ? `${tags["addr:street"]} ${tags["addr:housenumber"] ?? ""}`.trim()
              : undefined,
            description: tags.description ?? undefined,
          };
        });

      console.log(
        `Overpass: ${places.length} lugares cargados desde ${server}`,
      );
      return dedup(places);
    } catch (err) {
      console.warn(`Servidor ${server} falló, probando siguiente...`);
      continue;
    }
  }
  console.warn("Todos los servidores Overpass fallaron");
  return [];
}
