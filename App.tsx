import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { AppProvider } from './context/AppContext';
import Navigation from './navigation';
import theme from './utils/theme';

export default function App() {
  return (
    // <PaperProvider theme={theme}>
    <AppProvider>
      <Navigation />
      <StatusBar style="light" />
    </AppProvider>
    // </PaperProvider>
  );
}

// No styles needed at the App level
