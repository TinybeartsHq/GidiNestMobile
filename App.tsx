import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreenComponent from './src/components/SplashScreen';
import { paperTheme } from './src/theme/theme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const [isSplashReady, setIsSplashReady] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  React.useEffect(() => {
    // Hide native splash screen after a short delay
    const timer = setTimeout(async () => {
      await SplashScreen.hideAsync();
      setIsAppReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSplashFinish = async () => {
    setIsSplashReady(true);
  };

  // Show custom splash screen first
  if (!isSplashReady || !isAppReady) {
    return <SplashScreenComponent onFinish={handleSplashFinish} />;
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider theme={paperTheme}>
        <AppContent />
      </PaperProvider>
    </Provider>
  );
}

