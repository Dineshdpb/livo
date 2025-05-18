import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { AppProvider } from './context/AppContext';
import Navigation from './navigation';
import theme from './utils/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <AppProvider>
          <Navigation />
          <StatusBar style="light" />
        </AppProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

// No styles needed at the App level
