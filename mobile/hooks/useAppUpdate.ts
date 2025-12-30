import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useAppUpdate() {
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [manifest, setManifest] = useState<any | null>(null);

    useEffect(() => {
        if (__DEV__) return;

        async function checkUpdate() {
            try {
                const update = await Updates.checkForUpdateAsync();
                if (update.isAvailable) {
                    setIsUpdateAvailable(true);
                    setManifest(update);
                }
            } catch (error) {
                console.log('Error checking for updates:', error);
            }
        }

        checkUpdate();
    }, []);

    const performUpdate = async () => {
        try {
            setIsDownloading(true);
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
        } catch (error) {
            setIsDownloading(false);
            Alert.alert('Error', 'Failed to download update.');
            console.log('Error downloading update:', error);
        }
    };

    const cancelUpdate = () => {
        setIsUpdateAvailable(false);
    };

    return {
        isUpdateAvailable,
        isDownloading,
        manifest,
        performUpdate,
        cancelUpdate,
    };
}
