'use client';
import AppShell from '@/components/AppShell';
import { Badge, LoadingSpinner, PageHeader, StatCard, formatCurrency, formatMonth, formatShortDate } from '@/components/UI';
import { useAnalytics, useTransactions } from '@/lib/hooks';
import { format } from 'date-fns';
import { IndianRupee, ShoppingBag, TrendingUp, Trophy, Users, Zap } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from 'recharts';

export default function HomePage() {
  const { transactions, loading } = useTransactions();
  const analytics = useAnalytics(transactions);

  if (loading) {
    return <AppShell><div className="p-6"><LoadingSpinner /></div></AppShell>;
  }

  const today = format(new Date(), 'EEEE, MMMM do');

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

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto">


        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Today's Revenue"
            value={formatCurrency(analytics.todayRevenue)}
            icon={<Zap size={18} />}
            color="text-blue"
          />
          <StatCard
            label="This Month"
            value={formatCurrency(analytics.monthRevenue)}
            icon={<TrendingUp size={18} />}
            color="text-green"
          />
          <StatCard
            label="Total Revenue"
            value={formatCurrency(analytics.totalRevenue)}
            icon={<IndianRupee size={18} />}
            color="text-purple"
          />
          <StatCard
            label="Total Transactions"
            value={transactions.length.toString()}
            sub={`Tips: ${formatCurrency(analytics.totalTips)}`}
            icon={<ShoppingBag size={18} />}
            color="text-orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* 7-Day Revenue Chart */}
          <div className="lg:col-span-2 glass-card p-5">
            <p className="text-white font-semibold text-sm mb-4">Last 7 Days Revenue</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={analytics.last7} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#38383a" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tick={{ fill: '#98989d', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#98989d', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => '$' + v}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(10,132,255,0.08)' }} />
                <Bar dataKey="revenue" fill="#0a84ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top stats panel */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <p className="text-white font-semibold text-sm">Quick Insights</p>

            {/* Monthly Best Employee */}
            {analytics.monthlyBest && (
              <div className="bg-surface2 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy size={14} className="text-yellow" />
                  <p className="text-yellow text-xs font-semibold">This Month's Star</p>
                </div>
                <p className="text-white font-bold text-base truncate">{analytics.monthlyBest.name}</p>
                <p className="text-green font-semibold text-sm">{formatCurrency(analytics.monthlyBest.revenue)}</p>
              </div>
            )}

            {/* Active Employees */}
            <div className="bg-surface2 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={14} className="text-blue" />
                <p className="text-textSecondary text-xs font-semibold">Active Employees</p>
              </div>
              <p className="text-white font-bold text-2xl">{analytics.employees.length}</p>
            </div>

            {/* Top Product */}
            {analytics.topProducts[0] && (
              <div className="bg-surface2 rounded-xl p-4">
                <p className="text-textSecondary text-xs font-semibold mb-1">Top Product</p>
                <p className="text-white font-bold text-sm truncate">{analytics.topProducts[0].name}</p>
                <p className="text-blue text-xs">{analytics.topProducts[0].qty} sold · {formatCurrency(analytics.topProducts[0].revenue)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="glass-card p-5">
          <p className="text-white font-semibold text-sm mb-4">Monthly Revenue Trend</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={analytics.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#38383a" vertical={false} />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                tick={{ fill: '#98989d', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#98989d', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => '$' + v}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0a84ff"
                strokeWidth={2.5}
                dot={{ fill: '#0a84ff', r: 4 }}
                activeDot={{ r: 6, fill: '#0a84ff', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="glass-card p-5 mb-6">
          <p className="text-white font-semibold text-sm mb-4">Recent Transactions</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="text-textTertiary text-xs font-semibold pb-3 pr-4">Date</th>
                  <th className="text-textTertiary text-xs font-semibold pb-3 pr-4">Employee</th>
                  <th className="text-textTertiary text-xs font-semibold pb-3 pr-4">Items</th>
                  <th className="text-textTertiary text-xs font-semibold pb-3 pr-4">Payment</th>
                  <th className="text-textTertiary text-xs font-semibold pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 8).map((t) => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-surface2/50 transition-colors">
                    <td className="py-3 pr-4 text-textSecondary text-sm">{t.date}</td>
                    <td className="py-3 pr-4 text-white text-sm font-medium truncate max-w-[120px]">
                      {t.userName || 'Unknown'}
                    </td>
                    <td className="py-3 pr-4 text-textSecondary text-sm">
                      {(t.items?.length ?? 1)} item{(t.items?.length ?? 1) > 1 ? 's' : ''}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge color={t.paymentMethod === 'cash' ? 'green' : t.paymentMethod === 'upi' ? 'blue' : 'orange'}>
                        {t.paymentMethod?.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-blue font-bold text-sm tabular-nums">
                      {formatCurrency(t.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
