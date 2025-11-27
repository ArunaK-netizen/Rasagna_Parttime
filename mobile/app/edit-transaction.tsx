import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useSales } from '../context/SalesContext';
import { BlurView } from 'expo-blur';
import { useTheme } from '../hooks/useTheme';
import * as Haptics from 'expo-haptics';

export default function EditTransaction() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { updateTransaction, deleteTransaction } = useSales();
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';

    // Parse initial values from params
    const id = params.id as string;
    const initialProductName = params.productName as string;
    const initialPrice = parseFloat(params.price as string);
    const initialQuantity = parseInt(params.quantity as string);
    const initialTip = parseFloat(params.tip as string) || 0;
    const initialPaymentMethod = params.paymentMethod as 'cash' | 'card' | 'upi';
    const timestamp = parseInt(params.timestamp as string);
    const date = params.date as string;
    const category = params.category as string;

    const [quantity, setQuantity] = useState(initialQuantity.toString());
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>(initialPaymentMethod);
    const [tip, setTip] = useState(initialTip > 0 ? initialTip.toString() : '');
    const [price, setPrice] = useState(initialPrice.toString());

    const handleSave = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await updateTransaction({
            id,
            productName: initialProductName,
            category,
            price: parseFloat(price),
            quantity: parseInt(quantity) || 1,
            paymentMethod,
            tip: parseFloat(tip) || 0,
            date,
            timestamp,
        });
        router.back();
    };

    const handleDelete = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
            "Delete Transaction",
            "Are you sure you want to delete this transaction?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteTransaction(id);
                        router.back();
                    }
                }
            ]
        );
    };

    const handleCancel = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const incrementQuantity = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setQuantity(q => (parseInt(q) + 1).toString());
    };

    const decrementQuantity = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setQuantity(q => Math.max(1, parseInt(q) - 1).toString());
    };

    return (
        <View style={styles.container}>
            <BlurView
                intensity={100}
                tint={isDark ? 'dark' : 'light'}
                style={styles.blurView}
            />

            <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={handleCancel}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={[styles.modal, isDark && styles.modalDark]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.productName, isDark && styles.productNameDark]}>
                            Edit {initialProductName}
                        </Text>
                    </View>

                    {/* Price */}
                    <View style={styles.section}>
                        <Text style={[styles.label, isDark && styles.labelDark]}>Price ($)</Text>
                        <TextInput
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            style={[styles.input, isDark && styles.inputDark]}
                        />
                    </View>

                    {/* Quantity */}
                    <View style={[styles.section, styles.quantitySection, isDark && styles.sectionDark]}>
                        <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark]}>Quantity</Text>
                        <View style={styles.quantityControls}>
                            <TouchableOpacity
                                onPress={decrementQuantity}
                                style={[styles.quantityButton, isDark && styles.quantityButtonDark]}
                            >
                                <Text style={[styles.quantityButtonText, isDark && styles.quantityButtonTextDark]}>−</Text>
                            </TouchableOpacity>
                            <TextInput
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="numeric"
                                style={[styles.quantityInput, isDark && styles.quantityInputDark]}
                            />
                            <TouchableOpacity
                                onPress={incrementQuantity}
                                style={styles.quantityButtonPrimary}
                            >
                                <Text style={styles.quantityButtonTextPrimary}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Payment Method */}
                    <View style={styles.section}>
                        <Text style={[styles.label, isDark && styles.labelDark]}>Payment Method</Text>
                        <View style={styles.paymentButtons}>
                            {(['cash', 'card', 'upi'] as const).map(method => {
                                const isSelected = paymentMethod === method;
                                return (
                                    <TouchableOpacity
                                        key={method}
                                        onPress={() => setPaymentMethod(method)}
                                        style={[
                                            styles.paymentButton,
                                            isSelected && styles.paymentButtonSelected,
                                            isDark && !isSelected && styles.paymentButtonDark,
                                        ]}
                                    >
                                        <Text style={[
                                            styles.paymentButtonText,
                                            isSelected && styles.paymentButtonTextSelected,
                                            isDark && !isSelected && styles.paymentButtonTextDark,
                                        ]}>
                                            {method.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Tip */}
                    <View style={styles.section}>
                        <Text style={[styles.label, isDark && styles.labelDark]}>Tip (Optional)</Text>
                        <View style={[styles.tipInput, isDark && styles.tipInputDark]}>
                            <Text style={[styles.dollarSign, isDark && styles.dollarSignDark]}>$</Text>
                            <TextInput
                                value={tip}
                                onChangeText={setTip}
                                placeholder="0.00"
                                placeholderTextColor={isDark ? '#8e8e93' : '#c7c7cc'}
                                keyboardType="numeric"
                                style={[styles.tipTextInput, isDark && styles.tipTextInputDark]}
                            />
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            onPress={handleDelete}
                            style={[styles.deleteButton, isDark && styles.deleteButtonDark]}
                        >
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSave}
                            style={styles.saveButton}
                        >
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    blurView: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    backdrop: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    keyboardView: {
        width: '100%',
        paddingHorizontal: 24,
    },
    modal: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 8,
    },
    modalDark: {
        backgroundColor: '#1c1c1e',
        shadowOpacity: 0.4,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f7',
    },
    productName: {
        fontSize: 20,
        fontFamily: 'Outfit_700Bold',
        color: '#000000',
        textAlign: 'center',
    },
    productNameDark: {
        color: '#ffffff',
    },
    section: {
        marginBottom: 20,
    },
    quantitySection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f2f2f7',
        padding: 16,
        borderRadius: 14,
    },
    sectionDark: {
        backgroundColor: '#2c2c2e',
    },
    sectionLabel: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000000',
    },
    sectionLabelDark: {
        color: '#ffffff',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    quantityButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e5e5ea',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButtonDark: {
        backgroundColor: '#48484a',
    },
    quantityButtonText: {
        fontSize: 24,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000000',
        marginTop: -2,
    },
    quantityButtonTextDark: {
        color: '#ffffff',
    },
    quantityButtonPrimary: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButtonTextPrimary: {
        fontSize: 24,
        fontFamily: 'Outfit_600SemiBold',
        color: '#ffffff',
        marginTop: -2,
    },
    quantityInput: {
        fontSize: 20,
        fontFamily: 'Outfit_700Bold',
        color: '#000000',
        textAlign: 'center',
        width: 48,
    },
    quantityInputDark: {
        color: '#ffffff',
    },
    label: {
        fontSize: 15,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000000',
        marginBottom: 12,
    },
    labelDark: {
        color: '#ffffff',
    },
    input: {
        backgroundColor: '#f2f2f7',
        padding: 14,
        borderRadius: 12,
        fontSize: 17,
        fontFamily: 'Outfit_400Regular',
        color: '#000000',
    },
    inputDark: {
        backgroundColor: '#2c2c2e',
        color: '#ffffff',
    },
    paymentButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    paymentButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#f2f2f7',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    paymentButtonDark: {
        backgroundColor: '#2c2c2e',
    },
    paymentButtonSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    paymentButtonText: {
        fontSize: 15,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000000',
    },
    paymentButtonTextDark: {
        color: '#ffffff',
    },
    paymentButtonTextSelected: {
        color: '#ffffff',
    },
    tipInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f7',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
    },
    tipInputDark: {
        backgroundColor: '#2c2c2e',
    },
    dollarSign: {
        fontSize: 18,
        fontFamily: 'Outfit_600SemiBold',
        color: '#8e8e93',
        marginRight: 8,
    },
    dollarSignDark: {
        color: '#98989d',
    },
    tipTextInput: {
        flex: 1,
        fontSize: 17,
        fontFamily: 'Outfit_400Regular',
        color: '#000000',
    },
    tipTextInputDark: {
        color: '#ffffff',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    deleteButton: {
        flex: 1,
        paddingVertical: 16,
        backgroundColor: '#FF3B30',
        borderRadius: 14,
        alignItems: 'center',
    },
    deleteButtonDark: {
        backgroundColor: '#FF453A',
    },
    deleteButtonText: {
        fontSize: 17,
        fontFamily: 'Outfit_600SemiBold',
        color: '#ffffff',
    },
    saveButton: {
        flex: 2,
        paddingVertical: 16,
        backgroundColor: '#007AFF',
        borderRadius: 14,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 17,
        fontFamily: 'Outfit_700Bold',
        color: '#ffffff',
    },
});
