import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

const { width } = Dimensions.get('window');

export default function OrderMapScreen() {
  const { storeName, address, lat, lng } = useLocalSearchParams<{
    storeName: string;
    address: string;
    lat: string;
    lng: string;
  }>();

  const storeCoords = useMemo(
    () => ({
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
    }),
    [lat, lng]
  );

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });

      mapRef.current?.fitToCoordinates([storeCoords, { latitude, longitude }], {
        edgePadding: { top: 80, bottom: 80, left: 80, right: 80 },
        animated: true,
      });

      const subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 10,
        },
        (newLoc) => {
          const coords = newLoc.coords;
          const region: Region = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          };

          setUserLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });

          mapRef.current?.animateToRegion(region, 1000);
        }
      );

      return () => subscriber.remove();
    })();
  }, [storeCoords]); // ✅ 修正依賴陣列

  const openExternalMap = () => {
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${storeCoords.latitude},${storeCoords.longitude}&dirflg=w`
        : `https://www.google.com/maps/dir/?api=1&destination=${storeCoords.latitude},${storeCoords.longitude}&travelmode=walking`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          style={styles.map}
          showsUserLocation={false}
        >
          <Marker
            coordinate={storeCoords}
            title={storeName}
            description={address}
          />
          {userLocation && (
            <Marker coordinate={userLocation} title="你的目前位置">
              <View style={styles.tigerMarker}>
                <Text style={styles.tigerIcon}>🐯</Text>
              </View>
            </Marker>
          )}
        </MapView>
      </View>

      <View style={styles.infoBox}>
        <View style={styles.row}>
          <View style={styles.leftColumn}>
            <View style={styles.iconRow}>
              <Ionicons
                name="location-sharp"
                size={16}
                color="#FF6B6B"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.storeName}>{storeName}</Text>
            </View>
            <Text style={styles.address}>{address}</Text>
            <Text style={styles.time}>營業時間：11:00–20:00</Text>
          </View>
          <TouchableOpacity style={styles.navButton} onPress={openExternalMap}>
            <Ionicons
              name="navigate"
              size={16}
              color="#fff"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.navText}>導航</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f2e5',
    alignItems: 'center',
    paddingTop: 40,
  },
  mapWrapper: {
    width: width * 0.9,
    height: 500,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  map: { flex: 1 },
  infoBox: {
    marginTop: 16,
    backgroundColor: '#FFF4CC',
    padding: 16,
    width: width * 0.9,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftColumn: { flex: 1, paddingRight: 12 },
  iconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  storeName: { fontSize: 14, fontWeight: 'bold', color: '#0A6859' },
  address: { fontSize: 13, color: '#333', marginBottom: 2 },
  time: { fontSize: 12, color: '#888' },
  navButton: {
    backgroundColor: '#0A6859',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  navText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tigerMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 3,
  },
  tigerIcon: { fontSize: 20 },
});
