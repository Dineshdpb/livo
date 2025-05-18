import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Text, List, Switch, useTheme, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../context/AppContext';
import ActionButton from '../components/ActionButton';

const SettingsScreen = () => {
  const theme = useTheme();
  const { userStats } = useAppContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationInBackground, setLocationInBackground] = useState(true);
  
  const clearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all app data? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All data has been cleared. Please restart the app.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };
  
  const exportData = () => {
    // This would be implemented with a file export feature
    Alert.alert('Coming Soon', 'Data export feature will be available in a future update.');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <List.Section>
          <List.Subheader>Notifications</List.Subheader>
          <List.Item
            title="Enable Notifications"
            description="Receive reminders for oil changes and services"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                color={theme.colors.primary}
              />
            )}
          />
        </List.Section>
        
        <Divider />
        
        <List.Section>
          <List.Subheader>Location</List.Subheader>
          <List.Item
            title="Background Location"
            description="Allow tracking rides when app is in background"
            left={(props) => <List.Icon {...props} icon="map-marker" />}
            right={() => (
              <Switch
                value={locationInBackground}
                onValueChange={setLocationInBackground}
                color={theme.colors.primary}
              />
            )}
          />
        </List.Section>
        
        <Divider />
        
        <List.Section>
          <List.Subheader>Data Management</List.Subheader>
          <List.Item
            title="Export Data"
            description="Export your ride history and settings"
            left={(props) => <List.Icon {...props} icon="export" />}
            onPress={exportData}
          />
          <List.Item
            title="Clear All Data"
            description="Delete all app data and reset to defaults"
            left={(props) => <List.Icon {...props} icon="delete" color="#dc3545" />}
            onPress={clearAllData}
          />
        </List.Section>
        
        <Divider />
        
        <List.Section>
          <List.Subheader>App Information</List.Subheader>
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <List.Item
            title="Total Distance Tracked"
            description={`${userStats.totalDistance.toFixed(1)} km`}
            left={(props) => <List.Icon {...props} icon="bike" />}
          />
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SettingsScreen;
