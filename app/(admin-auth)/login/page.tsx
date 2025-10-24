'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AdminLoginPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-12">
            <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Link href="/" className="font-bold text-xl text-gray-800">
                            Southwest Regional Fund for Health Promotion
                        </Link>
                        <nav className="flex items-center space-x-4">
                            <Link href="/about" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">About</Link>
                            <Link href="/services" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Services</Link>
                            <Link href="/contact" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Contact</Link>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Login</Button>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center w-full">
                <div className="w-full max-w-md">
                    <h1 className="text-3xl font-bold text-center text-gray-900">Admin Login</h1>
                    <div className="mt-8 bg-white p-8 shadow-lg rounded-lg">
                        <form className="space-y-6">
                            <div>
                                <label htmlFor="username">Username/Email</label>
                                <input type="text" id="username" placeholder="Enter your username or email" className="mt-2 w-full px-4 py-3 bg-gray-100 border-transparent rounded-md focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="password">Password</label>
                                <input type="password" id="password" placeholder="Enter your password" className="mt-2 w-full px-4 py-3 bg-gray-100 border-transparent rounded-md focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Login</Button>
                            </div>
                        </form>
                        <p className="mt-4 text-center text-sm">
                            <Link href="#" className="font-medium text-blue-600 hover:underline">Forgot Password?</Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}

