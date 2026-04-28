import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SPORT_ICONS } from "../constants/sportIcons";

type Props = {
  type: string;
  size?: number;
  color?: string;
};

export default function SportIcon({
  type,
  size = 24,
  color = "#374151",
}: Props) {
  const iconName = SPORT_ICONS[type] ?? "map-marker";
  return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
}
