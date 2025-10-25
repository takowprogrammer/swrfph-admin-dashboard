'use client'

import { useState } from 'react'
import { User, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import RealtimeNotificationCenter from '@/components/RealtimeNotificationCenter'
import GlobalSearch from '@/components/GlobalSearch'
import { SWRFPHLogo } from '@/components/ui/SWRFPHLogo'

export default function Header() {
    const { user, logout } = useAuth()
    const [isProfileOpen, setIsProfileOpen] = useState(false)

    const handleLogout = async () => {
        try {
            await logout()
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
                onClick={() => {/* TODO: Add mobile menu toggle */ }}
            >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 flex items-center justify-between px-2 lg:px-4">
                <SWRFPHLogo size="sm" showText={false} />
                <div className="flex-1 flex justify-end gap-x-4 self-stretch lg:gap-x-6">
                    <div className="relative flex items-center">
                        <GlobalSearch />
                    </div>
                    <div className="flex items-center gap-x-4 lg:gap-x-6">
                        <RealtimeNotificationCenter />

                        <div className="relative">
                            <div className="flex items-center gap-x-4">
                                <div className="hidden lg:block lg:max-w-xs lg:flex-auto">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold leading-6 text-gray-900">
                                                {user?.email || 'Admin User'}
                                            </p>
                                            <p className="truncate text-xs leading-5 text-gray-500">
                                                Administrator
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="flex items-center gap-x-2 hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden lg:block">Sign out</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

