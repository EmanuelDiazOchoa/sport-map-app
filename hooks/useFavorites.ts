import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const KEY = "favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((data) => {
      if (data) setFavorites(JSON.parse(data));
    });
  }, []);

  const save = async (ids: string[]) => {
    setFavorites(ids);
    await AsyncStorage.setItem(KEY, JSON.stringify(ids));
  };

  const toggle = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    save(updated);
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return { favorites, toggle, isFavorite };
}
