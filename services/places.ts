import { Place } from "../types/place";

export const places: Place[] = [
  {
    id: "1",
    name: "Plaza Santos Lugares",
    latitude: -34.602,
    longitude: -58.564,
    type: "running",
    description:
      "Circuito de running con sombra, ideal para entrenar mañana y tarde.",
    rating: 4.5,
    address: "Santos Lugares, Tres de Febrero",
  },
  {
    id: "2",
    name: "Cancha de Pádel",
    latitude: -34.605,
    longitude: -58.567,
    type: "padel",
    description:
      "Canchas de pádel techadas con iluminación nocturna. Alquiler por hora.",
    rating: 4.2,
    address: "Av. San Martín, Santos Lugares",
  },
  {
    id: "3",
    name: "Gym Aire Libre",
    latitude: -34.6005,
    longitude: -58.561,
    type: "gym",
    description:
      "Equipamiento de calistenia y musculación al aire libre. Entrada libre.",
    rating: 4.8,
    address: "Parque Municipal, Santos Lugares",
  },
];
