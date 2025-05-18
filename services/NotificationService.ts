import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Trip } from '../types';

// Configure notifications to show when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Notification channel for Android
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('ride-tracking', {
    name: 'Ride Tracking',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#1E90FF',
  });
}

class NotificationService {
  // Request permissions
  static async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  }
  
  // Show ride in progress notification
  static async showRideProgressNotification(trip: Trip) {
    // Calculate time elapsed
    const startTime = new Date(trip.startTime).getTime();
    const currentTime = new Date().getTime();
    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
    
    // Format duration
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Format speed
    const speed = trip.avgSpeed ? `${trip.avgSpeed.toFixed(1)} km/h` : 'Calculating...';
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Ride in Progress',
        body: `Distance: ${trip.distance.toFixed(2)} km | Time: ${formattedDuration} | Speed: ${speed}`,
        data: { tripId: trip.id },
        autoDismiss: false,
        sticky: true,
      },
      trigger: null, // Immediate notification
      identifier: 'ride-progress', // Use a consistent ID to update the same notification
    });
  }
  
  // Update ride progress notification
  static async updateRideProgressNotification(trip: Trip) {
    // Cancel existing notification
    await Notifications.cancelScheduledNotificationAsync('ride-progress');
    
    // Show updated notification
    await this.showRideProgressNotification(trip);
  }
  
  // Dismiss ride progress notification
  static async dismissRideProgressNotification() {
    await Notifications.cancelScheduledNotificationAsync('ride-progress');
  }
}

export default NotificationService;
