'use client';
import AppShell from '@/components/AppShell';
import { Badge, EmptyState, formatCurrency, LoadingSpinner, PageHeader } from '@/components/UI';
import { addProduct, deleteProduct, Product, updateProduct } from '@/lib/db';
import { useProducts, useTransactions } from '@/lib/hooks';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function ProductsPage() {
    const { products, loading } = useProducts();
    const { transactions } = useTransactions();
    const [showAdd, setShowAdd] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', price: '', category: '', userId: '', userName: '' });
    const [editForm, setEditForm] = useState<Partial<Product>>({});
    const [saving, setSaving] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'revenue' | 'qty' | 'price'>('revenue');

    // Compute sales per product
    const productStats = useMemo(() => {
        const map: Record<string, { revenue: number; qty: number }> = {};
        for (const t of transactions) {
            const items = t.items || (t.productName ? [{ productName: t.productName, price: t.price || 0, quantity: t.quantity || 1 }] : []);
            for (const item of items) {
                if (!map[item.productName]) map[item.productName] = { revenue: 0, qty: 0 };
                map[item.productName].revenue += item.price * item.quantity;
                map[item.productName].qty += item.quantity;
            }
        }
        return map;
    }, [transactions]);

    const sorted = useMemo(() => {
        const arr = [...products];
        if (sortBy === 'name') return arr.sort((a, b) => a.name.localeCompare(b.name));
        if (sortBy === 'price') return arr.sort((a, b) => b.price - a.price);
        if (sortBy === 'revenue') return arr.sort((a, b) => (productStats[b.name]?.revenue || 0) - (productStats[a.name]?.revenue || 0));
        if (sortBy === 'qty') return arr.sort((a, b) => (productStats[b.name]?.qty || 0) - (productStats[a.name]?.qty || 0));
        return arr;
    }, [products, sortBy, productStats]);

    const handleAdd = async () => {
        if (!form.name || !form.price || !form.category) return;
        setSaving(true);
        try {
            await addProduct({ name: form.name.trim(), price: parseFloat(form.price), category: form.category.trim().toLowerCase() });
            setForm({ name: '', price: '', category: '', userId: '', userName: '' });
            setShowAdd(false);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = async (id: string) => {
        if (!editForm.name || !editForm.price || !editForm.category) return;
        setSaving(true);
        try {
            await updateProduct(id, editForm);
            setEditing(null);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirmDelete !== id) { setConfirmDelete(id); return; }
        await deleteProduct(id);
        setConfirmDelete(null);
    };

    if (loading) return <AppShell><div className="p-6"><LoadingSpinner /></div></AppShell>;

    return (
        <AppShell>
            <div className="p-6 max-w-7xl mx-auto">
                <PageHeader
                    title="Products"
                    subtitle={`${products.length} products`}
                    action={
                        <button
                            onClick={() => setShowAdd(true)}
                            className="flex items-center gap-2 bg-blue hover:bg-blue/90 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 active:scale-95"
                        >
                            <Plus size={16} /> Add Product
                        </button>
                    }
                />

                {/* Add Product Modal */}
                {showAdd && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="glass-card w-full max-w-sm p-6 fade-in">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-white font-bold">Add New Product</h2>
                                <button onClick={() => setShowAdd(false)} className="text-textTertiary hover:text-white transition-colors"><X size={18} /></button>
                            </div>
                            <div className="space-y-3">
                                {['name', 'price', 'category'].map(field => (
                                    <div key={field}>
                                        <label className="block text-textSecondary text-xs font-semibold mb-1 capitalize">{field}</label>
                                        <input
                                            value={form[field as keyof typeof form]}
                                            onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                                            type={field === 'price' ? 'number' : 'text'}
                                            placeholder={field === 'price' ? '0.00' : field === 'category' ? 'e.g. snacks' : ''}
                                            className="w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue/50 placeholder-textTertiary"
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={handleAdd}
                                    disabled={saving || !form.name || !form.price || !form.category}
                                    className="w-full bg-blue hover:bg-blue/90 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] mt-2"
                                >
                                    {saving ? 'Saving…' : 'Add Product'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sort Controls */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto">
                    <span className="text-textTertiary text-xs flex-shrink-0">Sort by:</span>
                    {(['revenue', 'qty', 'price', 'name'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setSortBy(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all ${sortBy === s ? 'bg-blue text-white' : 'bg-surface2 text-textSecondary hover:text-white'}`}
                        >
                            {s === 'revenue' ? 'Revenue' : s === 'qty' ? 'Units Sold' : s === 'price' ? 'Price' : 'Name'}
                        </button>
                    ))}
                </div>

                {sorted.length === 0 ? (
                    <EmptyState icon="📦" message="No products yet. Add your first product!" />
                ) : (
                    <div className="glass-card overflow-hidden">
                        <table className="w-full min-w-[600px]">
                            <thead className="border-b border-border">
                                <tr>
                                    <th className="text-left px-5 py-3 text-textTertiary text-xs font-semibold">Product</th>
                                    <th className="text-left px-5 py-3 text-textTertiary text-xs font-semibold">Category</th>
                                    <th className="text-right px-5 py-3 text-textTertiary text-xs font-semibold">Price</th>
                                    <th className="text-right px-5 py-3 text-textTertiary text-xs font-semibold">Units Sold</th>
                                    <th className="text-right px-5 py-3 text-textTertiary text-xs font-semibold">Revenue</th>
                                    <th className="px-5 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((p) => {
                                    const stats = productStats[p.name] || { revenue: 0, qty: 0 };
                                    const isEditing = editing === p.id;
                                    return (
                                        <tr key={p.id} className="border-b border-border/50 hover:bg-surface2/40 transition-colors">
                                            <td className="px-5 py-3">
                                                {isEditing ? (
                                                    <input value={editForm.name ?? ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                                        className="bg-surface2 border border-border rounded-lg px-2 py-1 text-white text-sm w-full focus:outline-none focus:border-blue/50" />
                                                ) : (
                                                    <p className="text-white font-medium text-sm">{p.name}</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                {isEditing ? (
                                                    <input value={editForm.category ?? ''} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                                                        className="bg-surface2 border border-border rounded-lg px-2 py-1 text-sm w-24 focus:outline-none focus:border-blue/50 text-white" />
                                                ) : (
                                                    <Badge color="blue">{p.category}</Badge>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                {isEditing ? (
                                                    <input type="number" value={editForm.price ?? ''} onChange={e => setEditForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
                                                        className="bg-surface2 border border-border rounded-lg px-2 py-1 text-sm w-20 focus:outline-none focus:border-blue/50 text-white text-right" />
                                                ) : (
                                                    <span className="text-white font-semibold text-sm tabular-nums">{formatCurrency(p.price)}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-right text-textSecondary text-sm tabular-nums">{stats.qty || 0}</td>
                                            <td className="px-5 py-3 text-right text-blue font-bold text-sm tabular-nums">{formatCurrency(stats.revenue)}</td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-1 justify-end">
                                                    {isEditing ? (
                                                        <>
                                                            <button onClick={() => handleEdit(p.id)} className="p-1.5 rounded-lg text-green hover:bg-green/10 transition-colors"><Check size={14} /></button>
                                                            <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg text-textTertiary hover:bg-surface3 transition-colors"><X size={14} /></button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => { setEditing(p.id); setEditForm({ name: p.name, price: p.price, category: p.category }); setConfirmDelete(null); }}
                                                                className="p-1.5 rounded-lg text-textTertiary hover:text-blue hover:bg-blue/10 transition-colors"><Pencil size={14} /></button>
                                                            <button onClick={() => handleDelete(p.id)}
                                                                className={`p-1.5 rounded-lg transition-all ${confirmDelete === p.id ? 'bg-red/20 text-red' : 'text-textTertiary hover:text-red hover:bg-red/10'}`}>
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
