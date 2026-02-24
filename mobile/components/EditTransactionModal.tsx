import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSales } from '../context/SalesContext';
import { Transaction, TransactionItem } from '../hooks/useSalesData';
import { useTheme } from '../hooks/useTheme';
import { CustomAlert } from './CustomAlert';

interface EditTransactionModalProps {
    visible: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

export default function EditTransactionModal({ visible, onClose, transaction }: EditTransactionModalProps) {
    const { updateTransaction, deleteTransaction } = useSales();
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';

    // State
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
    const [tip, setTip] = useState('');
    const [items, setItems] = useState<TransactionItem[]>([]);
    const [quantity, setQuantity] = useState('1');
    const [price, setPrice] = useState('0');
    const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);

    // Initialize state when transaction changes
    useEffect(() => {
        if (transaction) {
            setPaymentMethod(transaction.paymentMethod);
            setTip(transaction.tip > 0 ? transaction.tip.toString() : '');
            setItems(transaction.items || []);
            setQuantity((transaction.quantity || 1).toString());
            setPrice((transaction.price || 0).toString());
        }
    }, [transaction]);

    if (!transaction) return null;

    const isMultiItem = transaction.items && transaction.items.length > 0;

    const handleSave = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        let newTotalAmount = 0;
        if (isMultiItem) {
            if (items.length === 0) {
                Alert.alert("Error", "Order must have at least one item. Delete the transaction instead.");
                return;
            }
            const itemsTotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
            newTotalAmount = itemsTotal + (parseFloat(tip) || 0);
        } else {
            const itemTotal = parseFloat(price) * (parseInt(quantity) || 1);
            newTotalAmount = itemTotal + (parseFloat(tip) || 0);
        }

        const updatedTransaction: Transaction = {
            ...transaction,
            paymentMethod,
            tip: parseFloat(tip) || 0,
            totalAmount: newTotalAmount,
            items: isMultiItem ? items : [],
        };

        if (!isMultiItem) {
            updatedTransaction.price = parseFloat(price);
            updatedTransaction.quantity = parseInt(quantity) || 1;
        }

        await updateTransaction(updatedTransaction);
        onClose();
    };

    const handleDelete = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setDeleteAlertVisible(true);
    };

    const handleCancel = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onClose();
    };

    // Multi-item handlers
    const incrementItem = (index: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newItems = [...items];
        newItems[index].quantity += 1;
        setItems(newItems);
    };

    const decrementItem = (index: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newItems = [...items];
        if (newItems[index].quantity > 1) {
            newItems[index].quantity -= 1;
            setItems(newItems);
        } else {
            // Ask to delete
            Alert.alert(
                "Remove Item",
                `Remove ${newItems[index].productName} from order?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Remove",
                        style: "destructive",
                        onPress: () => removeItem(index)
                    }
                ]
            );
        }
    };

    const removeItem = (index: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    // Legacy helpers
    const incrementQuantity = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setQuantity(q => (parseInt(q) + 1).toString());
    };

    const decrementQuantity = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setQuantity(q => Math.max(1, parseInt(q) - 1).toString());
    };

    return (
        <>
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
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={[styles.title, isDark && styles.titleDark]}>
                                    {isMultiItem ? 'Edit Order' : `Edit ${transaction.productName}`}
                                </Text>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {isMultiItem ? (
                                    <View style={[styles.itemsList, isDark && styles.itemsListDark]}>
                                        <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark, { marginBottom: 12 }]}>Items</Text>
                                        {items.map((item, index) => (
                                            <View key={index} style={[styles.itemRow, isDark && styles.itemRowDark]}>
                                                <View style={styles.itemInfo}>
                                                    <Text style={[styles.itemName, isDark && styles.itemNameDark]}>
                                                        {item.productName}
                                                    </Text>
                                                    <Text style={[styles.itemPrice, isDark && styles.itemPriceDark]}>
                                                        ${item.price.toFixed(2)}
                                                    </Text>
                                                </View>

                                                <View style={styles.itemControls}>
                                                    <TouchableOpacity
                                                        onPress={() => decrementItem(index)}
                                                        style={[styles.controlButton, isDark && styles.controlButtonDark]}
                                                    >
                                                        <Text style={[styles.controlButtonText, isDark && styles.controlButtonTextDark]}>−</Text>
                                                    </TouchableOpacity>

                                                    <Text style={[styles.itemQuantity, isDark && styles.itemQuantityDark]}>
                                                        {item.quantity}
                                                    </Text>

                                                    <TouchableOpacity
                                                        onPress={() => incrementItem(index)}
                                                        style={[styles.controlButton, isDark && styles.controlButtonDark]}
                                                    >
                                                        <Text style={[styles.controlButtonText, isDark && styles.controlButtonTextDark]}>+</Text>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        onPress={() => removeItem(index)}
                                                        style={[styles.removeButton, isDark && styles.removeButtonDark]}
                                                    >
                                                        <Text style={styles.removeButtonText}>✕</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ))}
                                        <View style={styles.totalRow}>
                                            <Text style={[styles.totalLabel, isDark && styles.totalLabelDark]}>Total Items</Text>
                                            <Text style={[styles.totalValue, isDark && styles.totalValueDark]}>
                                                ${items.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                ) : (
                                    <>
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
                                    </>
                                )}

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
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            <CustomAlert
                visible={deleteAlertVisible}
                title="Delete Transaction"
                message="Are you sure you want to delete this transaction?"
                icon="trash-outline"
                buttons={[
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => setDeleteAlertVisible(false),
                    },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                            setDeleteAlertVisible(false);
                            await deleteTransaction(transaction.id);
                            onClose();
                        },
                    },
                ]}
                onDismiss={() => setDeleteAlertVisible(false)}
            />
        </>
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
        maxHeight: '85%',
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
        maxHeight: '100%',
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
    title: {
        fontSize: 20,
        fontFamily: 'Outfit_700Bold',
        color: '#000000',
        textAlign: 'center',
    },
    titleDark: {
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
        marginBottom: 20,
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
    itemsList: {
        marginBottom: 20,
        backgroundColor: '#f2f2f7',
        borderRadius: 14,
        padding: 16,
    },
    itemsListDark: {
        backgroundColor: '#2c2c2e',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5ea',
    },
    itemRowDark: {
        borderBottomColor: '#3a3a3c',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000000',
        marginBottom: 2,
    },
    itemNameDark: {
        color: '#ffffff',
    },
    itemPrice: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: '#8e8e93',
    },
    itemPriceDark: {
        color: '#98989d',
    },
    itemControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    controlButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    controlButtonDark: {
        backgroundColor: '#48484a',
    },
    controlButtonText: {
        fontSize: 20,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000000',
        marginTop: -2,
    },
    controlButtonTextDark: {
        color: '#ffffff',
    },
    itemQuantity: {
        fontSize: 16,
        fontFamily: 'Outfit_700Bold',
        color: '#000000',
        minWidth: 20,
        textAlign: 'center',
    },
    itemQuantityDark: {
        color: '#ffffff',
    },
    removeButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
    },
    removeButtonDark: {
        // No specific style needed, icon handles color
    },
    removeButtonText: {
        fontSize: 18,
        color: '#FF3B30',
        fontWeight: 'bold',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#d1d1d6',
    },
    totalLabel: {
        fontSize: 15,
        fontFamily: 'Outfit_700Bold',
        color: '#000000',
    },
    totalLabelDark: {
        color: '#ffffff',
    },
    totalValue: {
        fontSize: 15,
        fontFamily: 'Outfit_700Bold',
        color: '#007AFF',
    },
    totalValueDark: {
        color: '#0A84FF',
    },
});
