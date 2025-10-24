'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiService } from '@/lib/api'
import { toast } from 'sonner'
import { Save, Globe, Bell, Building, Shield, Database, Settings as SettingsIcon } from 'lucide-react'

interface Setting {
    key: string;
    value: string;
    category: string;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [generalSettings, setGeneralSettings] = useState({
        language: '',
        timezone: '',
    });
    const [notificationSettings, setNotificationSettings] = useState({
        emailAlerts: false,
        smsAlerts: false,
    });
    const [organizationSettings, setOrganizationSettings] = useState({
        orgName: '',
        orgAddress: '',
        orgContact: '',
        orgPhone: '',
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const [general, notifications, organization] = await Promise.all([
                apiService.getSettingsByCategory('general') as any,
                apiService.getSettingsByCategory('notifications') as any,
                apiService.getSettingsByCategory('organization') as any,
            ]);

            // Process general settings
            const generalMap = general.reduce((acc: Record<string, string>, setting: any) => {
                acc[setting.key] = setting.value;
                return acc;
            }, {} as Record<string, string>);

            setGeneralSettings({
                language: generalMap.language || 'en',
                timezone: generalMap.timezone || 'UTC',
            });

            // Process notification settings
            const notificationMap = notifications.reduce((acc: Record<string, boolean>, setting: any) => {
                acc[setting.key] = setting.value === 'true';
                return acc;
            }, {} as Record<string, boolean>);

            setNotificationSettings({
                emailAlerts: notificationMap.email_alerts || false,
                smsAlerts: notificationMap.sms_alerts || false,
            });

            // Process organization settings
            const orgMap = organization.reduce((acc: Record<string, string>, setting: any) => {
                acc[setting.key] = setting.value;
                return acc;
            }, {} as Record<string, string>);

            setOrganizationSettings({
                orgName: orgMap.org_name || '',
                orgAddress: orgMap.org_address || '',
                orgContact: orgMap.org_contact || '',
                orgPhone: orgMap.org_phone || '',
            });

        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGeneral = async () => {
        try {
            setSaving(true);
            await apiService.updateGeneralSettings(generalSettings);
            toast.success('General settings saved successfully!');
        } catch (error) {
            console.error('Failed to save general settings:', error);
            toast.error('Failed to save general settings');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveNotifications = async () => {
        try {
            setSaving(true);
            await apiService.updateNotificationSettings(notificationSettings);
            toast.success('Notification settings saved successfully!');
        } catch (error) {
            console.error('Failed to save notification settings:', error);
            toast.error('Failed to save notification settings');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveOrganization = async () => {
        try {
            setSaving(true);
            await apiService.updateOrganizationSettings(organizationSettings);
            toast.success('Organization settings saved successfully!');
        } catch (error) {
            console.error('Failed to save organization settings:', error);
            toast.error('Failed to save organization settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <div className="text-lg text-gray-600">Loading settings...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <SettingsIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
                    <p className="mt-2 text-lg text-gray-600">Manage your application preferences and organization details</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General Preferences */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Globe className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800">General Preferences</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="language" className="text-sm font-medium text-gray-700 mb-2 block">
                                Language
                            </Label>
                            <select
                                id="language"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm bg-white"
                                value={generalSettings.language}
                                onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                            >
                                <option value="en">English</option>
                                <option value="fr">French</option>
                                <option value="es">Spanish</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="timezone" className="text-sm font-medium text-gray-700 mb-2 block">
                                Timezone
                            </Label>
                            <select
                                id="timezone"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm bg-white"
                                value={generalSettings.timezone}
                                onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                            >
                                <option value="UTC">UTC</option>
                                <option value="Africa/Douala">Africa/Douala (Cameroon)</option>
                                <option value="America/New_York">America/New_York</option>
                                <option value="Europe/London">Europe/London</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <Button
                            onClick={handleSaveGeneral}
                            disabled={saving}
                            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-sm transition-colors"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save General Settings'}
                        </Button>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                            <Bell className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800">Notification Settings</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Email Alerts</h3>
                                    <p className="text-sm text-gray-500">Get notified about new orders via email</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={notificationSettings.emailAlerts}
                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, emailAlerts: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">SMS Alerts</h3>
                                    <p className="text-sm text-gray-500">Get notified about critical stock levels via SMS</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={notificationSettings.smsAlerts}
                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, smsAlerts: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <Button
                            onClick={handleSaveNotifications}
                            disabled={saving}
                            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-sm transition-colors"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Notification Settings'}
                        </Button>
                    </div>
                </div>

                {/* Organization Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Building className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800">Organization Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="org-name" className="text-sm font-medium text-gray-700 mb-2 block">
                                Organization Name
                            </Label>
                            <Input
                                id="org-name"
                                type="text"
                                placeholder="Enter organization name"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                                value={organizationSettings.orgName}
                                onChange={(e) => setOrganizationSettings({ ...organizationSettings, orgName: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="org-contact" className="text-sm font-medium text-gray-700 mb-2 block">
                                Contact Email
                            </Label>
                            <Input
                                id="org-contact"
                                type="email"
                                placeholder="contact@organization.com"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                                value={organizationSettings.orgContact}
                                onChange={(e) => setOrganizationSettings({ ...organizationSettings, orgContact: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="org-phone" className="text-sm font-medium text-gray-700 mb-2 block">
                                Phone Number
                            </Label>
                            <Input
                                id="org-phone"
                                type="tel"
                                placeholder="+237 6XX XXX XXX"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                                value={organizationSettings.orgPhone}
                                onChange={(e) => setOrganizationSettings({ ...organizationSettings, orgPhone: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="org-address" className="text-sm font-medium text-gray-700 mb-2 block">
                                Address
                            </Label>
                            <textarea
                                id="org-address"
                                rows={3}
                                placeholder="Enter complete organization address"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm resize-none"
                                value={organizationSettings.orgAddress}
                                onChange={(e) => setOrganizationSettings({ ...organizationSettings, orgAddress: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <Button
                            onClick={handleSaveOrganization}
                            disabled={saving}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg shadow-sm transition-colors"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Organization Settings'}
                        </Button>
                    </div>
                </div>

                {/* System Integrations */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800">System Integrations</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">External Systems</h3>
                            <p className="text-sm text-gray-500 mb-4">Connect with external pharmacy management systems</p>
                            <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm bg-white">
                                <option value="">Select integration</option>
                                <option value="epic">Epic Systems</option>
                                <option value="cerner">Cerner</option>
                                <option value="custom">Custom API</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Data Backup */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <Database className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800">Data Backup</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">Backup Frequency</h3>
                            <p className="text-sm text-gray-500 mb-4">Configure automatic data backup schedule</p>
                            <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm bg-white">
                                <option value="">Select frequency</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-green-800">Last backup: 2 hours ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

