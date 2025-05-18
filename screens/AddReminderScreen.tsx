import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import { Text, TextInput, Switch, useTheme, SegmentedButtons } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Reminder } from '../types';
import { useAppContext } from '../context/AppContext';
import ActionButton from '../components/ActionButton';
import { colors } from '../utils/theme';

type AddReminderRouteProp = RouteProp<RootStackParamList, 'AddReminder'>;
type AddReminderNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddReminder'>;

const AddReminderScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<AddReminderNavigationProp>();
  const route = useRoute<AddReminderRouteProp>();
  const { addReminder, updateReminder } = useAppContext();

  const initialReminder = route.params.reminder || {
    id: '',
    title: '',
    description: '',
    triggerType: 'distance' as const,
    triggerDistance: 1000,
    isActive: true,
    isCustom: true,
  };

  const [title, setTitle] = useState(initialReminder.title);
  const [description, setDescription] = useState(initialReminder.description || '');
  const [triggerType, setTriggerType] = useState(initialReminder.triggerType);
  const [triggerDistance, setTriggerDistance] = useState(
    initialReminder.triggerDistance ? initialReminder.triggerDistance.toString() : ''
  );
  const [triggerDate, setTriggerDate] = useState(
    initialReminder.triggerDate ? new Date(initialReminder.triggerDate) : new Date()
  );
  const [isActive, setIsActive] = useState(initialReminder.isActive);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!initialReminder.id;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (triggerType === 'distance' || triggerType === 'both') {
      const distance = parseFloat(triggerDistance);
      if (isNaN(distance) || distance <= 0) {
        newErrors.distance = 'Please enter a valid distance';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const reminderData: Omit<Reminder, 'id'> = {
      title,
      description: description.trim() || undefined,
      triggerType,
      triggerDistance: triggerType === 'date' ? undefined : parseFloat(triggerDistance),
      triggerDate: triggerType === 'distance' ? undefined : triggerDate.toISOString(),
      isActive,
      isCustom: initialReminder.isCustom,
    };

    if (isEditing) {
      updateReminder({
        ...reminderData,
        id: initialReminder.id,
      });
    } else {
      addReminder(reminderData);
    }

    navigation.goBack();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setTriggerDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}

          style={styles.input}
          error={!!errors.title}
        />
        {errors.title ? (
          <Text style={styles.errorText}>{errors.title}</Text>
        ) : null}

        <TextInput
          label="Description (Optional)"
          value={description}
          onChangeText={setDescription}

          style={styles.input}
          multiline
        />

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Reminder Type
        </Text>

        <SegmentedButtons
          value={triggerType}
          onValueChange={(value) => setTriggerType(value as 'distance' | 'date' | 'both')}
          buttons={[
            { value: 'distance', label: 'Distance' },
            { value: 'date', label: 'Date' },
            { value: 'both', label: 'Both' },
          ]}
          style={styles.segmentedButtons}
        />

        {(triggerType === 'distance' || triggerType === 'both') && (
          <View style={styles.inputGroup}>
            <TextInput
              label="Trigger Distance (km)"
              value={triggerDistance}
              onChangeText={setTriggerDistance}
              keyboardType="numeric"

              style={styles.input}
              error={!!errors.distance}
            />
            {errors.distance ? (
              <Text style={styles.errorText}>{errors.distance}</Text>
            ) : null}
          </View>
        )}

        {(triggerType === 'date' || triggerType === 'both') && (
          <View style={styles.inputGroup}>
            <Text variant="bodyMedium" style={styles.dateLabel}>
              Trigger Date: {triggerDate.toLocaleDateString()}
            </Text>

            <ActionButton
              label="Select Date"
              onPress={() => setShowDatePicker(true)}

              icon="calendar"
              style={styles.dateButton}
            />

            {showDatePicker && (
              <DateTimePicker
                value={triggerDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>
        )}

        <View style={styles.switchContainer}>
          <Text variant="bodyLarge">Active</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            color={theme.colors.primary}
          />
        </View>

        <View style={styles.buttonContainer}>
          <ActionButton
            label="Cancel"
            onPress={() => navigation.goBack()}

            style={styles.button}
          />

          <ActionButton
            label={isEditing ? 'Update' : 'Save'}
            onPress={handleSave}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  input: {
    marginBottom: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  dateLabel: {
    marginBottom: 8,
  },
  dateButton: {
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  errorText: {
    color: '#dc3545',
    marginBottom: 8,
    marginTop: -4,
  },
});

export default AddReminderScreen;
