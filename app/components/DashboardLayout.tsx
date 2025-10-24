'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, loading, isAuthenticated } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

  // Don't show sidebar/header on login page
  const isLoginPage = pathname === '/admin-login' || pathname === '/login'

  // Debug logging
  console.log('DashboardLayout - loading:', loading, 'isAuthenticated:', isAuthenticated, 'isLoginPage:', isLoginPage, 'user:', user)

  useEffect(() => {
    // If not authenticated and not on login page, redirect immediately
    if (!loading && !isAuthenticated && !isLoginPage) {
      console.log('DashboardLayout - Redirecting to login page')
      router.push('/login')
    }
  }, [loading, isAuthenticated, isLoginPage, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    // If not authenticated and not on login page, show loading (will redirect)
    if (!isAuthenticated && !isLoginPage) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Redirecting to login...</p>
                </div>
            </div>
        )
    }

    // If on login page, just show children (login form)
    if (isLoginPage) {
        return <>{children}</>
    }

    // If authenticated, show full dashboard layout
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
