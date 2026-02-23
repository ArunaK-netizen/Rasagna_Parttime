import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Product, useProducts } from '../context/ProductContext';
import { useTheme } from '../hooks/useTheme';
import { CustomAlert } from './CustomAlert';

interface AddProductModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function AddProductModal({ visible, onClose }: AddProductModalProps) {
    const { addProduct, updateProduct, categories, products } = useProducts();
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState(categories[0] || 'snacks');
    const [newCategory, setNewCategory] = useState('');
    const [isNewCategory, setIsNewCategory] = useState(false);

    // Reset form when opening/closing could be handled by a useEffect if needed, 
    // but typically explicit clearing on save is enough. 
    // Or we can rely on the component being unmounted if we conditionally render it,
    // but with Modal visible prop, it stays mounted.
    // Let's add a reset function.

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message: string;
        buttons: any[];
    }>({
        visible: false,
        title: '',
        message: '',
        buttons: [],
    });

    const resetForm = () => {
        setName('');
        setPrice('');
        setCategory(categories[0] || 'snacks');
        setNewCategory('');
        setIsNewCategory(false);
        setEditingProduct(null);
    };

    const handleSave = async () => {
        if (!name.trim() || !price.trim()) return;

        const finalCategory = isNewCategory ? newCategory.trim().toLowerCase() : category;
        const normalizedName = name.trim();

        if (!finalCategory) return;

        // Check for duplicate product if not already editing this specific product
        if (!editingProduct) {
            const existingProduct = Object.values(products).flat().find(
                p => p.name.toLowerCase() === normalizedName.toLowerCase()
            );

            if (existingProduct) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                setAlertConfig({
                    visible: true,
                    title: 'Product Already Exists',
                    message: `"${existingProduct.name}" already exists in ${existingProduct.category}. Do you want to edit it instead?`,
                    buttons: [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                            onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
                        },
                        {
                            text: 'Edit Product',
                            style: 'default',
                            onPress: () => {
                                setAlertConfig(prev => ({ ...prev, visible: false }));
                                setEditingProduct(existingProduct);
                                setName(existingProduct.name);
                                setPrice(existingProduct.price.toString());
                                setCategory(existingProduct.category);
                                setIsNewCategory(false);
                            }
                        }
                    ]
                });
                return;
            }
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (editingProduct) {
            await updateProduct({
                id: editingProduct.id,
                name: normalizedName,
                price: parseFloat(price),
                category: finalCategory,
            }, editingProduct.category);
        } else {
            await addProduct({
                name: normalizedName,
                price: parseFloat(price),
                category: finalCategory,
            });
        }

        resetForm();
        onClose();
    };

    const handleCancel = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        resetForm();
        onClose();
    };

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
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={[styles.title, isDark && styles.titleDark]}>
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </Text>
                        </View>

                        {/* Name */}
                        <View style={styles.section}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>Product Name</Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="e.g. Diet Coke"
                                placeholderTextColor={isDark ? '#8e8e93' : '#c7c7cc'}
                                style={[
                                    styles.input,
                                    isDark && styles.inputDark,
                                    editingProduct && styles.inputDisabled,
                                    editingProduct && isDark && styles.inputDisabledDark
                                ]}
                                editable={!editingProduct}
                            />
                        </View>

                        {/* Price */}
                        <View style={styles.section}>
                            <Text style={[styles.label, isDark && styles.labelDark]}>Price ($)</Text>
                            <TextInput
                                value={price}
                                onChangeText={setPrice}
                                placeholder="0.00"
                                placeholderTextColor={isDark ? '#8e8e93' : '#c7c7cc'}
                                keyboardType="numeric"
                                style={[styles.input, isDark && styles.inputDark]}
                            />
                        </View>

                        {/* Category */}
                        <View style={styles.section}>
                            <View style={styles.categoryHeader}>
                                <Text style={[styles.label, isDark && styles.labelDark]}>Category</Text>
                                <TouchableOpacity onPress={() => setIsNewCategory(!isNewCategory)}>
                                    <Text style={styles.toggleText}>
                                        {isNewCategory ? 'Select Existing' : 'Create New'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {isNewCategory ? (
                                <TextInput
                                    value={newCategory}
                                    onChangeText={setNewCategory}
                                    placeholder="e.g. desserts"
                                    placeholderTextColor={isDark ? '#8e8e93' : '#c7c7cc'}
                                    style={[styles.input, isDark && styles.inputDark]}
                                    autoCapitalize="none"
                                />
                            ) : (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                                    {categories.map(cat => (
                                        <TouchableOpacity
                                            key={cat}
                                            onPress={() => setCategory(cat)}
                                            style={[
                                                styles.categoryChip,
                                                category === cat && styles.categoryChipSelected,
                                                isDark && category !== cat && styles.categoryChipDark
                                            ]}
                                        >
                                            <Text style={[
                                                styles.categoryText,
                                                category === cat && styles.categoryTextSelected,
                                                isDark && category !== cat && styles.categoryTextDark
                                            ]}>
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                        </View>

                        {/* Actions */}
                        <View style={styles.actions}>
                            <TouchableOpacity
                                onPress={handleCancel}
                                style={[styles.cancelButton, isDark && styles.cancelButtonDark]}
                            >
                                <Text style={[styles.cancelButtonText, isDark && styles.cancelButtonTextDark]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSave}
                                style={[styles.saveButton, (!name || !price) && styles.saveButtonDisabled]}
                                disabled={!name || !price}
                            >
                                <Text style={styles.saveButtonText}>
                                    {editingProduct ? 'Update Product' : 'Add Product'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
            />
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
    label: {
        fontSize: 15,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000000',
        marginBottom: 8,
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
    inputDisabled: {
        opacity: 0.6,
        backgroundColor: '#e5e5ea',
    },
    inputDisabledDark: {
        backgroundColor: '#3a3a3c',
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    toggleText: {
        color: '#007AFF',
        fontSize: 14,
        fontFamily: 'Outfit_600SemiBold',
    },
    categoryScroll: {
        flexDirection: 'row',
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f2f2f7',
        marginRight: 8,
    },
    categoryChipDark: {
        backgroundColor: '#2c2c2e',
    },
    categoryChipSelected: {
        backgroundColor: '#007AFF',
    },
    categoryText: {
        fontSize: 14,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000000',
    },
    categoryTextDark: {
        color: '#ffffff',
    },
    categoryTextSelected: {
        color: '#ffffff',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
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
    saveButton: {
        flex: 2,
        paddingVertical: 16,
        backgroundColor: '#007AFF',
        borderRadius: 14,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        fontSize: 17,
        fontFamily: 'Outfit_700Bold',
        color: '#ffffff',
    },
});
