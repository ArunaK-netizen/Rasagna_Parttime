'use client';
import { useAuth } from '@/lib/AuthContext';
import {
    BarChart2,
    CalendarDays,
    ChevronRight,
    LayoutDashboard,
    LogOut,
    Megaphone,
    Menu,
    Package,
    ShoppingBag,
    UserCog,
    Users,
    X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Overview' },
    { href: '/employees', icon: Users, label: 'Employees' },
    { href: '/sales', icon: ShoppingBag, label: 'Sales' },
    { href: '/products', icon: Package, label: 'Products' },
    { href: '/analytics', icon: BarChart2, label: 'Analytics' },
    { href: '/schedule', icon: CalendarDays, label: 'Schedule' },
    { href: '/users', icon: UserCog, label: 'User Management' },
    { href: '/announcements', icon: Megaphone, label: 'Announcements' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);

    const initials = user?.displayName
        ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : user?.email?.[0]?.toUpperCase() ?? 'A';

    const NavContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-6 py-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue flex items-center justify-center pulse-blue">
                        <span className="text-white font-bold text-sm">PT</span>
                    </div>
                    <div>
                        <p className="text-white font-semibold text-sm leading-tight">PartTime</p>
                        <p className="text-textSecondary text-xs">Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${active
                                    ? 'bg-blue/15 text-blue'
                                    : 'text-textSecondary hover:bg-surface2 hover:text-white'
                                }`}
                        >
                            <Icon size={18} className={active ? 'text-blue' : 'text-textTertiary group-hover:text-white'} strokeWidth={active ? 2.5 : 2} />
                            <span className={`text-sm font-medium ${active ? 'font-semibold' : ''}`}>{label}</span>
                            {active && <ChevronRight size={14} className="ml-auto text-blue" />}
                        </Link>
                    );
                })}
            </nav>

            {/* User + Logout */}
            <div className="px-3 py-4 border-t border-border">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue/20 flex items-center justify-center text-blue font-bold text-xs flex-shrink-0">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold truncate">{user?.displayName || 'Admin'}</p>
                        <p className="text-textTertiary text-[10px] truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-textSecondary hover:bg-red/10 hover:text-red transition-all duration-200 group"
                >
                    <LogOut size={16} className="group-hover:text-red" />
                    <span className="text-sm font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-surface border-r border-border h-full">
                <NavContent />
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue flex items-center justify-center">
                        <span className="text-white font-bold text-xs">PT</span>
                    </div>
                    <span className="text-white font-semibold text-sm">Admin Panel</span>
                </div>
                <button onClick={() => setOpen(!open)} className="text-textSecondary hover:text-white transition-colors">
                    {open ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile Drawer */}
            {open && (
                <div className="lg:hidden fixed inset-0 z-40">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <aside className="absolute top-0 left-0 bottom-0 w-72 bg-surface border-r border-border pt-14">
                        <NavContent />
                    </aside>
                </div>
            )}
        </>
    );
}
