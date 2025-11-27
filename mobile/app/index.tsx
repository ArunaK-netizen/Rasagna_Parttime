import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { loadData, STORAGE_KEYS } from '../utils/storage';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
    const [isReady, setIsReady] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        checkOnboarding();
    }, []);

    const checkOnboarding = async () => {
        const completed = await loadData(STORAGE_KEYS.ONBOARDING_COMPLETED);
        setShowOnboarding(!completed);
        setIsReady(true);
    };

    if (!isReady) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    if (showOnboarding) {
        return <Redirect href="/onboarding" />;
    }

    return <Redirect href="/(tabs)/dashboard" />;
}
