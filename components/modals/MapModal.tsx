import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { GlassModal } from "@/components/GlassModal";
import { useAppState } from "@/contexts/AppStateContext";
import { X, MapPin } from "lucide-react-native";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

interface MapModalProps {
  visible: boolean;
  onClose: () => void;
}

export function MapModal({ visible, onClose }: MapModalProps) {
  const { currentTheme, t } = useAppState();
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      requestLocation();
    }
  }, [visible]);

  const requestLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      if (Platform.OS === "web") {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
              setLoading(false);
            },
            (error) => {
              console.error("Geolocation error:", error);
              setError("Unable to get location");
              setLoading(false);
            }
          );
        } else {
          setError("Geolocation not supported");
          setLoading(false);
        }
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Location permission denied");
          setLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        setLoading(false);
      }
    } catch (err) {
      console.error("Location error:", err);
      setError("Failed to get location");
      setLoading(false);
    }
  };

  return (
    <GlassModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: currentTheme.accent + "30" },
              ]}
            >
              <MapPin size={20} color={currentTheme.accent} />
            </View>
            <Text style={styles.title}>{t.yourLocation || "Your Location"}</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <X size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>

        <View style={styles.mapContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={currentTheme.accent} />
              <Text style={styles.loadingText}>
                {t.loadingLocation || "Getting your location..."}
              </Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={[
                  styles.retryButton,
                  { backgroundColor: currentTheme.accent + "30" },
                ]}
                onPress={requestLocation}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.retryText, { color: currentTheme.accent }]}
                >
                  {t.retry || "Retry"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && location && (
            <MapView
              style={styles.map}
              provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation
              showsMyLocationButton
            >
              <Marker
                coordinate={location}
                title={t.youAreHere || "You are here"}
              />
            </MapView>
          )}
        </View>

        <View style={styles.infoContainer}>
          {location && (
            <>
              <Text style={styles.infoLabel}>
                {t.coordinates || "Coordinates"}:
              </Text>
              <Text style={styles.infoText}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
            </>
          )}
        </View>
      </View>
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  mapContainer: {
    height: 400,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "500" as const,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 20,
  },
  errorText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "500" as const,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    gap: 8,
  },
  infoLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "500" as const,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600" as const,
  },
});
