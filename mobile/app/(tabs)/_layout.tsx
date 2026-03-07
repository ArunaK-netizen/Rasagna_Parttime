import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAnnouncements } from '../../hooks/useAnnouncements';

export default function TabLayout() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const { unreadCount } = useAnnouncements();

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
              <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
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
              <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={color} />
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
              <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerFocused
            ]}>
              <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
              {unreadCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -2,
                  right: 4,
                  backgroundColor: '#FF3B30',
                  borderRadius: 10,
                  minWidth: 18,
                  height: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 4,
                  borderWidth: 1.5,
                  borderColor: isDark ? '#1c1c1e' : '#ffffff',
                }}>
                  <Text style={{ color: '#ffffff', fontSize: 10, fontFamily: 'Outfit_700Bold' }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
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
