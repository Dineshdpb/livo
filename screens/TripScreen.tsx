import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, Alert } from 'react-native';
import { Text, Card, useTheme, TextInput, Portal, Dialog } from 'react-native-paper';
import { useAppContext } from '../context/AppContext';
import ActionButton from '../components/ActionButton';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TRACKING = 'location-tracking';

// Define the task for background location tracking
TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
  if (error) {
    console.error('Location tracking error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    // We'll handle this in the app context
  }
});

const TripScreen = () => {
  const theme = useTheme();
  const { activeTrip, startTrip, stopTrip, addManualTrip } = useAppContext();
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [manualDistance, setManualDistance] = useState('');
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  
  // Refs for tracking
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const lastLocation = useRef<Location.LocationObject | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Request location permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'BikeMate needs location permissions to track your rides.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    };
    
    requestPermissions();
    
    return () => {
      // Clean up on unmount
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Start or resume tracking when activeTrip changes
  useEffect(() => {
    if (activeTrip && locationPermission) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
  }, [activeTrip, locationPermission]);
  
  const startLocationTracking = async () => {
    // Start location updates
    const locationOptions: Location.LocationOptions = {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 5000, // Update every 5 seconds
      distanceInterval: 10, // Or every 10 meters
    };
    
    locationSubscription.current = await Location.watchPositionAsync(
      locationOptions,
      (location) => {
        updateLocationData(location);
      }
    );
    
    // Start a timer to update duration
    timerRef.current = setInterval(() => {
      if (activeTrip) {
        const startTime = new Date(activeTrip.startTime).getTime();
        const currentTime = new Date().getTime();
        const newDuration = Math.floor((currentTime - startTime) / 1000); // in seconds
        setDuration(newDuration);
      }
    }, 1000);
  };
  
  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  const updateLocationData = (location: Location.LocationObject) => {
    if (lastLocation.current) {
      // Calculate distance between last location and current location
      const lastCoords = lastLocation.current.coords;
      const currentCoords = location.coords;
      
      const distanceInMeters = calculateDistance(
        lastCoords.latitude,
        lastCoords.longitude,
        currentCoords.latitude,
        currentCoords.longitude
      );
      
      // Convert to kilometers and add to total
      const distanceInKm = distanceInMeters / 1000;
      setDistance(prev => prev + distanceInKm);
      
      // Update speed (km/h)
      setSpeed(location.coords.speed ? location.coords.speed * 3.6 : 0);
    }
    
    // Update last location
    lastLocation.current = location;
  };
  
  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in meters
  };
  
  const handleStartTrip = async () => {
    if (!locationPermission) {
      Alert.alert(
        'Permission Required',
        'BikeMate needs location permissions to track your rides.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    await startTrip();
  };
  
  const handleStopTrip = async () => {
    await stopTrip();
    // Reset state
    setDistance(0);
    setDuration(0);
    setSpeed(0);
    lastLocation.current = null;
  };
  
  const handleAddManualTrip = async () => {
    const distanceValue = parseFloat(manualDistance);
    if (isNaN(distanceValue) || distanceValue <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid distance.');
      return;
    }
    
    await addManualTrip(distanceValue);
    setManualDistance('');
    setShowManualDialog(false);
  };
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            {activeTrip ? 'Ride in Progress' : 'Start a New Ride'}
          </Text>
          
          {activeTrip ? (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statValue}>
                  {distance.toFixed(2)}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Kilometers
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statValue}>
                  {formatDuration(duration)}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Duration
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text variant="titleLarge" style={styles.statValue}>
                  {speed.toFixed(1)}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  km/h
                </Text>
              </View>
            </View>
          ) : (
            <Text variant="bodyLarge" style={styles.instructions}>
              Track your ride distance and duration automatically using GPS.
            </Text>
          )}
        </Card.Content>
      </Card>
      
      <View style={styles.buttonContainer}>
        {activeTrip ? (
          <ActionButton
            label="Stop Ride"
            onPress={handleStopTrip}
            icon="stop-circle"
            color="#dc3545"
          />
        ) : (
          <>
            <ActionButton
              label="Start Ride"
              onPress={handleStartTrip}
              icon="play-circle"
              color={theme.colors.primary}
            />
            
            <ActionButton
              label="Add Manual Entry"
              onPress={() => setShowManualDialog(true)}
              icon="pencil"
              mode="outlined"
            />
          </>
        )}
      </View>
      
      {/* Manual Entry Dialog */}
      <Portal>
        <Dialog
          visible={showManualDialog}
          onDismiss={() => setShowManualDialog(false)}
        >
          <Dialog.Title>Manual Distance Entry</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Distance (km)"
              value={manualDistance}
              onChangeText={setManualDistance}
              keyboardType="numeric"
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <ActionButton
              label="Cancel"
              onPress={() => setShowManualDialog(false)}
              mode="text"
            />
            <ActionButton
              label="Add"
              onPress={handleAddManualTrip}
            />
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    opacity: 0.7,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 16,
  },
});

export default TripScreen;
