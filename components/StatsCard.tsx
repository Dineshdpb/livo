import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../utils/theme';

interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  unit,
  icon,
  color
}) => {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={icon}
            size={32}
            color={color || theme.colors.primary}
          />
        </View>
        <View style={styles.textContainer}>
          <Text
            variant="titleMedium"
            style={[styles.title, { color: colors.textSecondary }]}
          >
            {title}
          </Text>
          <View style={styles.valueContainer}>
            <Text
              variant="headlineMedium"
              style={[styles.value, { color: colors.textPrimary }]}
            >
              {typeof value === 'string' ? value.split(' ')[0] : value}
            </Text>
            {unit ? (
              <Text variant="bodyMedium" style={[styles.unit, { color: colors.textSecondary }]}>{unit}</Text>
            ) : typeof value === 'string' && value.includes(' ') ? (
              <Text variant="bodyMedium" style={[styles.unit, { color: colors.textSecondary }]}>
                {value.split(' ').slice(1).join(' ')}
              </Text>
            ) : null}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 4,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: colors.card,
    // Add width to ensure cards don't stretch or shrink too much
    width: '31%',  // Slightly less than 1/3 to account for margins
  },
  content: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    marginBottom: 12,
    backgroundColor: colors.surface,
    padding: 8,
    borderRadius: 8,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  value: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  unit: {
    marginLeft: 4,
    fontSize: 12,
  },
});

export default StatsCard;
