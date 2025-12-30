import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Updates from 'expo-updates';
import { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { STORAGE_KEYS } from '../utils/storage';

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        try {
            setLoading(true);
            const products = await AsyncStorage.getItem('@parttime_products');
            const transactions = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);

            const exportData = {
                version: 1,
                timestamp: Date.now(),
                products: products ? JSON.parse(products) : {},
                transactions: transactions ? JSON.parse(transactions) : [],
            };

            const fileName = `backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
            const fileUri = FileSystem.cacheDirectory + fileName;

            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(exportData, null, 2));
            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/json',
                UTI: 'public.json',
            });
        } catch (error) {
            Alert.alert('Export Failed', 'Could not export data.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            setLoading(true);
            const fileUri = result.assets[0].uri;
            const fileContent = await FileSystem.readAsStringAsync(fileUri);
            const importedData = JSON.parse(fileContent);

            if (!importedData.transactions) {
                Alert.alert('Invalid File', 'The selected file does not contain transaction data.');
                setLoading(false);
                return;
            }

            // Get current data to check if empty
            const currentProductsStr = await AsyncStorage.getItem('@parttime_products');
            const currentTransactionsStr = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);

            const currentProducts = currentProductsStr ? JSON.parse(currentProductsStr) : {};
            const currentTransactions = currentTransactionsStr ? JSON.parse(currentTransactionsStr) : [];

            // Check if there is any existing data
            const hasTransactions = Array.isArray(currentTransactions) && currentTransactions.length > 0;
            const hasProducts = currentProducts && Object.values(currentProducts).some((list: any) => Array.isArray(list) && list.length > 0);

            const performOverwrite = async () => {
                try {
                    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(importedData.transactions));
                    // Optional: Provide visual feedback before reload?
                    await Updates.reloadAsync();
                } catch (e) {
                    Alert.alert('Error', 'Failed to restore data.');
                    console.error(e);
                    setLoading(false);
                }
            };

            const performMerge = async () => {
                try {
                    // Merge Transactions
                    // Create a map of existing transactions by ID (or fallback to date+amount hash) to avoid duplicates
                    // Assuming transactions have 'id'. If not, we might append all or check content.
                    const mergedTransactions = [...currentTransactions];
                    const existingIds = new Set(mergedTransactions.map((t: any) => t.id).filter(Boolean));

                    const newTransactions = importedData.transactions.filter((t: any) => {
                        if (t.id && existingIds.has(t.id)) return false;
                        // Weak duplicate check if no ID? For now assume IDs exist or simple append is acceptable for legacy.
                        return true;
                    });



                    mergedTransactions.push(...newTransactions);

                    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(mergedTransactions));
                    await Updates.reloadAsync();

                } catch (e) {
                    Alert.alert('Error', 'Failed to merge data.');
                    console.error(e);
                    setLoading(false);
                }
            };

            if (!hasTransactions) {
                // No existing data, automatically overwrite
                await performOverwrite();
            } else {
                // Ask user
                Alert.alert(
                    'Import Transactions',
                    'Existing transactions found. Would you like to merge imported transactions with your existing history, or overwrite them?',
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                            onPress: () => setLoading(false)
                        },
                        {
                            text: 'Overwrite',
                            style: 'destructive',
                            onPress: performOverwrite
                        },
                        {
                            text: 'Merge',
                            onPress: performMerge
                        }
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Import Failed', 'Could not import data.');
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
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
                    onPress={onClose}
                />
                <View style={[styles.modal, isDark && styles.modalDark]}>
                    <Text style={[styles.title, isDark && styles.titleDark]}>Settings</Text>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Data Management</Text>
                        <Text style={[styles.description, isDark && styles.descriptionDark]}>
                            Backup your products and sales history to a file, or restore from a backup.
                        </Text>

                        <TouchableOpacity
                            style={[styles.button, styles.exportButton]}
                            onPress={handleExport}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>📤 Export Data (JSON)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.importButton, isDark && styles.importButtonDark]}
                            onPress={handleImport}
                            disabled={loading}
                        >
                            <Text style={[styles.importText, isDark && styles.importTextDark]}>📥 Import Data (JSON)</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
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
    modal: {
        width: '85%',
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    modalDark: {
        backgroundColor: '#1c1c1e',
    },
    title: {
        fontSize: 24,
        fontFamily: 'Outfit_700Bold',
        color: '#000000',
        marginBottom: 20,
        textAlign: 'center',
    },
    titleDark: {
        color: '#ffffff',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 17,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000000',
        marginBottom: 8,
    },
    sectionTitleDark: {
        color: '#ffffff',
    },
    description: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: '#8e8e93',
        marginBottom: 16,
        lineHeight: 20,
    },
    descriptionDark: {
        color: '#98989d',
    },
    button: {
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    exportButton: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
    },
    importButton: {
        backgroundColor: '#f2f2f7',
    },
    importButtonDark: {
        backgroundColor: '#2c2c2e',
    },
    importText: {
        color: '#007AFF',
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
    },
    importTextDark: {
        color: '#0A84FF',
    },
    closeButton: {
        alignItems: 'center',
        padding: 12,
    },
    closeButtonText: {
        color: '#8e8e93',
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
    },
});
