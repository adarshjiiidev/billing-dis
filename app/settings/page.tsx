"use client";

import { Save, Bell, Shield, Database, Layout, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({
        schoolName: "Daddy's International School",
        contactEmail: "admin@daddysinternational.edu",
        academicYear: "2023-2024",
        currencySymbol: "₹",
        schoolAddress: "123 Education Lane, Sector 4, Silicon Valley"
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        if (typeof window !== 'undefined' && window.electron) {
            const res = await window.electron.invoke('get-settings');
            if (res.success && res.data) {
                setSettings(res.data);
            }
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        if (typeof window !== 'undefined' && window.electron) {
            const res = await window.electron.invoke('save-settings', settings);
            if (res.success) {
                setSettings(res.data);
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        }
        setIsSaving(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                <p className="text-gray-500 mt-1">Manage application preferences and system configurations.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 mt-8">
                {/* Settings Navigation */}
                <div className="w-full md:w-64 space-y-2 shrink-0">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'general' ? 'bg-primary/10 text-primary font-medium' : 'text-gray-500 hover:text-foreground hover:bg-gray-50'}`}
                    >
                        <Layout className="w-4 h-4" /> General
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'notifications' ? 'bg-primary/10 text-primary font-medium' : 'text-gray-500 hover:text-foreground hover:bg-gray-50'}`}
                    >
                        <Bell className="w-4 h-4" /> Notifications
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'security' ? 'bg-primary/10 text-primary font-medium' : 'text-gray-500 hover:text-foreground hover:bg-gray-50'}`}
                    >
                        <Shield className="w-4 h-4" /> Security
                    </button>
                    <button
                        onClick={() => setActiveTab('database')}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'database' ? 'bg-primary/10 text-primary font-medium' : 'text-gray-500 hover:text-foreground hover:bg-gray-50'}`}
                    >
                        <Database className="w-4 h-4" /> Database & Backups
                    </button>
                </div>

                {/* Settings Content */}
                <div className="flex-1 glass-panel p-8">
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-xl font-bold mb-6 text-foreground">General Configuration</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">School / Institution Name</label>
                                    <input
                                        type="text"
                                        className="glass-input w-full"
                                        value={settings.schoolName}
                                        onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Contact Email</label>
                                    <input
                                        type="email"
                                        className="glass-input w-full"
                                        value={settings.contactEmail}
                                        onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Academic Year</label>
                                    <select
                                        className="glass-input w-full appearance-none"
                                        value={settings.academicYear}
                                        onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                                    >
                                        <option>2023-2024</option>
                                        <option>2024-2025</option>
                                        <option>2025-2026</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Currency Symbol</label>
                                    <input
                                        type="text"
                                        className="glass-input w-full"
                                        value={settings.currencySymbol}
                                        onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">School Address</label>
                                    <textarea
                                        className="glass-input w-full min-h-[100px]"
                                        value={settings.schoolAddress}
                                        onChange={(e) => setSettings({ ...settings, schoolAddress: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-border flex justify-end items-center gap-4">
                                {saveSuccess && (
                                    <span className="text-sm font-bold text-success flex items-center gap-1 animate-in fade-in">
                                        <CheckCircle2 className="w-4 h-4" /> Saved Successfully!
                                    </span>
                                )}
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="premium-button-primary flex items-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6 animate-in fade-in text-gray-500">
                            <h2 className="text-xl font-bold mb-6 text-foreground">Notification Preferences</h2>
                            <p>Email and SMS notification templates will be configured here.</p>
                            <div className="p-4 bg-gray-50 rounded-xl border border-border inline-block text-sm font-medium text-foreground">
                                Feature coming in v1.1 update.
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-in fade-in text-gray-500">
                            <h2 className="text-xl font-bold mb-6 text-foreground">Security & Roles</h2>
                            <p>Admin password management and multi-user access controls.</p>
                            <div className="p-4 bg-gray-50 rounded-xl border border-border inline-block text-sm font-medium text-foreground">
                                Feature coming in v1.2 update.
                            </div>
                        </div>
                    )}

                    {activeTab === 'database' && (
                        <div className="space-y-6 animate-in fade-in text-gray-500">
                            <h2 className="text-xl font-bold mb-6 text-foreground">Database Operations</h2>
                            <p>Create local backups of the MongoDB collection or export to CSV.</p>
                            <div className="flex gap-4 mt-6">
                                <button className="premium-button-outline">Export All to CSV</button>
                                <button className="premium-button-primary">Create DB Backup Snapshot</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
