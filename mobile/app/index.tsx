import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { loadData, STORAGE_KEYS } from '../utils/storage';

export default function Index() {
    const [isReady, setIsReady] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        checkOnboarding();
    }, []);

    const checkOnboarding = async () => {
        const completed = await loadData(STORAGE_KEYS.ONBOARDING_COMPLETED);
        setShowOnboarding(!completed);
        setIsReady(true);
    };

    if (authLoading || !isReady) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    if (!user) {
        return <Redirect href="/login" />;
    }

    if (showOnboarding) {
        return <Redirect href="/onboarding" />;
    }

    return <Redirect href="/(tabs)/dashboard" />;
}
