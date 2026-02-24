import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

export default function Index() {
  const { user, loading } = useAuth();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isDark ? '#000' : '#fff',
        }}
      >
        <ActivityIndicator size="large" color={isDark ? '#0A84FF' : '#007AFF'} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  // Already authenticated: go straight to dashboard
  return <Redirect href="/(tabs)/dashboard" />;
}
