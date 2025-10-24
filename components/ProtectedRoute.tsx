'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRole?: 'ADMIN' | 'PROVIDER'
    redirectTo?: string
}

export default function ProtectedRoute({
    children,
    requiredRole,
    redirectTo = '/admin-login'
}: ProtectedRouteProps) {
    const { user, loading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push(redirectTo)
                return
            }

            if (requiredRole && user?.role !== requiredRole) {
                router.push('/unauthorized')
                return
            }
        }
    }, [user, loading, isAuthenticated, requiredRole, router, redirectTo])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    if (requiredRole && user?.role !== requiredRole) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-red-600">Unauthorized access</div>
            </div>
        )
    }

    return <>{children}</>
}
