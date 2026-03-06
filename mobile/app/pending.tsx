import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function PendingScreen() {
    const { user, accessStatus, logout } = useAuth();
    const router = useRouter();

    // Pulse animation for the clock icon
    const pulse = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.15, duration: 900, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, []);

    // If approved while on this screen, redirect immediately
    useEffect(() => {
        if (accessStatus === 'approved') {
            router.replace('/(tabs)/dashboard' as any);
        }
    }, [accessStatus]);

    const handleLogout = async () => {
        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await logout();
            router.replace('/login' as any);
        } catch { }
    };

    const isRejected = accessStatus === 'rejected';

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.inner}>
                {/* Icon */}
                <Animated.View style={[styles.iconWrap, { transform: [{ scale: pulse }] }, isRejected && styles.iconWrapRejected]}>
                    <Ionicons
                        name={isRejected ? 'close-circle' : 'time'}
                        size={56}
                        color={isRejected ? '#FF453A' : '#0A84FF'}
                    />
                </Animated.View>

                {/* Title & body */}
                <Text style={styles.title}>
                    {isRejected ? 'Access Denied' : 'Awaiting Approval'}
                </Text>
                <Text style={styles.subtitle}>
                    {isRejected
                        ? 'Your request to access the app was declined by the admin.\nPlease contact your manager for assistance.'
                        : "Your request to access the app has been sent.\nPlease wait while the admin reviews and approves your account."}
                </Text>

                {/* User info card */}
                <View style={styles.userCard}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>
                            {user?.displayName?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? '?'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                    </View>
                </View>

                {/* Status pill */}
                <View style={[styles.statusPill, isRejected ? styles.statusPillRejected : styles.statusPillPending]}>
                    <View style={[styles.statusDot, isRejected ? styles.statusDotRejected : styles.statusDotPending]} />
                    <Text style={[styles.statusText, isRejected ? styles.statusTextRejected : styles.statusTextPending]}>
                        {isRejected ? 'Request Rejected' : 'Request Pending'}
                    </Text>
                </View>

                {!isRejected && (
                    <Text style={styles.hint}>
                        This page will update automatically once the admin takes action.
                    </Text>
                )}

                {/* Log out button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={18} color="#FF453A" />
                    <Text style={styles.logoutText}>Sign out</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

    iconWrap: {
        width: 100, height: 100, borderRadius: 30,
        backgroundColor: 'rgba(10,132,255,0.12)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 28,
    },
    iconWrapRejected: { backgroundColor: 'rgba(255,69,58,0.12)' },

    title: { fontSize: 26, fontFamily: 'Outfit_700Bold', color: '#fff', marginBottom: 12, textAlign: 'center' },
    subtitle: { fontSize: 15, fontFamily: 'Outfit_400Regular', color: '#8e8e93', textAlign: 'center', lineHeight: 23, marginBottom: 32 },

    userCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: '#1c1c1e', borderRadius: 18,
        paddingHorizontal: 20, paddingVertical: 16,
        width: '100%', marginBottom: 20,
    },
    avatarCircle: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: '#0A84FF', alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: 22, fontFamily: 'Outfit_700Bold', color: '#fff' },
    userName: { fontSize: 16, fontFamily: 'Outfit_600SemiBold', color: '#fff', marginBottom: 2 },
    userEmail: { fontSize: 13, fontFamily: 'Outfit_400Regular', color: '#8e8e93' },

    statusPill: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
        marginBottom: 16,
    },
    statusPillPending: { backgroundColor: 'rgba(10,132,255,0.12)' },
    statusPillRejected: { backgroundColor: 'rgba(255,69,58,0.12)' },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusDotPending: { backgroundColor: '#0A84FF' },
    statusDotRejected: { backgroundColor: '#FF453A' },
    statusText: { fontSize: 14, fontFamily: 'Outfit_600SemiBold' },
    statusTextPending: { color: '#0A84FF' },
    statusTextRejected: { color: '#FF453A' },

    hint: { fontSize: 12, fontFamily: 'Outfit_400Regular', color: '#48484a', textAlign: 'center', marginBottom: 40 },

    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 24, paddingVertical: 12,
        borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,69,58,0.25)',
    },
    logoutText: { fontSize: 15, fontFamily: 'Outfit_600SemiBold', color: '#FF453A' },
});
