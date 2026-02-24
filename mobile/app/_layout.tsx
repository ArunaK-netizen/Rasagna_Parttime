import { Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold, useFonts } from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { CustomSplashScreen } from '../components/CustomSplashScreen';
import { UpdateModal } from '../components/UpdateModal';
import { AuthProvider } from '../context/AuthContext';
import { ProductProvider } from '../context/ProductContext';
import { SalesProvider } from '../context/SalesContext';
import { ThemeProvider } from '../context/ThemeContext';
import '../global.css';
import { useAppUpdate } from '../hooks/useAppUpdate';
import { useTheme } from '../hooks/useTheme';

// Keep the native splash visible while we boot.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if it's already been called or cannot be prevented in this environment.
});

function RootLayoutContent() {
  const { colorScheme } = useTheme();
  const { isUpdateAvailable, isDownloading, manifest, performUpdate, cancelUpdate } = useAppUpdate();
  const fg = colorScheme === 'dark' ? '#fff' : '#000'; // still used by children if needed

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'transparentModal', animation: 'fade' }} />
      </Stack>

      <UpdateModal
        visible={isUpdateAvailable}
        onUpdate={performUpdate}
        onCancel={cancelUpdate}
        isDownloading={isDownloading}
        manifest={manifest}
      />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });
  const [isSplashAnimationFinished, setIsSplashAnimationFinished] = useState(false);

  useEffect(() => {
    if (fontError) {
      console.warn('Font load error:', fontError);
    }
  }, [fontError]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <AuthProvider>
        <ThemeProvider>
          <ProductProvider>
            <SalesProvider>
              <RootLayoutContent />
              {!isSplashAnimationFinished && (
                <CustomSplashScreen
                  isReady={fontsLoaded || !!fontError}
                  onFinish={() => setIsSplashAnimationFinished(true)}
                />
              )}
            </SalesProvider>
          </ProductProvider>
        </ThemeProvider>
      </AuthProvider>
    </View>
  );
}
