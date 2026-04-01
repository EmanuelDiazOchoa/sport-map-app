export type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: "running" | "padel" | "gym";
  description?: string;
  rating?: number;
  address?: string;
};
