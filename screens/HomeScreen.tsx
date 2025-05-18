import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Text, useTheme, Surface, Divider } from 'react-native-paper';
import { colors } from '../utils/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAppContext } from '../context/AppContext';
import StatsCard from '../components/StatsCard';
import ActionButton from '../components/ActionButton';
import LocationDemo from './LocationDemo';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const [showLocationDemo, setShowLocationDemo] = useState(false);
  const theme = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // Define custom styles that depend on theme
  const customStyles = {
    headerText: {
      color: colors.primary,
      fontWeight: '700' as const,
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontWeight: '600' as const,
      fontSize: 18,
      marginBottom: 12,
      marginLeft: 8,
    }
  };
  const { userStats, activeTrip, reminders } = useAppContext();

  // Find the next due reminder
  const getNextDueReminder = () => {
    const activeReminders = reminders.filter(r => r.isActive);
    if (activeReminders.length === 0) return null;

    // Sort by date if available
    const dateReminders = activeReminders
      .filter(r => r.triggerDate)
      .sort((a, b) => {
        if (!a.triggerDate || !b.triggerDate) return 0;
        return new Date(a.triggerDate).getTime() - new Date(b.triggerDate).getTime();
      });

    // Sort by distance if available
    const distanceReminders = activeReminders
      .filter(r => r.triggerDistance)
      .sort((a, b) => {
        if (!a.triggerDistance || !b.triggerDistance) return 0;
        return a.triggerDistance - b.triggerDistance;
      });

    // Return the first due reminder (by date or distance)
    return dateReminders[0] || distanceReminders[0] || null;
  };

  const nextReminder = getNextDueReminder();

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom header without navigation title to avoid duplication */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, customStyles.headerText]}>BikeMate</Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        <Text style={customStyles.sectionTitle}>Analytics</Text>
        <View style={styles.statsContainer}>
          <StatsCard
            title="Total Distance"
            value={`${userStats.totalDistance.toFixed(1)} km`}
            icon="map-marker-distance"
            color={colors.primary}
          />
          <StatsCard
            title="Today's Distance"
            value={`${userStats.todayDistance.toFixed(1)} km`}
            icon="bike"
            color={colors.secondary}
          />
          <StatsCard
            title="Last Mileage"
            value={userStats.lastMileage ? `${userStats.lastMileage.toFixed(1)} km/l` : "N/A"}
            icon="gas-station"
            color={colors.accent}
          />
        </View>

        {nextReminder && (
          <>
            <Divider style={styles.divider} />
            <Text style={customStyles.sectionTitle}>Next Reminder</Text>
            <View style={styles.reminderContainer}>
              <Text variant="titleMedium" style={styles.reminderTitle}>
                {nextReminder.title}
              </Text>
              {nextReminder.description && (
                <Text variant="bodyMedium" style={styles.reminderDescription}>
                  {nextReminder.description}
                </Text>
              )}
              <ActionButton
                label="View All Reminders"
                onPress={() => navigation.navigate('Reminders')}

                icon="bell"
              />
            </View>
          </>
        )}

        <Text style={customStyles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <ActionButton
            label={activeTrip ? "Continue Ride" : "Start Ride"}
            icon="bike"
            onPress={() => navigation.navigate('Trip')}
            mode="contained"
            color={colors.primary}
          />
          <ActionButton
            label="Trip History"
            icon="history"
            onPress={() => navigation.navigate('TripHistory')}
            mode="contained"
            color={colors.accent}
          />
          <ActionButton
            label="Add Fuel Log"
            icon="gas-station"
            onPress={() => navigation.navigate('Mileage')}
            mode="contained"
            color={colors.secondary}
          />
          <ActionButton
            label="Manage Reminders"
            icon="bell-outline"
            onPress={() => navigation.navigate('Reminders')}
            color={colors.primary}
          />
          <ActionButton
            label="Location Demo"
            icon="map-marker"
            onPress={() => setShowLocationDemo(!showLocationDemo)}
            color={colors.accent}
          />
        </View>

        {showLocationDemo && (
          <View style={styles.locationDemoContainer}>
            <LocationDemo />
          </View>
        )}
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  divider: {
    marginVertical: 16,
  },
  reminderContainer: {
    marginBottom: 16,
  },
  reminderTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reminderDescription: {
    marginBottom: 12,
    opacity: 0.8,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  locationDemoContainer: {
    marginBottom: 24,
  },
});

export default HomeScreen;
