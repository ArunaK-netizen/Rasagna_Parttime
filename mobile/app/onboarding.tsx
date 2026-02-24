import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveData, STORAGE_KEYS } from '../utils/storage';

const SLIDES = [
    {
        title: "Track Sales Effortlessly",
        description: "Log your daily sales with a few taps. Keep track of cash, card, and tips.",
        icon: "📊"
    },
    {
        title: "Beautiful Insights",
        description: "Visualize your progress with daily, monthly, and yearly reports.",
        icon: "📈"
    },
    {
        title: "Stay Organized",
        description: "Never miss a log. Use the calendar to track your work days.",
        icon: "📅"
    }
];

export default function Onboarding() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const router = useRouter();

    const handleNext = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            await saveData(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
            router.replace('/login');
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#007AFF', '#0A84FF']}
                style={styles.gradient}
            />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <Animated.View
                        key={currentSlide}
                        entering={FadeInRight}
                        exiting={FadeOutLeft}
                        style={styles.slide}
                    >
                        <Text style={styles.icon}>{SLIDES[currentSlide].icon}</Text>
                        <Text style={styles.title}>
                            {SLIDES[currentSlide].title}
                        </Text>
                        <Text style={styles.description}>
                            {SLIDES[currentSlide].description}
                        </Text>
                    </Animated.View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.indicators}>
                        {SLIDES.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.indicator,
                                    index === currentSlide && styles.indicatorActive
                                ]}
                            />
                        ))}
                    </View>
                    <TouchableOpacity
                        onPress={handleNext}
                        style={styles.button}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>
                            {currentSlide === SLIDES.length - 1 ? "Get Started" : "Next"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.15,
    },
    safeArea: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    slide: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    icon: {
        fontSize: 96,
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontFamily: 'Outfit_700Bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 18,
        fontFamily: 'Outfit_400Regular',
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: 26,
        letterSpacing: -0.2,
    },
    footer: {
        gap: 24,
    },
    indicators: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
    },
    indicator: {
        height: 4,
        width: 24,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    indicatorActive: {
        width: 32,
        backgroundColor: '#007AFF',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 5,
    },
    buttonText: {
        fontSize: 18,
        fontFamily: 'Outfit_700Bold',
        color: '#ffffff',
        letterSpacing: -0.3,
    },
});
