// Màn hình hiển thị bản đồ các cửa hàng bằng react-native-maps
import React, { useCallback, useMemo } from 'react';
import { Alert, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// Dữ liệu cửa hàng hardcode
import storeLocations from '../data/storeLocations';

// Độ zoom mặc định cho initialRegion
const DEFAULT_DELTA = { latitudeDelta: 0.03, longitudeDelta: 0.03 };

const StoreMapScreen = () => {
  // Tính toán vùng ban đầu của map: zoom vào cửa hàng đầu tiên (nếu có)
  const initialRegion = useMemo(() => {
    const first = storeLocations && storeLocations.length > 0 ? storeLocations[0] : null;
    if (!first) {
      // Fallback khi không có dữ liệu: dùng toạ độ TP.HCM
      return {
        latitude: 10.772823,
        longitude: 106.682233,
        ...DEFAULT_DELTA,
      };
    }
    // Zoom vào cửa hàng đầu tiên
    return {
      latitude: first.latitude,
      longitude: first.longitude,
      ...DEFAULT_DELTA,
    };
  }, []);

  // Mở ứng dụng bản đồ hệ thống (Apple Maps trên iOS, Google Maps trên Android)
  // để chỉ đường đến toạ độ lat/lng của cửa hàng
  const openInMaps = useCallback((lat, lng, label) => {
    try {
      // Scheme gợi ý cho Apple Maps/Geo URI
      const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
      const latLng = `${lat},${lng}`;
      const query = Platform.OS === 'ios' ? `${encodeURIComponent(label)}@${latLng}` : `${latLng}(${encodeURIComponent(label)})`;
      const url = `${scheme}${query}`;
      Linking.openURL(url);
    } catch (e) {
      // Fallback mở Google Maps qua HTTP nếu scheme không khả dụng
      const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving`;
      Linking.openURL(gmaps).catch(() => {
        Alert.alert('Không thể mở ứng dụng bản đồ');
      });
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Bản đồ Google (provider Google) với initialRegion đã tính toán */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
      >
        {/* Vẽ các marker tương ứng từng cửa hàng */}
        {storeLocations.map((store) => (
          <Marker
            key={store.id}
            coordinate={{ latitude: store.latitude, longitude: store.longitude }}
            title={store.name}
            description={store.address}
          >
            {/* Callout hiển thị tên + địa chỉ; bấm callout để mở chỉ đường */}
            <Callout onPress={() => openInMaps(store.latitude, store.longitude, store.name)}>
              <View style={styles.callout}>
                <View style={styles.calloutTextContainer}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  <Text style={styles.storeAddress}>{store.address}</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

// StyleSheet cho màn hình bản đồ
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  callout: {
    minWidth: 220,
    padding: 8,
  },
  calloutTextContainer: {
    flexDirection: 'column',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: '#444',
  },
});

export default StoreMapScreen;


