const UNSPLASH_KEY = "cvfYR4tYt8ZwbIUBmQzWvxIeFHDIklt2JXJG39z0mqA";

const QUERIES: Record<string, string> = {
  running: "running park outdoor",
  padel: "padel court sport",
  gym: "outdoor gym calisthenics",
};

const cache = new Map<string, string>();

export async function getPlaceImage(type: string): Promise<string> {
  if (cache.has(type)) return cache.get(type)!;

  const query = QUERIES[type] ?? "sport";
  const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${UNSPLASH_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const imageUrl = data?.urls?.regular ?? getFallback(type);
    cache.set(type, imageUrl);
    return imageUrl;
  } catch {
    return getFallback(type);
  }
}

function getFallback(type: string): string {
  const fallbacks: Record<string, string> = {
    running:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    padel: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800",
    gym: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
  };
  return fallbacks[type] ?? fallbacks.running;
}
