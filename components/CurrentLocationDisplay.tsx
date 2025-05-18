import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import * as Location from 'expo-location';

// Define Address type since it's not exported from expo-location
type Address = {
  city: string | null;
  country: string | null;
  district: string | null;
  isoCountryCode: string | null;
  name: string | null;
  postalCode: string | null;
  region: string | null;
  street: string | null;
  subregion: string | null;
  timezone: string | null;
};
import { getCurrentAddress, formatAddress } from '../utils/LocationUtils';

interface CurrentLocationDisplayProps {
  onLocationReceived?: (location: { latitude: number; longitude: number; address: string }) => void;
}

const CurrentLocationDisplay: React.FC<CurrentLocationDisplayProps> = ({ onLocationReceived }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  const getLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("fetching location")
      const result = await getCurrentAddress();
      console.log("location fetched", result)

      if (result.success && result.address) {
        setAddress(result.address);
        setCoordinates(result.coordinates);

        // If callback provided, send the location data
        if (onLocationReceived && result.coordinates) {
          onLocationReceived({
            latitude: result.coordinates.latitude,
            longitude: result.coordinates.longitude,
            address: formatAddress(result.address)
          });
        }
      } else {
        setError(result.error || 'Failed to get address');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleLarge" style={styles.title}>Current Location</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              mode="contained"
              onPress={getLocation}
              style={styles.retryButton}
            >
              Retry
            </Button>
          </View>
        ) : address ? (
          <View style={styles.addressContainer}>
            <Text style={styles.addressText}>{formatAddress(address)}</Text>
            {coordinates && (
              <Text style={styles.coordinatesText}>
                {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
              </Text>
            )}
            <Button
              mode="outlined"
              onPress={getLocation}
              style={styles.refreshButton}
              icon="refresh"
            >
              Refresh
            </Button>
          </View>
        ) : (
          <View style={styles.initialContainer}>
            <Text style={styles.initialText}>Tap the button below to get your current location</Text>
            <Button
              mode="contained"
              onPress={getLocation}
              style={styles.getLocationButton}
              icon="map-marker"
            >
              Get Location
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    opacity: 0.7,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  retryButton: {
    marginTop: 10,
  },
  addressContainer: {
    padding: 5,
  },
  addressText: {
    fontSize: 16,
    marginBottom: 8,
  },
  coordinatesText: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 12,
  },
  refreshButton: {
    marginTop: 10,
  },
  initialContainer: {
    alignItems: 'center',
    padding: 15,
  },
  initialText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  getLocationButton: {
    marginTop: 10,
  }
});

export default CurrentLocationDisplay;
