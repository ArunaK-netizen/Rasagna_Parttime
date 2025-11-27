import '../global.css';
import { Stack } from 'expo-router';
import { SalesProvider } from '../context/SalesContext';
import { ThemeProvider } from '../context/ThemeContext';
import { useTheme } from '../hooks/useTheme';
import { useFonts, Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

function RootLayoutContent() {
  const { colorScheme } = useTheme();

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
