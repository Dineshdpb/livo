import React, { useState } from 'react';
import { StyleSheet, View, FlatList, SafeAreaView } from 'react-native';
import { Text, useTheme, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Reminder } from '../types';
import { useAppContext } from '../context/AppContext';
import ReminderCard from '../components/ReminderCard';
import ActionButton from '../components/ActionButton';
import { colors } from '../utils/theme';

type RemindersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Reminders'>;

const RemindersScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<RemindersScreenNavigationProp>();
  const { reminders, toggleReminder, deleteReminder, userStats } = useAppContext();
  const [showDefaultDialog, setShowDefaultDialog] = useState(false);

  const handleAddDefaultReminders = () => {
    // Navigate to add reminder screen with pre-filled values for oil change
    navigation.navigate('AddReminder', {
      reminder: {
        id: '',
        title: 'Oil Change',
        description: 'Regular oil change for your bike',
        triggerType: 'distance',
        triggerDistance: 3000,
        isActive: true,
        isCustom: false,
      },
    });
    setShowDefaultDialog(false);
  };

  const handleAddServiceReminder = () => {
    // Navigate to add reminder screen with pre-filled values for service
    navigation.navigate('AddReminder', {
      reminder: {
        id: '',
        title: 'Bike Service',
        description: 'Regular maintenance service for your bike',
        triggerType: 'both',
        triggerDistance: 6000,
        triggerDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 6 months from now
        isActive: true,
        isCustom: false,
      },
    });
    setShowDefaultDialog(false);
  };

  const handleEditReminder = (reminder: Reminder) => {
    navigation.navigate('AddReminder', { reminder });
  };

  const handleDeleteReminder = (id: string) => {
    deleteReminder(id);
  };

  // Group reminders by active status
  const activeReminders = reminders.filter(r => r.isActive);
  const inactiveReminders = reminders.filter(r => !r.isActive);

  return (
    <SafeAreaView style={styles.container}>
      {reminders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No reminders set up yet. Add default reminders or create custom ones.
          </Text>

          <ActionButton
            label="Add Oil Change Reminder"
            onPress={handleAddDefaultReminders}
            icon="oil"
            style={styles.emptyButton}
          />

          <ActionButton
            label="Add Service Reminder"
            onPress={handleAddServiceReminder}
            icon="wrench"
            style={styles.emptyButton}
          />

          <ActionButton
            label="Add Custom Reminder"
            onPress={() => navigation.navigate('AddReminder', {})}
            icon="plus"

            style={styles.emptyButton}
          />
        </View>
      ) : (
        <>
          {activeReminders.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Active Reminders
              </Text>

              <FlatList
                data={activeReminders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <ReminderCard
                    reminder={item}
                    onToggle={toggleReminder}
                    onEdit={handleEditReminder}
                    onDelete={handleDeleteReminder}
                  />
                )}
                contentContainerStyle={styles.listContent}
              />
            </View>
          )}

          {inactiveReminders.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Inactive Reminders
              </Text>

              <FlatList
                data={inactiveReminders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <ReminderCard
                    reminder={item}
                    onToggle={toggleReminder}
                    onEdit={handleEditReminder}
                    onDelete={handleDeleteReminder}
                  />
                )}
                contentContainerStyle={styles.listContent}
              />
            </View>
          )}

          <View style={styles.statsContainer}>
            <Text variant="bodyMedium" style={styles.statsText}>
              Current Total Distance: {userStats.totalDistance.toFixed(1)} km
            </Text>
          </View>
        </>
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddReminder', {})}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  emptyButton: {
    marginBottom: 12,
    width: '100%',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 8,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 80, // Make room for FAB
  },
  statsText: {
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default RemindersScreen;
