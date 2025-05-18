import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, SafeAreaView, Alert } from 'react-native';
import { Text, Card, useTheme, Divider, IconButton, Surface, Menu, Portal, Dialog } from 'react-native-paper';
import { useAppContext } from '../context/AppContext';
import { Trip } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ActionButton from '../components/ActionButton';

const TripHistoryScreen = () => {
  const theme = useTheme();
  const { trips, deleteTrip } = useAppContext();
  const navigation = useNavigation();
  const [sortedTrips, setSortedTrips] = useState<Trip[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // Sort trips by date (newest first)
  useEffect(() => {
    const sorted = [...trips].sort((a, b) => {
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });
    setSortedTrips(sorted);
  }, [trips]);

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format time to readable string
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format duration from seconds to HH:MM:SS
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle delete trip confirmation
  const handleDeleteTrip = async () => {
    if (selectedTripId) {
      await deleteTrip(selectedTripId);
      setDeleteDialogVisible(false);
      setSelectedTripId(null);
    }
  };

  // Open menu for a specific trip
  const openMenu = (id: string, event: any) => {
    // Get the position from the event
    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({ x: pageX, y: pageY });
    setSelectedTripId(id);
    setMenuVisible(true);
  };
  
  // Close menu
  const closeMenu = () => {
    setMenuVisible(false);
  };

  // Show delete confirmation dialog
  const showDeleteDialog = () => {
    closeMenu();
    setDeleteDialogVisible(true);
  };

  // Render each trip item
  const renderTripItem = ({ item }: { item: Trip }) => (
    <Surface style={[styles.tripCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.tripHeader}>
        <View>
          <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
            {formatDate(item.startTime)}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
            {formatTime(item.startTime)} - {item.endTime ? formatTime(item.endTime) : 'In Progress'}
          </Text>
        </View>
        <View style={styles.tripActions}>
          <MaterialCommunityIcons name="bike" size={24} color={theme.colors.primary} style={{ marginRight: 8 }} />
          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={(e) => openMenu(item.id, e)}
            iconColor={theme.colors.onSurface}
          />
        </View>
      </View>
      
      <Divider style={{ marginVertical: 8 }} />
      
      <View style={styles.tripStats}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="map-marker-distance" size={20} color={theme.colors.primary} />
          <Text variant="titleMedium" style={styles.statValue}>
            {item.distance.toFixed(2)} km
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Distance
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.primary} />
          <Text variant="titleMedium" style={styles.statValue}>
            {formatDuration(item.duration)}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Duration
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="speedometer" size={20} color={theme.colors.primary} />
          <Text variant="titleMedium" style={styles.statValue}>
            {item.avgSpeed ? item.avgSpeed.toFixed(1) : '0.0'} km/h
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Avg Speed
          </Text>
        </View>
      </View>
    </Surface>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Global Menu */}
      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchor={menuPosition}
        contentStyle={{ backgroundColor: theme.colors.surface }}
      >
        <Menu.Item 
          onPress={showDeleteDialog} 
          title="Delete"
          leadingIcon="delete"
        />
      </Menu>
      
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Trip History
        </Text>
        <IconButton
          icon="plus"
          size={24}
          onPress={() => navigation.navigate('Trip' as never)}
          style={{ backgroundColor: theme.colors.primary }}
          iconColor={theme.colors.onPrimary}
        />
      </View>

      {sortedTrips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="bike-fast" size={64} color={theme.colors.primary} />
          <Text variant="titleLarge" style={styles.emptyText}>
            No trips yet
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Start tracking your rides to see them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedTrips}
          renderItem={renderTripItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Trip</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Are you sure you want to delete this trip? This action cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <ActionButton
              label="Cancel"
              onPress={() => setDeleteDialogVisible(false)}
              mode="text"
            />
            <ActionButton
              label="Delete"
              onPress={handleDeleteTrip}
              color="#dc3545"
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 16,
  },
  tripCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  emptySubtext: {
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default TripHistoryScreen;
