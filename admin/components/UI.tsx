import { ReactNode } from 'react';

interface StatCardProps {
    label: string;
    value: string;
    sub?: string;
    color?: string;
    icon?: ReactNode;
    trend?: number;
}

export function StatCard({ label, value, sub, color = 'text-blue', icon, trend }: StatCardProps) {
    return (
        <div className="glass-card p-5 fade-in hover:border-white/15 transition-all duration-300 group">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-textSecondary text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
                    <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
                    {sub && <p className="text-textTertiary text-xs mt-1">{sub}</p>}
                    {typeof trend === 'number' && (
                        <p className={`text-xs mt-1.5 font-medium ${trend >= 0 ? 'text-green' : 'text-red'}`}>
                            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% vs last month
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="w-10 h-10 rounded-xl bg-surface2 flex items-center justify-center text-textSecondary group-hover:bg-surface3 transition-colors">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
    return (
        <div className="flex items-start justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
                {subtitle && <p className="text-textSecondary text-sm mt-0.5">{subtitle}</p>}
            </div>
            {action && <div className="flex-shrink-0 ml-4">{action}</div>}
        </div>
    );
}

export function Badge({ children, color = 'blue' }: { children: ReactNode; color?: 'blue' | 'green' | 'red' | 'orange' | 'purple' }) {
    const colorMap = {
        blue: 'bg-blue/15 text-blue',
        green: 'bg-green/15 text-green',
        red: 'bg-red/15 text-red',
        orange: 'bg-orange/15 text-orange',
        purple: 'bg-purple/15 text-purple',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colorMap[color]}`}>
            {children}
        </span>
    );
}

export function EmptyState({ icon, message }: { icon: string; message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-3">{icon}</p>
            <p className="text-textSecondary text-sm">{message}</p>
        </div>
    );
}

export function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-surface3 border-t-blue rounded-full animate-spin" />
        </div>
    );
}

export function formatCurrency(val: number) {
    return '$' + val.toFixed(2);
}

export function formatShortDate(dateStr: string) {
    // dateStr: YYYY-MM-DD
    const [, m, d] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(m) - 1]} ${parseInt(d)}`;
}

export function formatMonth(monthStr: string) {
    const [y, m] = monthStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(m) - 1]} '${y.slice(2)}`;
}
