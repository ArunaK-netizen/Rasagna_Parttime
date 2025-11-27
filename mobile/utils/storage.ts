import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
    TRANSACTIONS: 'transactions',
    ONBOARDING_COMPLETED: 'onboarding_completed',
    THEME: 'theme',
};

export const saveData = async (key: string, value: any) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
        console.error('Error saving data', e);
    }
};

export const loadData = async (key: string) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error('Error loading data', e);
        return null;
    }
};

export const clearData = async (key: string) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (e) {
        console.error('Error clearing data', e);
    }
};
