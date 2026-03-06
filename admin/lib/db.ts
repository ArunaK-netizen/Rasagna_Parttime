import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

export type TransactionItem = {
    id: string;
    productName: string;
    category: string;
    price: number;
    quantity: number;
};

export type Transaction = {
    id: string;
    date: string;
    timestamp: number;
    items: TransactionItem[];
    totalAmount: number;
    paymentMethod: 'cash' | 'card' | 'upi';
    tip: number;
    userId?: string;
    userName?: string;
    // Legacy
    productName?: string;
    category?: string;
    price?: number;
    quantity?: number;
};

export type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    userId?: string;
    userName?: string;
};

export type AdminUser = {
    id: string;
    uid: string;
    email: string;
    name?: string;
    addedAt: number;
};

export type Announcement = {
    id: string;
    title: string;
    body: string;
    createdAt: number;
    createdBy: string;
};

export type AccessRequest = {
    id: string;
    uid: string;
    email: string;
    name: string;
    photoURL?: string;
    requestedAt: number;
    status: 'pending' | 'approved' | 'rejected';
};

export type ScheduleEntry = {
    id: string;
    employeeUid: string;
    employeeName: string;
    date: string;        // 'YYYY-MM-DD'
    startTime: string;   // 'HH:MM' 24h
    endTime: string;     // 'HH:MM' 24h
    note?: string;
    createdAt: number;
    createdBy: string;
};

// --- Transactions ---
export function subscribeTransactions(callback: (data: Transaction[]) => void) {
    const q = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snap) => {
        const data: Transaction[] = [];
        const seen = new Set<string>();
        snap.forEach((d) => {
            if (seen.has(d.id)) return;
            seen.add(d.id);
            data.push({ id: d.id, ...d.data() } as Transaction);
        });
        callback(data);
    });
}

export async function deleteTransaction(id: string) {
    await deleteDoc(doc(db, 'transactions', id));
}

// --- Products ---
export function subscribeProducts(callback: (data: Product[]) => void) {
    const q = query(collection(db, 'products'));
    return onSnapshot(q, (snap) => {
        const data: Product[] = [];
        snap.forEach((d) => data.push({ id: d.id, ...d.data() } as Product));
        callback(data);
    });
}

export async function addProduct(data: Omit<Product, 'id'>) {
    await addDoc(collection(db, 'products'), data);
}

export async function updateProduct(id: string, data: Partial<Product>) {
    const { id: _id, ...rest } = data as Partial<Product> & { id?: string };
    await updateDoc(doc(db, 'products', id), rest as Record<string, unknown>);
}

export async function deleteProduct(id: string) {
    await deleteDoc(doc(db, 'products', id));
}

// --- Admin Users ---
export function subscribeAdminUsers(callback: (data: AdminUser[]) => void) {
    return onSnapshot(collection(db, 'admin_users'), (snap) => {
        const data: AdminUser[] = [];
        snap.forEach((d) => data.push({ id: d.id, ...d.data() } as AdminUser));
        callback(data);
    });
}

export async function addAdminUser(user: Omit<AdminUser, 'id'>) {
    await addDoc(collection(db, 'admin_users'), user);
}

export async function removeAdminUser(id: string) {
    await deleteDoc(doc(db, 'admin_users', id));
}

// --- Admin Config (whitelist) ---
export async function getAdminEmails(): Promise<string[]> {
    const snap = await getDocs(collection(db, 'admin_config'));
    const emails: string[] = [];
    snap.forEach((d) => {
        const data = d.data();
        if (Array.isArray(data.adminEmails)) {
            emails.push(...data.adminEmails);
        }
    });
    return emails;
}

// Live subscription + mutation helpers for admin panel access
export function subscribeAdminEmails(callback: (emails: string[]) => void) {
    return onSnapshot(collection(db, 'admin_config'), (snap) => {
        const emails: string[] = [];
        snap.forEach((d) => {
            const data = d.data();
            if (Array.isArray(data.adminEmails)) emails.push(...data.adminEmails);
        });
        callback([...new Set(emails)]);
    });
}

export async function addAdminEmail(email: string) {
    const snap = await getDocs(collection(db, 'admin_config'));
    if (snap.empty) {
        // Create the config doc if it doesn't exist yet
        await addDoc(collection(db, 'admin_config'), { adminEmails: [email] });
    } else {
        const docRef = snap.docs[0].ref;
        const existing: string[] = snap.docs[0].data().adminEmails || [];
        if (!existing.includes(email)) {
            await updateDoc(docRef, { adminEmails: [...existing, email] } as Record<string, unknown>);
        }
    }
}

export async function removeAdminEmail(email: string) {
    const snap = await getDocs(collection(db, 'admin_config'));
    if (snap.empty) return;
    const docRef = snap.docs[0].ref;
    const existing: string[] = snap.docs[0].data().adminEmails || [];
    await updateDoc(docRef, { adminEmails: existing.filter(e => e !== email) } as Record<string, unknown>);
}

// --- Access Requests ---
export function subscribeAccessRequests(callback: (data: AccessRequest[]) => void) {
    const q = query(collection(db, 'access_requests'), orderBy('requestedAt', 'desc'));
    return onSnapshot(q, (snap) => {
        const data: AccessRequest[] = [];
        snap.forEach((d) => data.push({ id: d.id, ...d.data() } as AccessRequest));
        callback(data);
    });
}

export async function approveAccessRequest(request: AccessRequest) {
    // 1. Mark the request as approved
    await updateDoc(doc(db, 'access_requests', request.id), { status: 'approved' } as Record<string, unknown>);
    // 2. Add to admin_users so the mobile app lets them in
    const existing = await getDocs(
        query(collection(db, 'admin_users'))
    );
    const alreadyAdded = existing.docs.some(d => d.data().uid === request.uid);
    if (!alreadyAdded) {
        await addDoc(collection(db, 'admin_users'), {
            uid: request.uid,
            email: request.email,
            name: request.name,
            addedAt: Date.now(),
        });
    }
}

export async function rejectAccessRequest(id: string) {
    await updateDoc(doc(db, 'access_requests', id), { status: 'rejected' } as Record<string, unknown>);
}

// --- Announcements ---
export function subscribeAnnouncements(callback: (data: Announcement[]) => void) {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
        const data: Announcement[] = [];
        snap.forEach((d) => data.push({ id: d.id, ...d.data() } as Announcement));
        callback(data);
    });
}

export async function addAnnouncement(data: Omit<Announcement, 'id'>) {
    await addDoc(collection(db, 'announcements'), data);
}

export async function deleteAnnouncement(id: string) {
    await deleteDoc(doc(db, 'announcements', id));
}

// --- Schedules ---
export function subscribeSchedules(callback: (data: ScheduleEntry[]) => void) {
    const q = query(collection(db, 'schedules'), orderBy('date', 'asc'));
    return onSnapshot(q, (snap) => {
        const data: ScheduleEntry[] = [];
        snap.forEach((d) => data.push({ id: d.id, ...d.data() } as ScheduleEntry));
        callback(data);
    });
}

export async function addScheduleEntry(entry: Omit<ScheduleEntry, 'id'>) {
    await addDoc(collection(db, 'schedules'), entry);
}

export async function updateScheduleEntry(id: string, data: Partial<ScheduleEntry>) {
    const { id: _id, ...rest } = data as Partial<ScheduleEntry> & { id?: string };
    await updateDoc(doc(db, 'schedules', id), rest as Record<string, unknown>);
}

export async function deleteScheduleEntry(id: string) {
    await deleteDoc(doc(db, 'schedules', id));
}
