import React, { useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import * as Notifications from 'expo-notifications';
import { AppState, AppStateStatus } from 'react-native';

// Import screens (we'll create these next)
import HomeScreen from '../screens/HomeScreen';
import TripScreen from '../screens/TripScreen';
import TripHistoryScreen from '../screens/TripHistoryScreen';
import MileageScreen from '../screens/MileageScreen';
import RemindersScreen from '../screens/RemindersScreen';
import AddReminderScreen from '../screens/AddReminderScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  // Create a navigation reference to use for notification navigation
  const navigationRef = useRef(null);
  const appState = useRef(AppState.currentState);
  
  // Set up notification response handler and app state tracking
  useEffect(() => {
    // Handle notification taps
    const notificationSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('Notification tapped:', data);
      
      // If this is a ride notification, navigate to Trip screen
      if (data.tripId && navigationRef.current) {
        // @ts-ignore - We know navigationRef.current has navigate method
        navigationRef.current.navigate('Trip');
      }
    });
    
    // Handle app state changes
    const appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // Check if app is coming to the foreground
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
        
        // Check for active notifications
        Notifications.getPresentedNotificationsAsync().then(notifications => {
          const rideNotification = notifications.find(n => n.request.identifier === 'ride-progress');
          if (rideNotification && navigationRef.current) {
            console.log('Found active ride notification, navigating to Trip screen');
            // @ts-ignore - We know navigationRef.current has navigate method
            navigationRef.current.navigate('Trip');
          }
        });
      }
      appState.current = nextAppState;
    });
    
    return () => {
      notificationSubscription.remove();
      appStateSubscription.remove();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1E90FF', // Primary color
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ 
            title: 'BikeMate',
            headerShown: false // Hide the default header to avoid duplication
          }} 
        />
        <Stack.Screen 
          name="Trip" 
          component={TripScreen} 
          options={{ title: 'Track Trip' }} 
        />
        <Stack.Screen 
          name="TripHistory" 
          component={TripHistoryScreen} 
          options={{ title: 'Trip History' }} 
        />
        <Stack.Screen 
          name="Mileage" 
          component={MileageScreen} 
          options={{ title: 'Mileage Calculator' }} 
        />
        <Stack.Screen 
          name="Reminders" 
          component={RemindersScreen} 
          options={{ title: 'Service Reminders' }} 
        />
        <Stack.Screen 
          name="AddReminder" 
          component={AddReminderScreen} 
          options={{ title: 'Add Reminder' }} 
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Settings' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
