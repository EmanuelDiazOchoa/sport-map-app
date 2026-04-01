import { StyleSheet, View } from "react-native";
import CustomMapView from "../../components/MapView";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <CustomMapView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
