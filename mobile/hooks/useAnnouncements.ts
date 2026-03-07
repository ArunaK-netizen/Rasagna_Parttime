import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, onSnapshot, orderBy, query } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { getDb } from '../firebase';

export type Announcement = {
    id: string;
    title: string;
    body: string;
    createdAt: number;
    createdBy: string;
};

export const useAnnouncements = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const checkUnread = async (anns: Announcement[]) => {
        try {
            const lastReadStr = await AsyncStorage.getItem('lastReadAnnouncements');
            const lastRead = lastReadStr ? parseInt(lastReadStr, 10) : 0;
            setUnreadCount(anns.filter(a => a.createdAt > lastRead).length);
        } catch (e) { }
    };

    useEffect(() => {
        const db = getDb();
        const q = query(
            collection(db, 'announcements'),
            orderBy('createdAt', 'desc'),
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            const data: Announcement[] = [];
            snap.forEach((d) => data.push({ id: d.id, ...d.data() } as Announcement));
            setAnnouncements(data);
            checkUnread(data);
            setLoading(false);
        }, () => {
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const markAsRead = async () => {
        try {
            await AsyncStorage.setItem('lastReadAnnouncements', Date.now().toString());
            setUnreadCount(0);
        } catch (e) { }
    };

    return { announcements, loading, unreadCount, markAsRead };
};
