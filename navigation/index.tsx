import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

// Import screens (we'll create these next)
import HomeScreen from '../screens/HomeScreen';
import TripScreen from '../screens/TripScreen';
import MileageScreen from '../screens/MileageScreen';
import RemindersScreen from '../screens/RemindersScreen';
import AddReminderScreen from '../screens/AddReminderScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
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
          options={{ title: 'BikeMate' }} 
        />
        <Stack.Screen 
          name="Trip" 
          component={TripScreen} 
          options={{ title: 'Track Trip' }} 
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
