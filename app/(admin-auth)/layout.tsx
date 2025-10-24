'use client'

import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import "../globals.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                {children}
            </div>
            <Toaster />
        </AuthProvider>
    );
}

