import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Place } from "../types/place";

const KEY = "favorites_v2";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Place[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((data) => {
      if (data) setFavorites(JSON.parse(data));
    });
  }, []);

  const save = async (places: Place[]) => {
    setFavorites(places);
    await AsyncStorage.setItem(KEY, JSON.stringify(places));
  };

  const toggle = (place: Place) => {
    const exists = favorites.some((f) => f.id === place.id);
    const updated = exists
      ? favorites.filter((f) => f.id !== place.id)
      : [...favorites, place];
    save(updated);
  };

  const isFavorite = (id: string) => favorites.some((f) => f.id === id);

  return { favorites, toggle, isFavorite };
}
