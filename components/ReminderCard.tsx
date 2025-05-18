import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Switch, IconButton, useTheme } from 'react-native-paper';
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
  
  return (
    <Card style={[styles.card, !reminder.isActive && styles.inactiveCard]}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>{reminder.title}</Text>
          <Switch
            value={reminder.isActive}
            onValueChange={() => onToggle(reminder.id)}
            color={theme.colors.primary}
          />
        </View>
        
        {reminder.description && (
          <Text variant="bodyMedium" style={styles.description}>
            {reminder.description}
          </Text>
        )}
        
        <Text variant="bodySmall" style={styles.trigger}>
          {formatTrigger()}
        </Text>
        
        <View style={styles.actions}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => onEdit(reminder)}
          />
          <IconButton
            icon="delete"
            size={20}
            onPress={() => onDelete(reminder.id)}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    borderRadius: 12,
  },
  inactiveCard: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
  },
  description: {
    marginBottom: 8,
  },
  trigger: {
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
});

export default ReminderCard;
