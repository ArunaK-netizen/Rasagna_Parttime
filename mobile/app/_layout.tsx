import { Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold, useFonts } from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { ProductProvider } from '../context/ProductContext';
import { SalesProvider } from '../context/SalesContext';
import { ThemeProvider } from '../context/ThemeContext';
import '../global.css';
import { useTheme } from '../hooks/useTheme';

import { useEffect } from 'react';
import { UpdateModal } from '../components/UpdateModal';
import { useProducts } from '../context/ProductContext';
import { useSales } from '../context/SalesContext';
import { useAppUpdate } from '../hooks/useAppUpdate';

function RootLayoutContent() {
  const { colorScheme } = useTheme();
  const { isUpdateAvailable, isDownloading, manifest, performUpdate, cancelUpdate } = useAppUpdate();

  // Initialize Auto Backup
  // useAutoBackup();

  const { products: currentProducts } = useProducts();
  const { transactions: currentTransactions } = useSales();

  // useEffect(() => {
  //   const checkRestore = async () => {
  //     // Only check if we have NO data
  //     const hasProducts = Object.keys(currentProducts).length > 0;
  //     const hasTransactions = currentTransactions.length > 0;

  //     if (!hasProducts && !hasTransactions) {
  //       const hasBackup = await BackupService.checkForBackup();
  //       if (hasBackup) {
  //         Alert.alert(
  //           'Backup Found',
  //           'We found a backup of your data. Would you like to restore it?',
  //           [
  //             { text: 'No, Start Fresh', style: 'cancel' },
  //             {
  //               text: 'Restore Data',
  //               onPress: async () => {
  //                 const backup = await BackupService.restoreBackup();
  //                 if (backup) {
  //                   try {
  //                     await AsyncStorage.setItem('@parttime_products', JSON.stringify(backup.products));
  //                     await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(backup.transactions));
  //                     await Updates.reloadAsync();
  //                   } catch (e) {
  //                     Alert.alert('Error', 'Failed to restore backup');
  //                   }
  //                 }
  //               }
  //             }
  //           ]
  //         );
  //       }
  //     }
  //   };

  //   // Slight delay to ensure contexts are loaded
  //   const timer = setTimeout(checkRestore, 1000);
  //   return () => clearTimeout(timer);
  // }, []); // Run once on mount

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" options={{ animation: 'fade', gestureEnabled: false }} />
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

import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { View } from 'react-native';
import { CustomSplashScreen } from '../components/CustomSplashScreen';

// ... (keep imports)

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });
  const [isSplashAnimationFinished, setIsSplashAnimationFinished] = useState(false);

  useEffect(() => {
    // We defer SplashScreen.hideAsync() to the CustomSplashScreen component
    // to ensure the animation starts exactly when the native splash hides.
  }, [fontsLoaded]);

  if (!fontsLoaded && !isSplashAnimationFinished) {
    // While fonts are loading, we ensure the native splash is kept (via preventAutoHideAsync).
    // We can also render the CustomSplashScreen here to be ready.
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <AuthProvider>
        <ThemeProvider>
          <ProductProvider>
            <SalesProvider>
              {/* 
                Render the app content only when fonts are loaded to avoid layout shifts/errors.
                It stays rendered behind the splash screen while the splash fades out.
              */}
              {fontsLoaded && <RootLayoutContent />}

              {!isSplashAnimationFinished && (
                <CustomSplashScreen
                  isReady={fontsLoaded}
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
