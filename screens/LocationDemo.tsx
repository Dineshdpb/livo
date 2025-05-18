import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import CurrentLocationDisplay from '../components/CurrentLocationDisplay';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

const LocationDemo = () => {
  const theme = useTheme();
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  const handleLocationReceived = (location: LocationData) => {
    setLocationData(location);
    console.log('Location received:', location);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text variant="headlineMedium" style={styles.header}>Location Demo</Text>
        
        {!showDemo ? (
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text style={styles.infoText}>
                This is a standalone demo to show how to get a user's current location address.
                It won't affect any existing functionality in the app.
              </Text>
              <Button 
                mode="contained" 
                onPress={() => setShowDemo(true)}
                style={styles.demoButton}
              >
                Show Location Demo
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <>
            <CurrentLocationDisplay onLocationReceived={handleLocationReceived} />
            
            {locationData && (
              <Card style={styles.dataCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.dataTitle}>Location Details</Text>
                  <Text style={styles.dataLabel}>Address:</Text>
                  <Text style={styles.dataValue}>{locationData.address}</Text>
                  
                  <Text style={styles.dataLabel}>Coordinates:</Text>
                  <Text style={styles.dataValue}>
                    Latitude: {locationData.latitude.toFixed(6)}
                  </Text>
                  <Text style={styles.dataValue}>
                    Longitude: {locationData.longitude.toFixed(6)}
                  </Text>
                </Card.Content>
              </Card>
            )}
            
            <Card style={styles.infoCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.infoTitle}>How It Works</Text>
                <Text style={styles.infoText}>
                  1. The app requests location permissions
                </Text>
                <Text style={styles.infoText}>
                  2. It gets the current coordinates using GPS
                </Text>
                <Text style={styles.infoText}>
                  3. It uses reverse geocoding to convert coordinates to an address
                </Text>
                <Text style={styles.infoText}>
                  4. The formatted address is displayed to the user
                </Text>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowDemo(false)}
                  style={styles.hideButton}
                >
                  Hide Demo
                </Button>
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  demoButton: {
    marginTop: 16,
  },
  hideButton: {
    marginTop: 16,
  },
  dataCard: {
    marginVertical: 10,
    borderRadius: 8,
  },
  dataTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dataLabel: {
    fontWeight: '500',
    marginTop: 8,
    opacity: 0.7,
  },
  dataValue: {
    marginBottom: 4,
  },
  infoCard: {
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    marginBottom: 10,
    lineHeight: 20,
  },
});

export default LocationDemo;
