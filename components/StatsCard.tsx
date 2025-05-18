import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
          <Text variant="titleMedium" style={styles.title}>{title}</Text>
          <View style={styles.valueContainer}>
            <Text variant="headlineMedium" style={styles.value}>
              {value}
            </Text>
            {unit && <Text variant="bodyMedium" style={styles.unit}>{unit}</Text>}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    elevation: 2,
    borderRadius: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    opacity: 0.8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontWeight: 'bold',
  },
  unit: {
    marginLeft: 4,
    opacity: 0.7,
  },
});

export default StatsCard;
