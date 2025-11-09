import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreenComponent from './src/components/SplashScreen';
import { ThemeProvider, useThemeMode } from './src/theme/ThemeProvider';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const [isSplashReady, setIsSplashReady] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const { mode } = useThemeMode();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

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

  const shouldShowSplash = useMemo(
    () => !fontsLoaded || !isSplashReady || !isAppReady,
    [fontsLoaded, isSplashReady, isAppReady]
  );

  // Show custom splash screen first
  if (shouldShowSplash) {
    return <SplashScreenComponent onFinish={handleSplashFinish} />;
  }

  const statusBarStyle = mode === 'dark' ? 'light' : 'dark';

  return (
    <>
      <AppNavigator />
      <StatusBar
        style={statusBarStyle}
        backgroundColor="transparent"
        translucent
      />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

