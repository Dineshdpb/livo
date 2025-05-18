import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, Dimensions, Alert } from 'react-native';
import { Text, Card, useTheme, TextInput, IconButton, Menu, Portal, Dialog } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { useAppContext } from '../context/AppContext';
import ActionButton from '../components/ActionButton';

const MileageScreen = () => {
  const theme = useTheme();
  const { fuelEntries, addFuelEntry, deleteFuelEntry } = useAppContext();
  const [fuelQuantity, setFuelQuantity] = useState('');
  const [distance, setDistance] = useState('');
  const [error, setError] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Open menu for a specific entry
  const openMenu = (id: string, event: any) => {
    // Get the position from the event
    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({ x: pageX, y: pageY });
    setSelectedEntryId(id);
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
  
  // Handle delete fuel entry confirmation
  const handleDeleteEntry = async () => {
    if (selectedEntryId) {
      await deleteFuelEntry(selectedEntryId);
      setDeleteDialogVisible(false);
      setSelectedEntryId(null);
    }
  };
  
  const handleAddEntry = () => {
    // Validate inputs
    const fuelValue = parseFloat(fuelQuantity);
    const distanceValue = parseFloat(distance);

    if (isNaN(fuelValue) || fuelValue <= 0) {
      setError('Please enter a valid fuel quantity');
      return;
    }

    if (isNaN(distanceValue) || distanceValue <= 0) {
      setError('Please enter a valid distance');
      return;
    }

    // Add entry
    addFuelEntry(fuelValue, distanceValue);

    // Reset form
    setFuelQuantity('');
    setDistance('');
    setError('');
  };

  // Prepare chart data
  const getChartData = () => {
    // Get the last 6 entries or fewer if not available
    const recentEntries = [...fuelEntries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6)
      .reverse();

    const labels = recentEntries.map((entry, index) => `#${index + 1}`);
    const data = recentEntries.map(entry => entry.mileage);

    return {
      labels,
      datasets: [
        {
          data: data.length > 0 ? data : [0],
          color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
  };

  const screenWidth = Dimensions.get('window').width - 32; // Account for padding

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
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Delete Confirmation Dialog */}
        <Portal>
          <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
            <Dialog.Title>Delete Fuel Entry</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">Are you sure you want to delete this fuel entry? This action cannot be undone.</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <ActionButton
                label="Cancel"
                onPress={() => setDeleteDialogVisible(false)}
                mode="text"
              />
              <ActionButton
                label="Delete"
                onPress={handleDeleteEntry}
                color="#dc3545"
              />
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Mileage Calculator
            </Text>

            <TextInput
              label="Fuel Quantity (liters)"
              value={fuelQuantity}
              onChangeText={setFuelQuantity}
              keyboardType="numeric"

              style={styles.input}
              error={!!error && error.includes('fuel')}
            />

            <TextInput
              label="Distance Covered (km)"
              value={distance}
              onChangeText={setDistance}
              keyboardType="numeric"

              style={styles.input}
              error={!!error && error.includes('distance')}
            />

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <ActionButton
              label="Calculate & Save"
              onPress={handleAddEntry}
              icon="calculator"
              style={styles.button}
            />

            {fuelQuantity && distance && !error ? (
              <View style={styles.calculationResult}>
                <Text variant="bodyLarge">
                  Estimated Mileage:{' '}
                  <Text style={styles.resultValue}>
                    {(parseFloat(distance) / parseFloat(fuelQuantity)).toFixed(2)} km/l
                  </Text>
                </Text>
              </View>
            ) : null}
          </Card.Content>
        </Card>

        {fuelEntries.length > 0 ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Mileage History
              </Text>

              <LineChart
                data={getChartData()}
                width={screenWidth - 32} // Account for card padding
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />

              <Text style={styles.chartLabel}>
                Recent Entries (km/l)
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.emptyText}>
                No mileage entries yet. Add your first entry above.
              </Text>
            </Card.Content>
          </Card>
        )}

        {fuelEntries.length > 0 ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Recent Entries
              </Text>

              {[...fuelEntries]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((entry) => (
                  <View key={entry.id} style={styles.entryItem}>
                    <Text variant="bodyMedium">
                      {new Date(entry.date).toLocaleDateString()}
                    </Text>
                    <Text variant="bodyMedium">
                      {entry.fuelQuantity.toFixed(2)} L | {entry.distance.toFixed(1)} km
                    </Text>
                    <View style={styles.entryActions}>
                      <Text variant="titleMedium" style={{ color: theme.colors.primary, marginRight: 8 }}>
                        {entry.mileage.toFixed(2)} km/l
                      </Text>
                      <IconButton
                        icon="dots-vertical"
                        size={20}
                        onPress={(e) => openMenu(entry.id, e)}
                        iconColor={theme.colors.onSurface}
                      />
                    </View>
                  </View>
                ))}
            </Card.Content>
          </Card>
        ) : null}
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
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  errorText: {
    color: '#dc3545',
    marginBottom: 8,
  },
  calculationResult: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    borderRadius: 8,
  },
  resultValue: {
    fontWeight: 'bold',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLabel: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    padding: 16,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  entryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default MileageScreen;
