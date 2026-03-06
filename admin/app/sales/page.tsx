'use client';
import React from 'react';
import AppShell from '@/components/AppShell';
import { Badge, EmptyState, formatCurrency, LoadingSpinner, PageHeader } from '@/components/UI';
import { deleteTransaction } from '@/lib/db';
import { useTransactions } from '@/lib/hooks';
import { ChevronDown, ChevronUp, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function SalesPage() {
    const { transactions, loading } = useTransactions();
    const [expanded, setExpanded] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filterPayment, setFilterPayment] = useState('all');
    const [filterEmployee, setFilterEmployee] = useState('all');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const employees = useMemo(() => {
        const map: Record<string, string> = {};
        for (const t of transactions) {
            if (t.userId && t.userName) map[t.userId] = t.userName;
        }
        return Object.entries(map).map(([uid, name]) => ({ uid, name }));
    }, [transactions]);

    const filtered = useMemo(() => {
        return transactions.filter(t => {
            if (filterPayment !== 'all' && t.paymentMethod !== filterPayment) return false;
            if (filterEmployee !== 'all' && t.userId !== filterEmployee) return false;
            if (filterDateFrom && t.date < filterDateFrom) return false;
            if (filterDateTo && t.date > filterDateTo) return false;
            if (search) {
                const q = search.toLowerCase();
                if (!t.userName?.toLowerCase().includes(q) &&
                    !t.items?.some(i => i.productName.toLowerCase().includes(q))) return false;
            }
            return true;
        });
    }, [transactions, filterPayment, filterEmployee, filterDateFrom, filterDateTo, search]);

    const totalFiltered = filtered.reduce((s, t) => s + (t.totalAmount || 0), 0);

    const handleDelete = async (id: string) => {
        if (confirmDelete !== id) { setConfirmDelete(id); return; }
        setDeleting(id);
        try {
            await deleteTransaction(id);
        } finally {
            setDeleting(null);
            setConfirmDelete(null);
        }
    };

    if (loading) return <AppShell><div className="p-6"><LoadingSpinner /></div></AppShell>;

    return (
        <AppShell>
            <div className="p-6 max-w-7xl mx-auto">
                <PageHeader
                    title="Sales"
                    subtitle={`${filtered.length} transactions · ${formatCurrency(totalFiltered)} total`}
                />

                {/* Filters */}
                <div className="glass-card p-4 mb-4">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="relative lg:col-span-2">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-textTertiary" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search employee or product..."
                                className="w-full bg-surface2 border border-border rounded-xl pl-8 pr-3 py-2 text-white text-sm focus:outline-none focus:border-blue/50 placeholder-textTertiary"
                            />
                        </div>
                        <select
                            value={filterPayment}
                            onChange={e => setFilterPayment(e.target.value)}
                            className="bg-surface2 border border-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue/50"
                        >
                            <option value="all">All Payments</option>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="upi">UPI</option>
                        </select>
                        <select
                            value={filterEmployee}
                            onChange={e => setFilterEmployee(e.target.value)}
                            className="bg-surface2 border border-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue/50"
                        >
                            <option value="all">All Employees</option>
                            {employees.map(e => <option key={e.uid} value={e.uid}>{e.name}</option>)}
                        </select>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={filterDateFrom}
                                onChange={e => setFilterDateFrom(e.target.value)}
                                className="flex-1 bg-surface2 border border-border rounded-xl px-2 py-2 text-sm text-white focus:outline-none focus:border-blue/50 min-w-0"
                            />
                            <input
                                type="date"
                                value={filterDateTo}
                                onChange={e => setFilterDateTo(e.target.value)}
                                className="flex-1 bg-surface2 border border-border rounded-xl px-2 py-2 text-sm text-white focus:outline-none focus:border-blue/50 min-w-0"
                            />
                        </div>
                    </div>
                    {(search || filterPayment !== 'all' || filterEmployee !== 'all' || filterDateFrom || filterDateTo) && (
                        <button
                            onClick={() => { setSearch(''); setFilterPayment('all'); setFilterEmployee('all'); setFilterDateFrom(''); setFilterDateTo(''); }}
                            className="mt-2 flex items-center gap-1 text-textSecondary hover:text-white text-xs transition-colors"
                        >
                            <X size={12} /> Clear filters
                        </button>
                    )}
                </div>

                {filtered.length === 0 ? (
                    <EmptyState icon="🧾" message="No transactions match your filters." />
                ) : (
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead className="border-b border-border">
                                    <tr>
                                        <th className="text-left px-5 py-3 text-textTertiary text-xs font-semibold">Date</th>
                                        <th className="text-left px-5 py-3 text-textTertiary text-xs font-semibold">Employee</th>
                                        <th className="text-left px-5 py-3 text-textTertiary text-xs font-semibold">Items</th>
                                        <th className="text-left px-5 py-3 text-textTertiary text-xs font-semibold">Payment</th>
                                        <th className="text-left px-5 py-3 text-textTertiary text-xs font-semibold">Tip</th>
                                        <th className="text-right px-5 py-3 text-textTertiary text-xs font-semibold">Total</th>
                                        <th className="px-5 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((t) => (
                                        <React.Fragment key={t.id}>
                                            <tr
                                                className="border-b border-border/50 hover:bg-surface2/40 transition-colors cursor-pointer"
                                                onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                                            >
                                                <td className="px-5 py-3 text-textSecondary text-sm">{t.date}</td>
                                                <td className="px-5 py-3 text-white text-sm font-medium">{t.userName || 'Unknown'}</td>
                                                <td className="px-5 py-3 text-textSecondary text-sm">{t.items?.length ?? 1}</td>
                                                <td className="px-5 py-3">
                                                    <Badge color={t.paymentMethod === 'cash' ? 'green' : t.paymentMethod === 'upi' ? 'blue' : 'orange'}>
                                                        {t.paymentMethod?.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-3 text-textSecondary text-sm">{t.tip > 0 ? formatCurrency(t.tip) : '—'}</td>
                                                <td className="px-5 py-3 text-right text-blue font-bold text-sm tabular-nums">{formatCurrency(t.totalAmount)}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <button
                                                            onClick={e => { e.stopPropagation(); handleDelete(t.id); }}
                                                            className={`p-1.5 rounded-lg transition-all ${confirmDelete === t.id ? 'bg-red/20 text-red' : 'text-textTertiary hover:text-red hover:bg-red/10'}`}
                                                            title={confirmDelete === t.id ? 'Click again to confirm delete' : 'Delete'}
                                                        >
                                                            {deleting === t.id ? <div className="w-4 h-4 border border-red border-t-transparent rounded-full animate-spin" /> : <Trash2 size={14} />}
                                                        </button>
                                                        {expanded === t.id ? <ChevronUp size={14} className="text-textTertiary" /> : <ChevronDown size={14} className="text-textTertiary" />}
                                                    </div>
                                                </td>
                                            </tr>
                                            {expanded === t.id && (
                                                <tr key={t.id + '-detail'} className="bg-surface2/30">
                                                    <td colSpan={7} className="px-5 py-3">
                                                        <div className="space-y-1.5">
                                                            {(t.items && t.items.length > 0 ? t.items : [{
                                                                id: '', productName: t.productName || 'Unknown', category: t.category || '',
                                                                price: t.price || 0, quantity: t.quantity || 1
                                                            }]).map((item, idx) => (
                                                                <div key={idx} className="flex items-center justify-between text-sm">
                                                                    <span className="text-textSecondary">
                                                                        {item.productName}
                                                                        <span className="text-textTertiary ml-2 text-xs">({item.category})</span>
                                                                    </span>
                                                                    <span className="text-white tabular-nums">
                                                                        {item.quantity} × {formatCurrency(item.price)} = <span className="text-blue font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
