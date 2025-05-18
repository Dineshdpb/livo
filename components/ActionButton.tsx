import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { colors } from '../utils/theme';
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
  
  const getTextColor = () => {
    if (disabled) return colors.textDisabled;
    
    // For text or outlined buttons - ensure high visibility
    if (mode === 'text' || mode === 'outlined') {
      // Use brighter, more visible colors for outlined/text buttons
      if (color === theme.colors.secondary) return colors.secondary;
      if (color === theme.colors.tertiary) return colors.accent;
      if (color === theme.colors.error) return colors.error;
      
      // Default to primary color with high brightness
      return colors.primary;
    }
    
    // For contained buttons, use appropriate contrast colors
    if (color === theme.colors.tertiary) return colors.onAccent; // Black on amber
    if (color === theme.colors.secondary) return colors.onSecondary; // White on green
    if (color === theme.colors.error) return colors.buttonText; // White on red
    
    // Default for primary and other colors
    return colors.buttonText; // White text on colored background
  };

  // Determine button background color
  const getButtonColor = () => {
    if (disabled) return colors.surface; // Use surface color for disabled buttons
    return color || theme.colors.primary; // Use provided color or default primary
  };

  return (
    <Button
      mode={mode}
      onPress={onPress}
      icon={icon}
      disabled={disabled}
      loading={loading}
      buttonColor={getButtonColor()}
      textColor={getTextColor()}
      style={[styles.button, style]}
      contentStyle={styles.buttonContent}
      labelStyle={styles.buttonLabel}
    >
      {label}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
    // Shadow for iOS
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
  buttonContent: {
    paddingVertical: 12, // Taller buttons for better touch targets
    paddingHorizontal: 16,
  },
  buttonLabel: {
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
    // Ensure full opacity for maximum visibility
    opacity: 1,
  },
});

export default ActionButton;
