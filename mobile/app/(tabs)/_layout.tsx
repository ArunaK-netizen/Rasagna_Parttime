import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export default function TabLayout() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          borderTopWidth: 0.5,
          borderTopColor: isDark ? 'rgba(84, 84, 88, 0.65)' : 'rgba(0, 0, 0, 0.12)',
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: isDark ? '#8e8e93' : '#8e8e93',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Outfit_600SemiBold',
          marginTop: 4,
          letterSpacing: -0.1,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerFocused
            ]}>
              <Text style={{ fontSize: 26, color }}>🏠</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerFocused
            ]}>
              <Text style={{ fontSize: 26, color }}>📅</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerFocused
            ]}>
              <Text style={{ fontSize: 26, color }}>📊</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 32,
  },
  iconContainerFocused: {
    // Add subtle scale or background if desired
  },
});
