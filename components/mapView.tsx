import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { getUserLocation } from "../services/location";
import { places } from "../services/places";

export default function CustomMapView() {
  const [region, setRegion] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const coords = await getUserLocation();

        setRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  if (!region) return <View />;

  return (
    <MapView style={styles.map} initialRegion={region}>
      {/* Usuario */}
      <Marker
        coordinate={{
          latitude: region.latitude,
          longitude: region.longitude,
        }}
        title="Estás acá"
      />

      {/* Lugares */}
      {places.map((place) => (
        <Marker
          key={place.id}
          coordinate={{
            latitude: place.latitude,
            longitude: place.longitude,
          }}
          title={place.name}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
