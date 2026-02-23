import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

export default function Login() {
  const { signInWithGoogle, loading } = useAuth();
  const { colorScheme } = useTheme();

  const handleGoogleSignIn = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signInWithGoogle();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
      console.error('Sign in error:', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <LinearGradient
        colors={colorScheme === 'dark' ? ['#1a1a1a', '#2d2d2d'] : ['#667eea', '#764ba2']}
        className="flex-1"
      />
      <SafeAreaView className="flex-1 px-6 justify-center">
        <View className="items-center mb-12">
          <Text className="text-6xl mb-4">📊</Text>
          <Text className="text-3xl font-bold text-white mb-2">Part-Time Sales</Text>
          <Text className="text-lg text-white/80 text-center">
            Track your sales, manage products, and grow your business
          </Text>
        </View>

        <View className="space-y-4">
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            className="bg-white rounded-xl py-4 px-6 flex-row items-center justify-center shadow-lg"
            activeOpacity={0.8}
          >
            <Text className="text-lg font-semibold text-gray-800 ml-3">
              Continue with Google
            </Text>
          </TouchableOpacity>

          <Text className="text-center text-white/60 text-sm">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}