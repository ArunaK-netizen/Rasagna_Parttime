'use client';
import AppShell from '@/components/AppShell';
import { formatCurrency, formatMonth, LoadingSpinner, PageHeader } from '@/components/UI';
import { useAnalytics, useTransactions } from '@/lib/hooks';
import { Trophy } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';

const COLORS = ['#0a84ff', '#30d158', '#ff9f0a', '#bf5af2', '#64d2ff', '#ff453a'];

export default function AnalyticsPage() {
    const { transactions, loading } = useTransactions();
    const analytics = useAnalytics(transactions);

    if (loading) return <AppShell><div className="p-6"><LoadingSpinner /></div></AppShell>;

    const pieData = [
        { name: 'Cash', value: analytics.paymentBreakdown.cash },
        { name: 'Card', value: analytics.paymentBreakdown.card },
        { name: 'UPI', value: analytics.paymentBreakdown.upi },
    ].filter(d => d.value > 0);

    const currentMonth = new Date().toISOString().slice(0, 7);

    // Employee performance this month
    const empMonthly = Object.entries(
        transactions
            .filter(t => t.date?.startsWith(currentMonth))
            .reduce((acc: Record<string, { name: string; revenue: number }>, t) => {
                if (!t.userId) return acc;
                if (!acc[t.userId]) acc[t.userId] = { name: t.userName || 'Unknown', revenue: 0 };
                acc[t.userId].revenue += t.totalAmount || 0;
                return acc;
            }, {})
    ).map(([uid, v]) => ({ uid, ...v })).sort((a, b) => b.revenue - a.revenue);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload?.length) {
            return (
                <div className="glass-card px-3 py-2 border border-blue/20">
                    <p className="text-textSecondary text-xs mb-1">{label}</p>
                    <p className="text-blue font-bold text-sm">{formatCurrency(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    const PieTooltip = ({ active, payload }: any) => {
        if (active && payload?.length) {
            return (
                <div className="glass-card px-3 py-2 border border-blue/20">
                    <p className="text-white font-bold text-sm">{payload[0].name}: {formatCurrency(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <AppShell>
            <div className="p-6 max-w-7xl mx-auto">
                <PageHeader title="Analytics" subtitle="Insights across your part-time business" />

                {/* Monthly Best Employee Spotlight */}
                {analytics.monthlyBest && (
                    <div className="glass-card p-5 mb-4 border-yellow/20 bg-yellow/5 fade-in">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-yellow/20 flex items-center justify-center">
                                <Trophy size={22} className="text-yellow" />
                            </div>
                            <div>
                                <p className="text-yellow text-xs font-bold uppercase tracking-wider">⭐ Employee of the Month</p>
                                <p className="text-white font-bold text-lg">{analytics.monthlyBest.name}</p>
                                <p className="text-textSecondary text-sm">Earned {formatCurrency(analytics.monthlyBest.revenue)} this month</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Monthly Revenue Trend */}
                <div className="glass-card p-5 mb-4">
                    <p className="text-white font-semibold text-sm mb-4">Monthly Revenue (Last 12 Months)</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={analytics.monthly}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#38383a" vertical={false} />
                            <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fill: '#98989d', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#98989d', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + v} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="revenue" stroke="#0a84ff" strokeWidth={2.5}
                                dot={{ fill: '#0a84ff', r: 4 }} activeDot={{ r: 6, fill: '#0a84ff', strokeWidth: 0 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    {/* Top Products */}
                    <div className="glass-card p-5">
                        <p className="text-white font-semibold text-sm mb-4">Top Products by Revenue</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={analytics.topProducts.slice(0, 8)} layout="vertical" barSize={14}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#38383a" horizontal={false} />
                                <XAxis type="number" tick={{ fill: '#98989d', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + v} />
                                <YAxis type="category" dataKey="name" tick={{ fill: '#98989d', fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(10,132,255,0.08)' }} />
                                <Bar dataKey="revenue" fill="#0a84ff" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="glass-card p-5">
                        <p className="text-white font-semibold text-sm mb-4">Payment Method Breakdown</p>
                        {pieData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                                            {pieData.map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<PieTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-4 mt-2">
                                    {pieData.map((d, i) => (
                                        <div key={d.name} className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                                            <span className="text-textSecondary text-xs">{d.name}</span>
                                            <span className="text-white text-xs font-semibold">{formatCurrency(d.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-40 text-textTertiary text-sm">No data yet</div>
                        )}
                    </div>
                </div>

                {/* Employee Performance This Month */}
                <div className="glass-card p-5">
                    <p className="text-white font-semibold text-sm mb-4">Employee Performance This Month</p>
                    {empMonthly.length === 0 ? (
                        <p className="text-textTertiary text-sm text-center py-8">No data for this month yet</p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <BarChart data={empMonthly} barSize={36}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#38383a" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#98989d', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#98989d', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + v} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(10,132,255,0.08)' }} />
                                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                                        {empMonthly.map((_, i) => <Cell key={i} fill={i === 0 ? '#ffd60a' : '#0a84ff'} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            {/* Leaderboard */}
                            <div className="mt-4 space-y-2">
                                {empMonthly.map((emp, i) => (
                                    <div key={emp.uid} className="flex items-center gap-3">
                                        <span className={`w-6 text-sm font-bold text-center ${i === 0 ? 'text-yellow' : 'text-textTertiary'}`}>{i + 1}</span>
                                        <div className="flex-1 bg-surface2 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${i === 0 ? 'bg-yellow' : 'bg-blue'}`}
                                                style={{ width: `${empMonthly[0].revenue > 0 ? (emp.revenue / empMonthly[0].revenue) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <span className="text-white text-xs font-medium w-20 text-right truncate">{emp.name}</span>
                                        <span className="text-blue text-xs font-bold tabular-nums w-20 text-right">{formatCurrency(emp.revenue)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
