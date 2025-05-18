import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Card, Text, Switch, IconButton, useTheme, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../utils/theme';
import { Reminder } from '../types';

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: (id: string) => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
}

const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();

  const formatTrigger = () => {
    let triggerText = '';

    if (reminder.triggerType === 'distance' && reminder.triggerDistance) {
      triggerText = `Every ${reminder.triggerDistance} km`;
    } else if (reminder.triggerType === 'date' && reminder.triggerDate) {
      const date = new Date(reminder.triggerDate);
      triggerText = `On ${date.toLocaleDateString()}`;
    } else if (reminder.triggerType === 'both' && reminder.triggerDistance && reminder.triggerDate) {
      const date = new Date(reminder.triggerDate);
      triggerText = `Every ${reminder.triggerDistance} km or by ${date.toLocaleDateString()}`;
    }

    return triggerText;
  };

  const getCardAccentColor = () => {
    if (!reminder.isActive) return colors.textDisabled; // Gray for inactive

    if (reminder.title.toLowerCase().includes('oil')) {
      return colors.warning; // Orange/amber for oil change
    } else if (reminder.title.toLowerCase().includes('service')) {
      return colors.secondary; // Green for service
    } else {
      return colors.primary; // Blue for other reminders
    }
  };

  const accentColor = getCardAccentColor();

  return (
    <Card
      style={[styles.card, !reminder.isActive && styles.inactiveCard]}
      mode="elevated"
    >
      <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
      <Card.Content style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text
              variant="titleMedium"
              style={[styles.title,
              !reminder.isActive ? styles.inactiveText : { color: colors.textPrimary, fontWeight: '700' }
              ]}
            >
              {reminder.title}
            </Text>

            <Chip

              style={styles.typeChip}
              textStyle={styles.chipText}
            >
              {reminder.triggerType === 'distance' ? 'Distance' :
                reminder.triggerType === 'date' ? 'Date' : 'Both'}
            </Chip>
          </View>

          <Switch
            value={reminder.isActive}
            onValueChange={() => onToggle(reminder.id)}
            color={accentColor}
          />
        </View>

        {reminder.description && (
          <Text
            variant="bodyMedium"
            style={[styles.description,
            !reminder.isActive ? styles.inactiveText : { color: colors.textSecondary }
            ]}
          >
            {reminder.description}
          </Text>
        )}

        <View style={styles.triggerContainer}>
          <MaterialCommunityIcons
            name={
              reminder.triggerType === 'distance' ? 'map-marker-distance' :
                reminder.triggerType === 'date' ? 'calendar' : 'calendar-clock'
            }
            size={18}
            color={!reminder.isActive ? colors.textDisabled : accentColor}
            style={styles.triggerIcon}
          />
          <Text
            variant="bodyMedium"
            style={[styles.trigger,
            !reminder.isActive ? styles.inactiveText : { color: colors.textSecondary, fontWeight: '500' }
            ]}
          >
            {formatTrigger()}
          </Text>
        </View>

        <View style={styles.actions}>
          <IconButton
            icon="pencil"
            iconColor={colors.primary}
            size={20}
            onPress={() => onEdit(reminder)}
            style={styles.actionButton}
          />
          <IconButton
            icon="delete"
            iconColor={colors.error}
            size={20}
            onPress={() => onDelete(reminder.id)}
            style={styles.actionButton}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.card,
    elevation: 3,
    // iOS shadows
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {},
    }),
  },
  inactiveCard: {
    opacity: 0.8,
  },
  cardAccent: {
    height: 6,
    width: '100%',
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontWeight: 'bold',
    marginRight: 8,
    flex: 1,
  },
  typeChip: {
    height: 26,
    marginTop: 4,
  },
  chipText: {
    fontSize: 11,
  },
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  triggerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  triggerIcon: {
    marginRight: 8,
  },
  trigger: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  actionButton: {
    margin: 0,
  },
  inactiveText: {
    color: colors.textDisabled,
  },
});

export default ReminderCard;
