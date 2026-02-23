import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface CustomAlertButton {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
}

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    icon?: keyof typeof Ionicons.glyphMap;
    buttons: CustomAlertButton[];
    onDismiss?: () => void;
}

export function CustomAlert({ visible, title, message, icon = 'alert-circle', buttons, onDismiss }: CustomAlertProps) {
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';

    if (!visible) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onDismiss}
        >
            <View style={styles.centeredView}>
                <BlurView
                    intensity={Platform.OS === 'ios' ? 40 : 100}
                    tint={isDark ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                />

                {/* Backdrop touch to close logic could be here if needed, but Modal prevents it usually unless we add a specific overlay */}
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={onDismiss}
                />

                <View style={[styles.modalView, isDark && styles.modalViewDark]}>
                    {/* Icon */}
                    <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
                        <Ionicons name={icon} size={32} color={isDark ? '#FF9F0A' : '#FF9500'} />
                    </View>

                    <Text style={[styles.title, isDark && styles.titleDark]}>
                        {title}
                    </Text>

                    <Text style={[styles.message, isDark && styles.messageDark]}>
                        {message}
                    </Text>

                    <View style={styles.buttonContainer}>
                        {buttons.map((btn, index) => {
                            const isPrimary = btn.style !== 'cancel';
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.button,
                                        isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
                                        isDark && !isPrimary && styles.buttonSecondaryDark
                                    ]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        btn.onPress?.();
                                    }}
                                >
                                    <Text style={[
                                        styles.buttonText,
                                        isPrimary ? styles.buttonTextPrimary : styles.buttonTextSecondary,
                                        isDark && !isPrimary && styles.buttonTextSecondaryDark
                                    ]}>
                                        {btn.text}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '85%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 10,
    },
    modalViewDark: {
        backgroundColor: 'rgba(28, 28, 30, 0.95)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconContainer: {
        marginBottom: 16,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF5E5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainerDark: {
        backgroundColor: 'rgba(255, 159, 10, 0.15)',
    },
    title: {
        fontSize: 20,
        fontFamily: 'Outfit_700Bold',
        textAlign: 'center',
        marginBottom: 8,
        color: '#000',
    },
    titleDark: {
        color: '#fff',
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24,
        color: '#3A3A3C',
        lineHeight: 22,
        fontFamily: 'Outfit_400Regular',
    },
    messageDark: {
        color: '#E5E5EA',
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    button: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPrimary: {
        backgroundColor: '#007AFF',
    },
    buttonSecondary: {
        backgroundColor: '#F2F2F7',
    },
    buttonSecondaryDark: {
        backgroundColor: '#2C2C2E',
    },
    buttonText: {
        fontSize: 17,
        fontFamily: 'Outfit_600SemiBold',
    },
    buttonTextPrimary: {
        color: '#FFFFFF',
    },
    buttonTextSecondary: {
        color: '#000000',
    },
    buttonTextSecondaryDark: {
        color: '#FFFFFF',
    },
});
