import { DefaultTheme, MD3DarkTheme } from 'react-native-paper';

// Theme colors as per requirements
const COLORS = {
  primary: '#1E90FF', // Blue
  accent: '#28A745',  // Green
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  disabled: '#757575',
  placeholder: '#9E9E9E',
  backdrop: 'rgba(0, 0, 0, 0.5)',
};

export const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.primary,
    accent: COLORS.accent,
    background: COLORS.background,
    surface: COLORS.surface,
    text: COLORS.text,
    disabled: COLORS.disabled,
    placeholder: COLORS.placeholder,
    backdrop: COLORS.backdrop,
  },
  roundness: 12,
  animation: {
    scale: 1.0,
  },
};

export default theme;
