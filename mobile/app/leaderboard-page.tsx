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
import { useAuth } from '../context/AuthContext';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useTheme } from '../hooks/useTheme';

const MEDAL = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = ['#FFD60A', '#C0C0C0', '#CD7F32'];
const BAR_COLORS = ['#FFD60A', '#0A84FF', '#0A84FF', '#0A84FF'];

export default function LeaderboardPage() {
    const router = useRouter();
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';
    const { user } = useAuth();
    const { leaderboard, loading } = useLeaderboard();

    const topRevenue = leaderboard[0]?.revenue || 1;
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const myRank = leaderboard.findIndex(e => e.uid === user?.uid);

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={22} color="#0A84FF" />
                        <Text style={styles.backText}>Profile</Text>
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>Leaderboard</Text>
                    <View style={{ width: 80 }} />
                </View>

                {/* Month badge */}
                <View style={styles.monthBadge}>
                    <Ionicons name="trophy" size={16} color="#FFD60A" />
                    <Text style={styles.monthText}>{currentMonth}</Text>
                </View>

                {/* Your rank banner */}
                {myRank >= 0 && (
                    <View style={[styles.myRankBanner, isDark && styles.myRankBannerDark]}>
                        <Text style={styles.myRankLabel}>Your rank</Text>
                        <Text style={styles.myRankNum}>
                            {myRank < 3 ? MEDAL[myRank] : `#${myRank + 1}`}
                        </Text>
                        <Text style={styles.myRankRevenue}>
                            ${leaderboard[myRank]?.revenue.toFixed(2)} this month
                        </Text>
                    </View>
                )}

                {loading ? (
                    <ActivityIndicator color="#0A84FF" style={{ marginTop: 40 }} />
                ) : leaderboard.length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={styles.emptyEmoji}>🏆</Text>
                        <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>No data yet this month</Text>
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
                        {leaderboard.map((emp, i) => {
                            const isMe = emp.uid === user?.uid;
                            const pct = topRevenue > 0 ? (emp.revenue / topRevenue) * 100 : 0;

                            return (
                                <View
                                    key={emp.uid}
                                    style={[
                                        styles.row,
                                        isDark && styles.rowDark,
                                        isMe && styles.rowMe,
                                        isMe && isDark && styles.rowMeDark,
                                    ]}
                                >
                                    {/* Rank */}
                                    <View style={styles.rankCol}>
                                        {i < 3 ? (
                                            <Text style={styles.medal}>{MEDAL[i]}</Text>
                                        ) : (
                                            <Text style={[styles.rankNum, isDark && styles.rankNumDark]}>#{i + 1}</Text>
                                        )}
                                    </View>

                                    {/* Avatar */}
                                    <View style={[styles.avatar, { backgroundColor: i === 0 ? '#FFD60A22' : (isMe ? '#0A84FF22' : (isDark ? '#2c2c2e' : '#f2f2f7')) }]}>
                                        <Text style={[styles.avatarText, { color: i === 0 ? '#FFD60A' : (isMe ? '#0A84FF' : '#8e8e93') }]}>
                                            {emp.name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>

                                    {/* Info */}
                                    <View style={styles.info}>
                                        <View style={styles.nameRow}>
                                            <Text style={[styles.empName, isDark && styles.empNameDark, isMe && styles.empNameMe]} numberOfLines={1}>
                                                {emp.name}{isMe ? ' (you)' : ''}
                                            </Text>
                                            <Text style={[styles.revenue, i === 0 && styles.revenueGold, isMe && styles.revenueBlue]}>
                                                ${emp.revenue.toFixed(2)}
                                            </Text>
                                        </View>
                                        {/* Progress bar */}
                                        <View style={[styles.barTrack, isDark && styles.barTrackDark]}>
                                            <View
                                                style={[
                                                    styles.barFill,
                                                    { width: `${pct}%` as any, backgroundColor: i === 0 ? '#FFD60A' : (isMe ? '#0A84FF' : '#3a3a3c') },
                                                ]}
                                            />
                                        </View>
                                        <Text style={[styles.txCount, isDark && styles.txCountDark]}>
                                            {emp.txCount} transaction{emp.txCount !== 1 ? 's' : ''}
                                        </Text>
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

    monthBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        alignSelf: 'center', marginBottom: 16,
        backgroundColor: 'rgba(255,214,10,0.12)',
        borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7,
    },
    monthText: { fontSize: 14, fontFamily: 'Outfit_700Bold', color: '#FFD60A' },

    myRankBanner: {
        marginHorizontal: 16, marginBottom: 16, borderRadius: 16,
        backgroundColor: 'rgba(10,132,255,0.1)',
        borderWidth: 1, borderColor: 'rgba(10,132,255,0.25)',
        padding: 16, alignItems: 'center', flexDirection: 'row', gap: 12,
    },
    myRankBannerDark: { backgroundColor: 'rgba(10,132,255,0.12)' },
    myRankLabel: { fontSize: 12, fontFamily: 'Outfit_600SemiBold', color: '#0A84FF', flex: 1 },
    myRankNum: { fontSize: 28, fontFamily: 'Outfit_700Bold', color: '#0A84FF' },
    myRankRevenue: { fontSize: 14, fontFamily: 'Outfit_700Bold', color: '#0A84FF', flex: 1, textAlign: 'right' },

    empty: { alignItems: 'center', paddingTop: 60 },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 16, fontFamily: 'Outfit_400Regular', color: '#8e8e93' },
    emptyTextDark: { color: '#636366' },

    list: { paddingHorizontal: 16, gap: 10 },
    row: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: '#fff', borderRadius: 16, padding: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    rowDark: { backgroundColor: '#1c1c1e' },
    rowMe: { borderWidth: 1.5, borderColor: '#0A84FF' },
    rowMeDark: { borderColor: '#0A84FF' },

    rankCol: { width: 32, alignItems: 'center' },
    medal: { fontSize: 22 },
    rankNum: { fontSize: 15, fontFamily: 'Outfit_700Bold', color: '#8e8e93' },
    rankNumDark: { color: '#636366' },

    avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 18, fontFamily: 'Outfit_700Bold' },

    info: { flex: 1 },
    nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    empName: { fontSize: 15, fontFamily: 'Outfit_600SemiBold', color: '#000', flex: 1 },
    empNameDark: { color: '#fff' },
    empNameMe: { color: '#0A84FF' },
    revenue: { fontSize: 15, fontFamily: 'Outfit_700Bold', color: '#8e8e93' },
    revenueGold: { color: '#FFD60A' },
    revenueBlue: { color: '#0A84FF' },
    barTrack: { height: 6, backgroundColor: '#e5e5ea', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
    barTrackDark: { backgroundColor: '#2c2c2e' },
    barFill: { height: '100%', borderRadius: 3 },
    txCount: { fontSize: 11, fontFamily: 'Outfit_400Regular', color: '#8e8e93' },
    txCountDark: { color: '#636366' },
});
