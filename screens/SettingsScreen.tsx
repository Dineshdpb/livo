import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, Platform, Alert } from 'react-native';
import { Text, List, Switch, useTheme, Divider, Surface } from 'react-native-paper';
import { colors } from '../utils/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../context/AppContext';
import ActionButton from '../components/ActionButton';

const SettingsScreen = () => {
  const theme = useTheme();
  
  const customStyles = {
    headerText: {
      color: colors.primary,
      fontWeight: '700' as const,
    },
    itemTitle: {
      color: colors.textPrimary,
      fontWeight: '600' as const,
    },
    itemDescription: {
      color: colors.textSecondary,
    }
  };

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
      <View style={styles.header}>
        <Text style={[styles.headerTitle, customStyles.headerText]}>Settings</Text>
      </View>
      
      <ScrollView style={styles.scrollContent}>
        <List.Section>
          <Text style={[styles.sectionHeader, customStyles.headerText]}>Notifications</Text>
          <Surface style={styles.listItem}>
            <List.Item
              title="Enable Notifications"
              description="Receive reminders for oil changes and services"
              titleStyle={customStyles.itemTitle}
              descriptionStyle={customStyles.itemDescription}
              left={(props) => <List.Icon {...props} icon="bell-outline" color={colors.primary} />}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  color={colors.primary}
                />
              )}
            />
          </Surface>
        </List.Section>
        
        <Divider />
        
        <List.Section>
          <Text style={[styles.sectionHeader, customStyles.headerText]}>Location</Text>
          <Surface style={styles.listItem}>
            <List.Item
              title="Background Location"
              description="Allow tracking rides when app is in background"
              titleStyle={customStyles.itemTitle}
              descriptionStyle={customStyles.itemDescription}
              left={(props) => <List.Icon {...props} icon="map-marker-outline" color={colors.primary} />}
              right={() => (
                <Switch
                  value={locationInBackground}
                  onValueChange={setLocationInBackground}
                  color={colors.primary}
                />
              )}
            />
          </Surface>
        </List.Section>
        
        <Divider />
        
        <List.Section>
          <Text style={[styles.sectionHeader, customStyles.headerText]}>Data Management</Text>
          <Surface style={styles.listItem}>
            <List.Item
              title="Export Data"
              description="Export your ride history and settings"
              titleStyle={customStyles.itemTitle}
              descriptionStyle={customStyles.itemDescription}
              left={(props) => <List.Icon {...props} icon="export" color={colors.primary} />}
              onPress={exportData}
            />
          </Surface>
          
          <Surface style={[styles.listItem, { marginTop: 8 }]}>
            <List.Item
              title="Clear All Data"
              description="Delete all app data and reset to defaults"
              titleStyle={customStyles.itemTitle}
              descriptionStyle={customStyles.itemDescription}
              left={(props) => <List.Icon {...props} icon="delete-outline" color={colors.error} />}
              onPress={clearAllData}
            />
          </Surface>
        </List.Section>
        
        <Divider />
        
        <List.Section>
          <Text style={[styles.sectionHeader, customStyles.headerText]}>App Information</Text>
          <Surface style={styles.listItem}>
            <List.Item
              title="Version"
              description="1.0.0"
              titleStyle={customStyles.itemTitle}
              descriptionStyle={customStyles.itemDescription}
              left={(props) => <List.Icon {...props} icon="information-outline" color={colors.primary} />}
            />
          </Surface>
          
          <Surface style={[styles.listItem, { marginTop: 8 }]}>
            <List.Item
              title="Total Distance Tracked"
              description={`${userStats.totalDistance.toFixed(1)} km`}
              titleStyle={customStyles.itemTitle}
              descriptionStyle={customStyles.itemDescription}
              left={(props) => <List.Icon {...props} icon="bike" color={colors.primary} />}
            />
          </Surface>
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Consistent background color
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.surface, // Using theme surface color
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    fontSize: 28,
    marginVertical: 8,
  },
  scrollContent: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 18,
    marginVertical: 12,
    marginLeft: 8,
  },
  sectionDivider: {
    height: 16,
  },
  listItem: {
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: colors.card, // Using card color for better contrast
    // iOS shadows
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});

export default SettingsScreen;
