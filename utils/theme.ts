import { MD3DarkTheme } from 'react-native-paper';

// Consistent high-contrast theme colors for better visibility
const COLORS = {
  // Primary colors - bright blue that stands out clearly
  primary: '#2196F3', // Bright blue
  primaryDark: '#0D47A1', // Darker blue for containers
  primaryLight: '#64B5F6', // Lighter blue for highlights
  onPrimary: '#FFFFFF', // White text on primary
  
  // Secondary colors - bright green with good contrast
  secondary: '#4CAF50', // Bright green
  secondaryDark: '#2E7D32', // Darker green
  secondaryLight: '#81C784', // Lighter green
  onSecondary: '#FFFFFF', // White text on secondary
  
  // Accent colors - bright orange/amber
  accent: '#FFC107', // Amber
  accentDark: '#FF8F00', // Dark amber
  accentLight: '#FFD54F', // Light amber
  onAccent: '#000000', // Black text on accent
  
  // Background colors - consistent dark theme
  background: '#121212', // Standard Material dark background
  surface: '#1E1E1E', // Surface color
  card: '#242424', // Card background
  
  // Text colors - high contrast
  textPrimary: '#FFFFFF', // Primary text - white
  textSecondary: '#E0E0E0', // Secondary text - light gray
  textHint: '#BDBDBD', // Hint text - medium gray
  textDisabled: '#757575', // Disabled text - dark gray
  
  // Status colors
  success: '#4CAF50', // Success - green
  warning: '#FF9800', // Warning - orange
  error: '#F44336', // Error - red
  info: '#2196F3', // Info - blue
  
  // Border and divider
  divider: '#424242', // Divider color
  border: '#616161', // Border color
  
  // Button specific colors
  buttonText: '#FFFFFF', // Text on buttons
  buttonOutlinedText: '#2196F3', // Text on outlined buttons - using primary color for visibility
  buttonTextText: '#2196F3', // Text on text buttons - using primary color for visibility
};

// Create a consistent theme with enhanced configuration
export const theme = {
  ...MD3DarkTheme,
  dark: true, // Force dark mode
  colors: {
    ...MD3DarkTheme.colors,
    // Override MD3 colors with our custom ones
    primary: COLORS.primary,
    onPrimary: COLORS.onPrimary,
    primaryContainer: COLORS.primaryDark,
    onPrimaryContainer: COLORS.onPrimary,
    secondary: COLORS.secondary,
    onSecondary: COLORS.onSecondary,
    secondaryContainer: COLORS.secondaryDark,
    onSecondaryContainer: COLORS.onSecondary,
    tertiary: COLORS.accent,
    onTertiary: COLORS.onAccent,
    tertiaryContainer: COLORS.accentDark,
    onTertiaryContainer: COLORS.onAccent,
    background: COLORS.background,
    onBackground: COLORS.textPrimary,
    surface: COLORS.surface,
    onSurface: COLORS.textPrimary,
    surfaceVariant: COLORS.card,
    onSurfaceVariant: COLORS.textSecondary,
    error: COLORS.error,
    onError: COLORS.buttonText,
    outline: COLORS.border,
    outlineVariant: COLORS.divider,
    // Ensure text colors are consistent
    text: COLORS.textPrimary,
    disabled: COLORS.textDisabled,
    placeholder: COLORS.textHint,
  },
  // Modern rounded corners
  roundness: 12,
  // Animation speed
  animation: {
    scale: 0.3, // Faster animations for a more responsive feel
  },
};

// Export the raw colors for direct access when needed
export const colors = COLORS;
