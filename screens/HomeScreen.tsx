import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import { Text, useTheme, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAppContext } from '../context/AppContext';
import StatsCard from '../components/StatsCard';
import ActionButton from '../components/ActionButton';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineSmall" style={styles.sectionTitle}>
          Today's Stats
        </Text>
        
        <View style={styles.statsContainer}>
          <StatsCard
            title="Total Distance"
            value={userStats.totalDistance.toFixed(1)}
            unit="km"
            icon="map-marker-distance"
            color={theme.colors.primary}
          />
          
          <StatsCard
            title="Today's Distance"
            value={userStats.todayDistance.toFixed(1)}
            unit="km"
            icon="bike"
            color="#28A745"
          />
          
          <StatsCard
            title="Last Mileage"
            value={userStats.lastMileage ? userStats.lastMileage.toFixed(1) : "N/A"}
            unit={userStats.lastMileage ? "km/l" : ""}
            icon="gas-station"
            color="#FFC107"
          />
        </View>

        {nextReminder && (
          <>
            <Divider style={styles.divider} />
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Next Reminder
            </Text>
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
                mode="outlined"
                icon="bell"
              />
            </View>
          </>
        )}

        <Divider style={styles.divider} />
        <Text variant="headlineSmall" style={styles.sectionTitle}>
          Quick Actions
        </Text>
        
        <View style={styles.actionsContainer}>
          <ActionButton
            label={activeTrip ? "Continue Ride" : "Start Ride"}
            onPress={() => navigation.navigate('Trip')}
            icon="bike"
            color={theme.colors.primary}
          />
          
          <ActionButton
            label="Add Fuel Log"
            onPress={() => navigation.navigate('Mileage')}
            icon="gas-station"
            color="#28A745"
          />
          
          <ActionButton
            label="Manage Reminders"
            onPress={() => navigation.navigate('Reminders')}
            icon="bell"
            mode="outlined"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    marginVertical: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    marginBottom: 16,
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
    marginBottom: 16,
  },
});

export default HomeScreen;
