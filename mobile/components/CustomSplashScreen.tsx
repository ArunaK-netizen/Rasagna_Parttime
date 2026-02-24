import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    runOnJS,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface CustomSplashScreenProps {
    onFinish: () => void;
    isReady: boolean;
}

export function CustomSplashScreen({ onFinish, isReady }: CustomSplashScreenProps) {
    const progress = useSharedValue(0);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';

    // Animation constants
    const CIRCLE_LENGTH = 1000; // Approximate circumference for r=45 (2*pi*45 ≈ 283). Using higher value to be safe or exact calculation?
    // r=40 -> C = 2 * PI * 40 = 251.3
    const R = 40;
    const C = 2 * Math.PI * R;

    // Tick path length approx
    const TICK_LENGTH = 100;

    useEffect(() => {
        if (isReady) {
            SplashScreen.hideAsync().catch(() => {
                // Ignore if already hidden / not available in this environment.
            }); // Hide native splash to show our custom animation

            // Sequence:
            // 0 -> 1: Circle draws (0-30%)
            // 1 -> 2: Circle fills (30-60%)
            // 2 -> 3: Tick draws (60-100%)

            progress.value = withSequence(
                // Draw circle
                withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
                // Fill circle (handled via interpolation based on same progress or next step)
                // Let's use a continuous value 0->3 for easier sequencing

                // Wait a tiny bit
                withDelay(100,
                    // Fill circle & Draw Tick
                    withTiming(2, { duration: 500, easing: Easing.out(Easing.cubic) })
                )
            );

            // Exit sequence after animation
            setTimeout(() => {
                scale.value = withTiming(1.2, { duration: 400 });
                opacity.value = withTiming(0, { duration: 400 }, (finished) => {
                    if (finished) {
                        runOnJS(onFinish)();
                    }
                });
            }, 1400); // 600 + 100 + 500 + buffer
        }
    }, [isReady]);

    const circleAnimatedProps = useAnimatedProps(() => {
        // Draw from 0 to 1
        return {
            strokeDashoffset: C - (C * Math.min(progress.value, 1)),
            fillOpacity: interpolate(progress.value, [1, 1.5], [0, 1]), // Start filling after circle drawn
        };
    });

    const tickAnimatedProps = useAnimatedProps(() => {
        // Draw from 1.5 to 2
        const tickProgress = interpolate(progress.value, [1.5, 2], [0, 1], 'clamp');
        return {
            strokeDashoffset: TICK_LENGTH - (TICK_LENGTH * tickProgress),
            opacity: interpolate(progress.value, [1.4, 1.5], [0, 1], 'clamp'),
        };
    });

    const containerStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    const iconStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const bgColor = isDark ? '#000000' : '#ffffff';
    const brandColor = '#007AFF'; // Google Blue-ish or App Blue

    return (
        <View pointerEvents="none" style={[styles.container, { backgroundColor: bgColor }]}>
            <Animated.View style={[styles.contentContainer, containerStyle]}>
                <Animated.View style={[styles.iconContainer, iconStyle]}>
                    <Svg width={120} height={120} viewBox="0 0 100 100">
                        {/* Background Circle (fills in) */}
                        <AnimatedCircle
                            cx="50"
                            cy="50"
                            r={R}
                            stroke={brandColor}
                            strokeWidth={5}
                            fill={brandColor}
                            strokeDasharray={C}
                            animatedProps={circleAnimatedProps}
                            strokeLinecap="round"
                        />
                        {/* Checkmark */}
                        <AnimatedPath
                            d="M30 52 L45 67 L70 38"
                            stroke="#ffffff"
                            strokeWidth={6}
                            fill="none"
                            strokeDasharray={TICK_LENGTH}
                            animatedProps={tickAnimatedProps}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                </Animated.View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 99999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
