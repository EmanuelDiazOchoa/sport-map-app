export type SportType =
  | "running"
  | "padel"
  | "gym"
  | "football"
  | "basketball"
  | "tennis"
  | "swimming"
  | "volleyball"
  | "cycling"
  | "hockey"
  | "rugby"
  | "boxing"
  | "martial_arts"
  | "athletics"
  | "crossfit"
  | "climbing"
  | "skateboarding"
  | "other";

export type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: SportType;
  description?: string;
  rating?: number;
  address?: string;
  schedule?: string;
  price?: string;
  phone?: string;
};
