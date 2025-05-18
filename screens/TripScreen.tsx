import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, Alert } from 'react-native';
import { Text, Card, useTheme, TextInput, Portal, Dialog, IconButton } from 'react-native-paper';
import { useAppContext } from '../context/AppContext';
import ActionButton from '../components/ActionButton';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TripLocation } from '../types';
import { useNavigation } from '@react-navigation/native';
import NotificationService from '../services/NotificationService';

const LOCATION_TRACKING = 'location-tracking';

// Define the task for background location tracking
TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
  if (error) {
    console.error('Location tracking error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };

    // Get the active trip from AsyncStorage
    try {
      const activeTripData = await AsyncStorage.getItem('activeTrip');
      if (activeTripData) {
        const activeTrip = JSON.parse(activeTripData);

        // Process each location
        for (const location of locations) {
          // Create a TripLocation object
          const tripLocation: TripLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: new Date(location.timestamp).toISOString(),
            speed: location.coords.speed !== null ? location.coords.speed : 0,
            altitude: location.coords.altitude !== null ? location.coords.altitude : undefined
          };

          // Add to locations array
          const updatedLocations = [...(activeTrip.locations || []), tripLocation];

          // Update trip in AsyncStorage
          await AsyncStorage.setItem('activeTrip', JSON.stringify({
            ...activeTrip,
            locations: updatedLocations
          }));
        }
      }
    } catch (error) {
      console.error('Error updating trip in background:', error);
    }
  }
});

const TripScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { activeTrip, startTrip, stopTrip, addManualTrip, updateActiveTrip } = useAppContext();
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

  // Request location and notification permissions
  useEffect(() => {
    const requestPermissions = async () => {
      // Request location permissions
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
      
      // Request notification permissions
      const notificationPermission = await NotificationService.requestPermissions();
      if (!notificationPermission) {
        console.log('Notification permissions not granted');
      }
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
    // Store the current trip ID to avoid stale closures in the interval
    const currentTripId = activeTrip?.id;
    
    if (activeTrip && locationPermission) {
      console.log('Starting location tracking for trip:', currentTripId);
      startLocationTracking();
      
      // Initialize UI state from activeTrip
      if (activeTrip.distance) setDistance(activeTrip.distance);
      
      // Calculate current duration
      if (activeTrip.startTime) {
        const startTime = new Date(activeTrip.startTime).getTime();
        const currentTime = new Date().getTime();
        const currentDuration = Math.floor((currentTime - startTime) / 1000);
        setDuration(currentDuration);
      }
      
      // Show notification for ride in progress
      NotificationService.showRideProgressNotification(activeTrip);
      
      // Set up notification update interval
      const notificationInterval = setInterval(() => {
        // Use AsyncStorage to get the latest trip data to avoid stale closure issues
        AsyncStorage.getItem('activeTrip').then(tripData => {
          if (tripData) {
            const latestTrip = JSON.parse(tripData);
            if (latestTrip.id === currentTripId) {
              NotificationService.updateRideProgressNotification(latestTrip);
            }
          }
        }).catch(err => console.error('Error updating notification:', err));
      }, 30000); // Update every 30 seconds
      
      return () => {
        console.log('Cleaning up tracking for trip:', currentTripId);
        clearInterval(notificationInterval);
      };
    } else {
      stopLocationTracking();
      
      // Dismiss notification when trip is stopped
      NotificationService.dismissRideProgressNotification();
    }
  }, [activeTrip?.id, locationPermission]); // Only depend on trip ID, not the entire trip object

  const startLocationTracking = async () => {
    // Avoid starting duplicate tracking
    if (locationSubscription.current) {
      console.log('Location tracking already active, not starting again');
      return;
    }
    
    console.log('Starting location tracking');
    
    // Start location updates
    const locationOptions: Location.LocationOptions = {
      accuracy: Location.Accuracy.Highest,
      timeInterval: 5000, // Update every 5 seconds
      distanceInterval: 10, // Or every 10 meters
    };

    try {
      locationSubscription.current = await Location.watchPositionAsync(
        locationOptions,
        (location) => {
          updateLocationData(location);
        }
      );
      
      // Start a timer to update duration
      if (timerRef.current === null) {
        timerRef.current = setInterval(() => {
          AsyncStorage.getItem('activeTrip').then(tripData => {
            if (tripData) {
              const trip = JSON.parse(tripData);
              if (trip.startTime) {
                const startTime = new Date(trip.startTime).getTime();
                const currentTime = new Date().getTime();
                const newDuration = Math.floor((currentTime - startTime) / 1000); // in seconds
                setDuration(newDuration);
              }
            }
          }).catch(err => console.error('Error updating duration:', err));
        }, 1000);
      }
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
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
    // Get the latest trip data from AsyncStorage to avoid stale data
    AsyncStorage.getItem('activeTrip').then(tripData => {
      if (!tripData) return;
      
      const currentTrip = JSON.parse(tripData);
      if (!currentTrip || !currentTrip.isActive) return;
      
      // Create a TripLocation object
      const tripLocation: TripLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date(location.timestamp).toISOString(),
        speed: location.coords.speed !== null ? location.coords.speed : 0,
        altitude: location.coords.altitude !== null ? location.coords.altitude : undefined
      };
      
      // Add to locations array in active trip
      const updatedLocations = [...(currentTrip.locations || []), tripLocation];
      
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
        // Calculate new total distance
        const newDistance = currentTrip.distance + distanceInKm;
        
        // Calculate average speed from all locations with speed data
        let totalSpeed = 0;
        let speedPoints = 0;
        
        updatedLocations.forEach(loc => {
          if (loc.speed && loc.speed > 0) {
            totalSpeed += loc.speed * 3.6; // Convert m/s to km/h
            speedPoints++;
          }
        });
        
        const avgSpeed = speedPoints > 0 ? totalSpeed / speedPoints : 0;

        // Update active trip in context and AsyncStorage
        const updatedTripData = {
          distance: newDistance,
          locations: updatedLocations,
          avgSpeed: avgSpeed,
          duration: duration // Make sure duration is also updated
        };
        
        // Use the updateActiveTrip from context to update both state and AsyncStorage
        updateActiveTrip(updatedTripData);
        
        // Update notification if significant change (every 0.1 km)
        if (Math.floor(newDistance * 10) > Math.floor((newDistance - distanceInKm) * 10)) {
          NotificationService.updateRideProgressNotification({
            ...currentTrip,
            ...updatedTripData
          });
        }

        // Update UI
        setDistance(newDistance);
        setSpeed(currentCoords.speed ? currentCoords.speed * 3.6 : 0); // Convert m/s to km/h
      }

      lastLocation.current = location;
    }).catch(err => {
      console.error('Error updating location data:', err);
    });
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
        'Please grant location permission to track your ride.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Start the trip in the context (which now saves to AsyncStorage)
      await startTrip();
      console.log('Trip started and saved to local storage');

      // Reset local state
      setDistance(0);
      setDuration(0);
      setSpeed(0);
      lastLocation.current = null;
    } catch (error) {
      console.error('Error starting trip:', error);
      Alert.alert('Error', 'Failed to start trip tracking. Please try again.');
    }
  };

  const handleStopTrip = async () => {
    try {
      // Stop the trip in the context (which now saves to AsyncStorage)
      await stopTrip();
      console.log('Trip stopped and saved to local storage');
      
      // Dismiss the notification
      await NotificationService.dismissRideProgressNotification();
      
      // Reset local state
      setDistance(0);
      setDuration(0);
      setSpeed(0);
      lastLocation.current = null;
    } catch (error) {
      console.error('Error stopping trip:', error);
      Alert.alert('Error', 'Failed to save trip data. Please try again.');
    }
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
          <View style={styles.cardHeader}>
            <Text variant="headlineMedium" style={styles.title}>
              {activeTrip ? 'Ride in Progress' : 'Start a New Ride'}
            </Text>
            <IconButton 
              icon="history" 
              size={24} 
              onPress={() => navigation.navigate('TripHistory' as never)}
              iconColor={theme.colors.primary}
              style={{ margin: 0 }}
            />
          </View>

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
    padding: 10,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'left',
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
