'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { apiService } from '@/lib/api'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'

interface Order {
    id: string;
    createdAt: string;
    status: string;
    totalPrice: number;
    user: {
        name: string;
        email: string;
    };
    items: Array<{
        medicine: {
            name: string;
        };
        quantity: number;
        price: number;
    }>;
}

export default function OrdersPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [orders, setOrders] = useState<Order[]>([]);
    const [pastOrders, setPastOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'current' | 'past'>('current');
    const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const [currentData, pastData] = await Promise.all([
                    apiService.getOrders() as any,
                    apiService.getPastOrders() as any
                ]);
                setOrders(currentData.data || currentData);
                setPastOrders(pastData.data || pastData);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
                toast.error('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Handle orderId query parameter for highlighting specific orders
    useEffect(() => {
        const orderId = searchParams.get('orderId');
        if (orderId) {
            setHighlightedOrderId(orderId);
            // Scroll to the highlighted order after a short delay
            setTimeout(() => {
                const element = document.getElementById(`order-${orderId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            // Remove highlight after 3 seconds
            setTimeout(() => setHighlightedOrderId(null), 3000);
            // Clear the URL parameter
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('orderId');
            window.history.replaceState({}, '', newUrl.toString());
        }
    }, [searchParams]);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            await apiService.updateOrderStatus(orderId, newStatus);
            toast.success('Order status updated successfully');
            // Refresh both current and past orders
            const [currentData, pastData] = await Promise.all([
                apiService.getOrders() as any,
                apiService.getPastOrders() as any
            ]);
            setOrders(currentData.data || currentData);
            setPastOrders(pastData.data || pastData);
        } catch (error) {
            console.error('Failed to update order status:', error);
            toast.error('Failed to update order status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading orders...</div>
            </div>
        );
    }
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'PROCESSING': return 'bg-blue-100 text-blue-800';
            case 'SHIPPED': return 'bg-blue-100 text-blue-800';
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Order Management</h1>
                    <p className="mt-2 text-lg text-gray-600">Track and manage all pharmacy orders and their status.</p>
                </div>
                <Button
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-sm"
                    onClick={() => router.push('/orders')}
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Order
                </Button>
            </div>

            {/* Order Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Pending</h3>
                            <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'PENDING').length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Processing</h3>
                            <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'PROCESSING').length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Shipped</h3>
                            <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'SHIPPED').length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Delivered</h3>
                            <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'DELIVERED').length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('current')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'current'
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Current Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('past')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'past'
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Past Orders
                        </button>
                    </nav>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th scope="col" className="py-4 pl-6 pr-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                                <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                                <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                                <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-900">Total</th>
                                <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {(activeTab === 'current' ? orders : pastOrders).length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                {activeTab === 'current' ? 'No Current Orders' : 'No Past Orders'}
                                            </h3>
                                            <p className="text-gray-500">
                                                {activeTab === 'current'
                                                    ? 'There are no pending, processing, or shipped orders at the moment.'
                                                    : 'There are no completed or cancelled orders yet.'
                                                }
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (activeTab === 'current' ? orders : pastOrders).map((order) => (
                                <tr
                                    key={order.id}
                                    id={`order-${order.id}`}
                                    className={`hover:bg-gray-50 transition-colors ${highlightedOrderId === order.id
                                            ? 'bg-green-50 border-l-4 border-green-500 shadow-md'
                                            : ''
                                        }`}
                                >
                                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <div className="font-medium">#{order.id.substring(0, 7)}...</div>
                                                    {highlightedOrderId === order.id && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            Selected
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">{order.items.length} items</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 text-sm text-gray-900">
                                        <div>
                                            <div className="font-medium">{order.user.name}</div>
                                            <div className="text-gray-500">{order.user.email}</div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">{order.totalPrice.toFixed(2)} FCFA</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium">
                                        <div className="flex space-x-2">
                                            {activeTab === 'current' ? (
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                    className="text-xs border-2 border-gray-300 rounded-lg px-3 py-1 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="PROCESSING">Processing</option>
                                                    <option value="SHIPPED">Shipped</option>
                                                    <option value="DELIVERED">Delivered</option>
                                                    <option value="CANCELLED">Cancelled</option>
                                                </select>
                                            ) : (
                                                <span className="text-xs text-gray-500 italic">Completed</span>
                                            )}
                                            <Button variant="outline" size="sm" className="text-blue-600 border-blue-300 hover:bg-blue-50">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

