import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import DashboardLayout from './components/DashboardLayout';

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
