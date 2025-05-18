import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  color?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: object;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onPress,
  icon,
  mode = 'contained',
  color,
  disabled = false,
  loading = false,
  style,
}) => {
  const theme = useTheme();
  
  return (
    <Button
      mode={mode}
      onPress={onPress}
      icon={icon}
      disabled={disabled}
      loading={loading}
      buttonColor={color || theme.colors.primary}
      style={[styles.button, style]}
      contentStyle={styles.buttonContent}
    >
      {label}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default ActionButton;
