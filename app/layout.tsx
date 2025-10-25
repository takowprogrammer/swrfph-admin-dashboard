import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import DashboardLayout from './components/DashboardLayout';

export const metadata = {
  title: 'SWRFPH Admin',
  description: 'SWRFPH Admin Dashboard',
  icons: {
    icon: '/swrfph-logo.png',
    shortcut: '/swrfph-logo.png',
    apple: '/swrfph-logo.png',
  },
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <DashboardLayout>
            {children}
          </DashboardLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
