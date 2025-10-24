'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SWRFPHLogo } from '@/components/ui/SWRFPHLogo'
import { Home, ListOrdered, Package, Users, BarChart2, Receipt, Settings, Bell, Activity, TrendingUp, CheckSquare, Shield, FileText } from 'lucide-react'

const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, current: false },
    { name: 'Orders', href: '/orders', icon: ListOrdered, current: false },
    { name: 'Inventory', href: '/inventory', icon: Package, current: false },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp, current: false },
    { name: 'Bulk Operations', href: '/bulk-operations', icon: CheckSquare, current: false },
    { name: 'System Health', href: '/system-health', icon: Activity, current: false },
    { name: 'Audit & Security', href: '/audit', icon: Shield, current: false },
    { name: 'Reports', href: '/reports', icon: BarChart2, current: false },
    { name: 'Report Builder', href: '/report-builder', icon: FileText, current: false },
    { name: 'Users', href: '/users', icon: Users, current: false },
    { name: 'Notifications', href: '/notifications', icon: Bell, current: false },
    { name: 'Receipts/Invoices', href: '/receipts-invoices', icon: Receipt, current: false },
    { name: 'Settings', href: '/settings', icon: Settings, current: false },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
            <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200 shadow-lg">
                <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
                    <div className="flex items-center flex-shrink-0 px-6 mb-8">
                        <SWRFPHLogo size="sm" showText={false} />
                        <h1 className="text-xl font-bold text-gray-900 ml-3">Admin Panel</h1>
                    </div>
                    <nav className="flex-1 px-4 space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        isActive
                                            ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-r-2 border-green-500 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm',
                                        'group flex items-center px-4 py-3 text-sm font-medium rounded-l-lg transition-all duration-200'
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600',
                                            'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200'
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>
        </div>
    )
}
