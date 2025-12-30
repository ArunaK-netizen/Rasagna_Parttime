import * as FileSystem from 'expo-file-system/legacy';

// Ensure directory exists and is valid
const getBackupUri = () => {
    if (!FileSystem.documentDirectory) {
        console.warn('FileSystem.documentDirectory is null');
        return null;
    }
    return FileSystem.documentDirectory + 'auto_backup.json';
};

export interface BackupData {
    version: number;
    timestamp: number;
    products: any;
    transactions: any;
}

export const BackupService = {
    saveBackup: async (data: BackupData) => {
        const uri = getBackupUri();
        if (!uri) return;

        try {
            await FileSystem.writeAsStringAsync(uri, JSON.stringify(data));
            console.log('Backup saved successfully to:', uri);
        } catch (error) {
            console.error('Failed to save backup:', error);
        }
    },

    checkForBackup: async (): Promise<boolean> => {
        const uri = getBackupUri();
        if (!uri) return false;

        try {
            const info = await FileSystem.getInfoAsync(uri);
            return info.exists;
        } catch (error) {
            console.error('Error checking backup:', error);
            return false;
        }
    },

    restoreBackup: async (): Promise<BackupData | null> => {
        const uri = getBackupUri();
        if (!uri) return null;

        try {
            const content = await FileSystem.readAsStringAsync(uri);
            return JSON.parse(content);
        } catch (error) {
            console.error('Failed to restore backup:', error);
            return null;
        }
    }
};
