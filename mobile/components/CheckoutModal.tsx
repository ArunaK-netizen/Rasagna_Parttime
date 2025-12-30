import { format } from 'date-fns';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSales } from '../context/SalesContext';
import { useTheme } from '../hooks/useTheme';

interface CheckoutModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function CheckoutModal({ visible, onClose }: CheckoutModalProps) {
    const { cart, removeFromCart, addTransaction } = useSales();
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';

    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
    const [tip, setTip] = useState('');

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalAmount = totalAmount + (parseFloat(tip) || 0);

    const handleConfirm = async () => {
        if (cart.length === 0) return;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        await addTransaction({
            items: cart,
            totalAmount: finalAmount,
            paymentMethod,
            tip: parseFloat(tip) || 0,
            date: format(new Date(), 'yyyy-MM-dd'),
        });

        // Reset state for next time
        setPaymentMethod('cash');
        setTip('');
        onClose();
    };

    const handleCancel = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onClose();
    };

    const handleRemoveItem = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        removeFromCart(id);
        // If cart becomes empty, maybe we should close? 
        // Original logic: if cart is empty, showed "Cart is empty" screen.
        // Here, if cart is empty, we can just close the modal or show empty state.
        // But since the button to open this modal is only visible if cart.length > 0 in dashboard,
        // it's likely fine. However, removing items until 0 inside the modal is possible.
    };

    // If cart is empty while modal is open (e.g. removed all items), show empty state or close
    if (visible && cart.length === 0) {
        // Maybe better to just close it effectively? 
        // Or show "Cart is empty" message.
        // Let's stick effectively to original logic but adapted for Modal.
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={visible}
                onRequestClose={handleCancel}
            >
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
                    <View style={[styles.modal, isDark && styles.modalDark, { height: 'auto', paddingVertical: 40 }]}>
                        <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>Cart is empty</Text>
                        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
                            <Text style={styles.backButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={handleCancel}
        >
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
                        <View style={styles.header}>
                            <Text style={[styles.title, isDark && styles.titleDark]}>Checkout</Text>
                            <Text style={[styles.itemCount, isDark && styles.itemCountDark]}>{cart.length} items</Text>
                        </View>

                        <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
                            {cart.map((item) => (
                                <View key={item.id} style={[styles.itemRow, isDark && styles.itemRowDark]}>
                                    <View style={styles.itemInfo}>
                                        <Text style={[styles.itemName, isDark && styles.itemNameDark]}>{item.productName}</Text>
                                        <Text style={[styles.itemDetails, isDark && styles.itemDetailsDark]}>
                                            {item.quantity}x ${item.price.toFixed(2)}
                                        </Text>
                                    </View>
                                    <View style={styles.itemRight}>
                                        <Text style={[styles.itemTotal, isDark && styles.itemTotalDark]}>
                                            ${(item.quantity * item.price).toFixed(2)}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => handleRemoveItem(item.id)}
                                            style={styles.removeButton}
                                        >
                                            <Text style={styles.removeButtonText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        <View style={styles.footer}>
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

                            {/* Total & Actions */}
                            <View style={styles.totalSection}>
                                <View style={styles.totalRow}>
                                    <Text style={[styles.totalLabel, isDark && styles.totalLabelDark]}>Total Amount</Text>
                                    <Text style={styles.totalValue}>${finalAmount.toFixed(2)}</Text>
                                </View>

                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        onPress={handleCancel}
                                        style={[styles.cancelButton, isDark && styles.cancelButtonDark]}
                                    >
                                        <Text style={[styles.cancelButtonText, isDark && styles.cancelButtonTextDark]}>Back</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleConfirm}
                                        style={styles.confirmButton}
                                    >
                                        <Text style={styles.confirmButtonText}>Confirm Sale</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
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
        height: '100%',
        justifyContent: 'flex-end',
        // Match app/checkout.tsx behavior which was full screen-ish but here we want it modal-like.
        // app/checkout.tsx had justifyContent: 'flex-end' for keyboardView and height '85%' for modal.
    },
    modal: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        height: '85%',
        width: '100%', // Ensure full width
    },
    modalDark: {
        backgroundColor: '#1c1c1e',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f7',
    },
    title: {
        fontSize: 24,
        fontFamily: 'Outfit_700Bold',
        color: '#000000',
    },
    titleDark: {
        color: '#ffffff',
    },
    itemCount: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: '#8e8e93',
    },
    itemCountDark: {
        color: '#98989d',
    },
    itemsList: {
        flex: 1,
        marginBottom: 20,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f7',
    },
    itemRowDark: {
        borderBottomColor: '#2c2c2e',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000000',
        marginBottom: 4,
    },
    itemNameDark: {
        color: '#ffffff',
    },
    itemDetails: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: '#8e8e93',
    },
    itemDetailsDark: {
        color: '#98989d',
    },
    itemRight: {
        alignItems: 'flex-end',
        gap: 4,
    },
    itemTotal: {
        fontSize: 16,
        fontFamily: 'Outfit_700Bold',
        color: '#000000',
    },
    itemTotalDark: {
        color: '#ffffff',
    },
    removeButton: {
        padding: 4,
    },
    removeButtonText: {
        fontSize: 14,
        color: '#FF3B30',
        fontWeight: 'bold',
    },
    footer: {
        gap: 20,
    },
    section: {
        gap: 8,
    },
    label: {
        fontSize: 15,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000000',
    },
    labelDark: {
        color: '#ffffff',
    },
    paymentButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    paymentButton: {
        flex: 1,
        paddingVertical: 12,
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
        fontSize: 14,
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
        paddingVertical: 12,
        borderRadius: 12,
    },
    tipInputDark: {
        backgroundColor: '#2c2c2e',
    },
    dollarSign: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: '#8e8e93',
        marginRight: 8,
    },
    dollarSignDark: {
        color: '#98989d',
    },
    tipTextInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: '#000000',
    },
    tipTextInputDark: {
        color: '#ffffff',
    },
    totalSection: {
        borderTopWidth: 1,
        borderTopColor: '#f2f2f7',
        paddingTop: 20,
        gap: 16,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 18,
        fontFamily: 'Outfit_700Bold',
        color: '#000000',
    },
    totalLabelDark: {
        color: '#ffffff',
    },
    totalValue: {
        fontSize: 24,
        fontFamily: 'Outfit_700Bold',
        color: '#007AFF',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        backgroundColor: '#f2f2f7',
        borderRadius: 14,
        alignItems: 'center',
    },
    cancelButtonDark: {
        backgroundColor: '#2c2c2e',
    },
    cancelButtonText: {
        fontSize: 17,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000000',
    },
    cancelButtonTextDark: {
        color: '#ffffff',
    },
    confirmButton: {
        flex: 2,
        paddingVertical: 16,
        backgroundColor: '#007AFF',
        borderRadius: 14,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 17,
        fontFamily: 'Outfit_700Bold',
        color: '#ffffff',
    },
    emptyText: {
        fontSize: 18,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000000',
        marginBottom: 20,
        textAlign: 'center',
    },
    emptyTextDark: {
        color: '#ffffff',
    },
    backButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#007AFF',
        borderRadius: 12,
        alignSelf: 'center',
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
    },
});
