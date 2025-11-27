import '../global.css';
import { Stack } from 'expo-router';
import { SalesProvider } from '../context/SalesContext';
import { ThemeProvider } from '../context/ThemeContext';
import { useTheme } from '../hooks/useTheme';
import { useFonts, Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { Alert } from 'react-native';

function RootLayoutContent() {
  const { colorScheme } = useTheme();

  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        Alert.alert(
          'Update Available',
          'A new version of the app is available. Would you like to update now?',
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Update',
              onPress: async () => {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              },
            },
          ]
        );
      }
    } catch (error) {
      // You can also add an alert() to see the error message in case of an error when fetching updates.
      console.log(`Error fetching latest Expo update: ${error}`);
    }
  }

  useEffect(() => {
    if (!__DEV__) {
      onFetchUpdateAsync();
    }
  }, []);

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'transparentModal', animation: 'fade' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <SalesProvider>
        <RootLayoutContent />
      </SalesProvider>
    </ThemeProvider>
  );
}
