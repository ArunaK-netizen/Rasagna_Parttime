import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { useTheme } from '../hooks/useTheme';

function timeAgo(ts: number): string {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    const days = Math.floor(diff / 86400);
    return days === 1 ? 'yesterday' : `${days}d ago`;
}

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AnnouncementsPage() {
    const router = useRouter();
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';
    const { announcements, loading } = useAnnouncements();

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={22} color="#0A84FF" />
                        <Text style={styles.backText}>Profile</Text>
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>Announcements</Text>
                    <View style={{ width: 80 }} />
                </View>

                {loading ? (
                    <ActivityIndicator color="#0A84FF" style={{ marginTop: 40 }} />
                ) : announcements.length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={styles.emptyEmoji}>📢</Text>
                        <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>No announcements yet</Text>
                        <Text style={[styles.emptySubtitle, isDark && styles.emptySubtitleDark]}>
                            Check back later for updates from management.
                        </Text>
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
                        <Text style={[styles.countLabel, isDark && styles.countLabelDark]}>
                            {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
                        </Text>
                        {announcements.map((ann, index) => {
                            const isRecent = Date.now() - ann.createdAt < 3 * 86400000;
                            return (
                                <View key={ann.id} style={[styles.card, isDark && styles.cardDark]}>
                                    {/* Top row */}
                                    <View style={styles.cardTop}>
                                        <View style={[styles.iconWrap, isRecent && styles.iconWrapRecent]}>
                                            <Ionicons
                                                name={isRecent ? 'megaphone' : 'megaphone-outline'}
                                                size={18}
                                                color={isRecent ? '#fff' : '#8e8e93'}
                                            />
                                        </View>
                                        <View style={styles.cardMeta}>
                                            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]} numberOfLines={2}>
                                                {ann.title}
                                            </Text>
                                            <View style={styles.metaRow}>
                                                {isRecent && (
                                                    <View style={styles.newBadge}>
                                                        <Text style={styles.newBadgeText}>NEW</Text>
                                                    </View>
                                                )}
                                                <Text style={styles.timeText}>{timeAgo(ann.createdAt)}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Body */}
                                    <Text style={[styles.cardBody, isDark && styles.cardBodyDark]}>
                                        {ann.body}
                                    </Text>

                                    {/* Footer */}
                                    <View style={[styles.cardFooter, isDark && styles.cardFooterDark]}>
                                        <Ionicons name="person-circle-outline" size={14} color="#8e8e93" />
                                        <Text style={styles.footerText}>{ann.createdBy}</Text>
                                        <Text style={styles.footerDot}>·</Text>
                                        <Text style={styles.footerText}>{formatDate(ann.createdAt)}</Text>
                                    </View>
                                </View>
                            );
                        })}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f2f7' },
    containerDark: { backgroundColor: '#000' },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, width: 80 },
    backText: { fontSize: 16, fontFamily: 'Outfit_600SemiBold', color: '#0A84FF' },
    headerTitle: { fontSize: 17, fontFamily: 'Outfit_700Bold', color: '#000' },
    headerTitleDark: { color: '#fff' },

    empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
    emptyEmoji: { fontSize: 52, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontFamily: 'Outfit_700Bold', color: '#000', marginBottom: 8 },
    emptyTitleDark: { color: '#fff' },
    emptySubtitle: { fontSize: 15, fontFamily: 'Outfit_400Regular', color: '#8e8e93', textAlign: 'center', lineHeight: 22 },
    emptySubtitleDark: { color: '#636366' },

    listContent: { paddingHorizontal: 16, paddingTop: 4 },
    countLabel: { fontSize: 13, fontFamily: 'Outfit_600SemiBold', color: '#8e8e93', marginBottom: 12, letterSpacing: 0.3 },
    countLabelDark: { color: '#636366' },

    card: {
        backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
    },
    cardDark: { backgroundColor: '#1c1c1e' },

    cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 12 },
    iconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#e5e5ea', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    iconWrapRecent: { backgroundColor: '#30D158' },

    cardMeta: { flex: 1 },
    cardTitle: { fontSize: 16, fontFamily: 'Outfit_700Bold', color: '#000', lineHeight: 22, marginBottom: 4 },
    cardTitleDark: { color: '#fff' },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    newBadge: { backgroundColor: '#30D158', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
    newBadgeText: { fontSize: 10, fontFamily: 'Outfit_700Bold', color: '#fff', letterSpacing: 0.5 },
    timeText: { fontSize: 12, fontFamily: 'Outfit_400Regular', color: '#8e8e93' },

    cardBody: { fontSize: 15, fontFamily: 'Outfit_400Regular', color: '#3a3a3c', lineHeight: 23, marginBottom: 14 },
    cardBodyDark: { color: '#aeaeb2' },

    cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e5e5ea' },
    cardFooterDark: { borderTopColor: '#2c2c2e' },
    footerText: { fontSize: 12, fontFamily: 'Outfit_400Regular', color: '#8e8e93' },
    footerDot: { fontSize: 12, color: '#c7c7cc' },
});
