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
            setLoading(false);
        }, () => {
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { announcements, loading };
};
