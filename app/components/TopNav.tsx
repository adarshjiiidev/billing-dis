"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Search,
    Bell,
    Mail,
    LayoutDashboard,
    Users,
    CreditCard,
    Receipt,
    Settings,
    Menu,
    X,
    Folder,
    Minus,
    Square
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function TopNav() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [dataToSearch, setDataToSearch] = useState<{ students: any[], fees: any[] }>({ students: [], fees: [] });
    const searchRef = useRef<HTMLDivElement>(null);

    // Notifications State
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const notifRef = useRef<HTMLButtonElement>(null);

    const navItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Students', href: '/students', icon: Users },
        { name: 'Fee Structures', href: '/fees', icon: CreditCard },
        { name: 'Billing', href: '/billing', icon: Receipt },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    async function fetchSearchData() {
        if (typeof window !== "undefined" && window.electron) {
            try {
                const [stuRes, feeRes, taskRes, remRes] = await Promise.all([
                    window.electron.invoke('get-students'),
                    window.electron.invoke('get-fees'),
                    window.electron.invoke('get-tasks'),
                    window.electron.invoke('get-reminders')
                ]);
                setDataToSearch({
                    students: stuRes.success ? stuRes.data : [],
                    fees: feeRes.success ? feeRes.data : []
                });

                let allNotifs: any[] = [];
                if (taskRes.success) {
                    const pendingTasks = taskRes.data.filter((t: any) => t.status !== 'completed').map((t: any) => ({
                        ...t,
                        type: 'task',
                        displayDate: t.dueDate
                    }));
                    allNotifs = [...allNotifs, ...pendingTasks];
                }
                if (remRes.success) {
                    const reminders = remRes.data.map((r: any) => ({
                        ...r,
                        type: 'reminder',
                        displayDate: r.datetime
                    }));
                    allNotifs = [...allNotifs, ...reminders];
                }

                // Sort by upcoming date
                allNotifs.sort((a, b) => new Date(a.displayDate).getTime() - new Date(b.displayDate).getTime());
                setNotifications(allNotifs.slice(0, 5));

            } catch (e) { console.error(e) }
        }
    }

    useEffect(() => {
        fetchSearchData();

        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                // Let the click propagate to close if clicked outside
                // We handle open/close on the button itself via click
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                e.preventDefault();
                const input = document.getElementById('global-search');
                if (input) input.focus();
            }
            if (e.key === 'Escape') {
                setIsSearchFocused(false);
                const input = document.getElementById('global-search');
                if (input) input.blur();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const searchResults = () => {
        if (!searchQuery.trim()) return { students: [], fees: [] };
        const q = searchQuery.toLowerCase();
        return {
            students: dataToSearch.students.filter(s =>
                s.firstName.toLowerCase().includes(q) ||
                s.lastName.toLowerCase().includes(q) ||
                s.rollNumber.toLowerCase().includes(q)
            ).slice(0, 3), // max 3
            fees: dataToSearch.fees.filter(f =>
                f.feeType.toLowerCase().includes(q) ||
                f.grade.toLowerCase().includes(q)
            ).slice(0, 3) // max 3
        };
    };

    const results = searchResults();
    const hasResults = results.students.length > 0 || results.fees.length > 0;

    return (
        <nav
            className="w-full bg-surface border-b border-border/50 sticky top-0 z-40"
            style={{ WebkitAppRegion: 'drag' } as any}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
                {/* Brand & Links */}
                <div className="flex items-center gap-6 xl:gap-12">
                    <div className="flex items-center gap-2">
                        <div className="h-10 sm:h-12 md:h-14 lg:h-16 xl:h-20 2xl:h-24 w-auto flex items-center justify-center overflow-hidden transition-all duration-300">
                            <img src="/logo.png" alt="Daddy's Logo" className="h-full w-auto object-contain" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground hidden">
                            Daddy's<span className="text-primary font-black"> International</span>
                        </h1>
                    </div>

                    <div className="hidden lg:flex items-center gap-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`nav-item group text-sm ${isActive ? 'active' : ''}`}
                                    style={{ WebkitAppRegion: 'no-drag' } as any}
                                >
                                    <item.icon size={16} className={isActive ? 'text-primary' : 'text-gray-400 group-hover:text-primary transition-colors'} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Search & Actions */}
                <div className="flex items-center gap-4 xl:gap-6">
                    <div className="relative hidden lg:block w-48 xl:w-72" ref={searchRef} style={{ WebkitAppRegion: 'no-drag' } as any}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            id="global-search"
                            type="text"
                            placeholder="Search students, fees..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => {
                                setIsSearchFocused(true);
                                fetchSearchData(); // Re-fetch students and fees to ensure latest data is searched
                            }}
                            className="w-full bg-gray-50/50 hover:bg-white border border-transparent hover:border-border/60 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl pl-10 pr-12 py-2 text-sm transition-all outline-none text-foreground placeholder-gray-400"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
                            <kbd className="px-1.5 py-0.5 rounded flex items-center justify-center bg-gray-100 text-[10px] text-gray-400 font-medium">⌘</kbd>
                            <kbd className="px-1.5 py-0.5 rounded flex items-center justify-center bg-gray-100 text-[10px] text-gray-400 font-medium">F</kbd>
                        </div>

                        {/* Search Dropdown */}
                        {isSearchFocused && searchQuery.trim() && (
                            <div className="absolute top-12 left-0 w-[400px] bg-white border border-border/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                                {hasResults ? (
                                    <div className="space-y-4">
                                        {results.students.length > 0 && (
                                            <div>
                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2 mt-1">Students</h4>
                                                {results.students.map(student => (
                                                    <Link
                                                        key={student._id}
                                                        href="/students"
                                                        onClick={() => setIsSearchFocused(false)}
                                                        className="flex flex-col p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                                                    >
                                                        <span className="text-sm font-bold text-foreground">{student.firstName} {student.lastName}</span>
                                                        <span className="text-xs text-gray-500 font-medium">{student.grade} • Roll: {student.rollNumber}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                        {results.fees.length > 0 && (
                                            <div>
                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2 mt-2">Fee Structures</h4>
                                                {results.fees.map(fee => (
                                                    <Link
                                                        key={fee._id}
                                                        href="/fees"
                                                        onClick={() => setIsSearchFocused(false)}
                                                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                            <Folder className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-bold text-foreground block">{fee.feeType}</span>
                                                            <span className="text-xs font-medium text-gray-500">{fee.grade} • ₹{fee.amount}</span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-sm font-medium text-gray-400">
                                        No results found for "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 border-l border-border/40 pl-2 lg:pl-6">
                        <div className="relative">
                            <button
                                ref={notifRef}
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                onBlur={() => setTimeout(() => setIsNotificationsOpen(false), 200)}
                                className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors relative"
                                style={{ WebkitAppRegion: 'no-drag' } as any}
                            >
                                <Bell size={18} />
                                {notifications.length > 0 && (
                                    <span className="absolute top-[6px] right-[6px] w-[6px] h-[6px] bg-primary rounded-full ring-2 ring-white"></span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {isNotificationsOpen && (
                                <div className="absolute top-12 right-0 w-80 bg-white border border-border/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-4 z-50 animate-in fade-in zoom-in-95 origin-top-right">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-foreground">Notifications</h3>
                                        <span className="text-xs font-medium text-gray-400">Mark all read</span>
                                    </div>
                                    {notifications.length > 0 ? (
                                        <div className="space-y-3">
                                            {notifications.map((n, i) => (
                                                <div key={n._id || i} className="flex gap-3 items-start p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                                                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.color || (n.type === 'reminder' ? 'bg-amber-500' : 'bg-primary')}`}></div>
                                                    <div>
                                                        <p className="text-[13px] font-bold text-foreground leading-snug">{n.title}</p>
                                                        <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                                                            {n.type === 'reminder' ? 'Event: ' : 'Due: '}
                                                            {n.displayDate ? new Date(n.displayDate).toLocaleDateString() : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm font-medium text-gray-400 text-center py-6">You're all caught up!</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <button
                            className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-500"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            style={{ WebkitAppRegion: 'no-drag' } as any}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Window Controls (Desktop only) */}
                    <div className="hidden lg:flex items-center ml-2 border-l border-border/40 pl-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
                        <button
                            onClick={() => window.electron?.invoke('window-minimize')}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            <Minus size={16} />
                        </button>
                        <button
                            onClick={() => window.electron?.invoke('window-maximize')}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            <Square size={13} strokeWidth={2.5} />
                        </button>
                        <button
                            onClick={() => window.electron?.invoke('window-close')}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-red-500 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-border shadow-lg py-4 px-6 flex flex-col gap-2 animate-in slide-in-from-top-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <item.icon size={18} className={isActive ? 'text-primary' : 'text-gray-400'} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </nav>
    );
}
