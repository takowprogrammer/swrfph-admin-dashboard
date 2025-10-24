'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button'
import { Bell, Clock, Package, ShoppingCart, Activity, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { apiService } from '@/lib/api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import AdvancedAnalytics from '@/components/AdvancedAnalytics'
import BulkOperations from '@/components/BulkOperations'
import SystemHealthMonitor from '@/components/SystemHealthMonitor'

interface AdminStats {
  overview: {
    totalUsers: number;
    totalProviders: number;
    totalAdmins: number;
    totalMedicines: number;
    totalOrders: number;
    totalRevenue: number;
    totalOrdersChange: number;
    totalRevenueChange: number;
    totalUsersChange: number;
  };
  recentOrders: Array<{
    id: string;
    createdAt: string;
    status: string;
    totalPrice: number;
    user: { name: string; email: string };
    items: Array<{
      medicine: { name: string };
      quantity: number;
      price: number;
    }>;
  }>;
  lowStockMedicines: {
    critical: Array<{
      id: string;
      name: string;
      quantity: number;
      category: string;
      price: number;
      description: string;
    }>;
    low: Array<{
      id: string;
      name: string;
      quantity: number;
      category: string;
      price: number;
      description: string;
    }>;
    warning: Array<{
      id: string;
      name: string;
      quantity: number;
      category: string;
      price: number;
      description: string;
    }>;
    total: number;
    summary: {
      critical: number;
      low: number;
      warning: number;
    };
  };
  topMedicines: Array<{
    medicineId: string;
    _sum: { quantity: number };
    _count: { medicineId: number };
    medicine: { id: string; name: string; category: string };
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
}

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'bulk' | 'health'>('overview')

  // Use real monthly revenue data
  const salesData = stats?.monthlyRevenue?.map((item, index) => ({
    name: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
    sales: item.revenue || 0,
  })) || [
      { name: 'Jan', sales: 0 },
      { name: 'Feb', sales: 0 },
      { name: 'Mar', sales: 0 },
      { name: 'Apr', sales: 0 },
      { name: 'May', sales: 0 },
      { name: 'Jun', sales: 0 },
    ]

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getAdminStats() as any
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch admin stats:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Failed to load dashboard data</div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const recentActivities = stats.recentOrders.slice(0, 4).map((order, index) => ({
    id: order.id,
    user: order.user.name,
    action: `placed order #${order.id.substring(0, 7)}...`,
    time: formatDate(order.createdAt),
    icon: ShoppingCart,
  }))

  const pieData = [
    { name: 'Delivered', value: stats.overview.totalOrders },
    { name: 'Processing', value: stats.overview.totalOrders },
    { name: 'Shipped', value: stats.overview.totalOrders },
    { name: 'Pending', value: stats.overview.totalOrders },
  ]
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">Comprehensive management and monitoring for your pharmacy system.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: Package },
            { id: 'analytics', name: 'Analytics', icon: TrendingUp },
            { id: 'bulk', name: 'Bulk Operations', icon: Users },
            { id: 'health', name: 'System Health', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{stats.overview.totalUsers}</p>
                  <p className={`text-sm ${stats.overview.totalUsersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.overview.totalUsersChange >= 0 ? '+' : ''}{stats.overview.totalUsersChange.toFixed(1)}% from last month
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{stats.overview.totalOrders}</p>
                  <p className={`text-sm ${stats.overview.totalOrdersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.overview.totalOrdersChange >= 0 ? '+' : ''}{stats.overview.totalOrdersChange.toFixed(1)}% from last month
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-600">Total Medicines</h3>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{stats.overview.totalMedicines}</p>
                  <p className="text-sm text-blue-600">Current inventory</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{stats.overview.totalRevenue.toLocaleString()} FCFA</p>
                  <p className={`text-sm ${stats.overview.totalRevenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.overview.totalRevenueChange >= 0 ? '+' : ''}{stats.overview.totalRevenueChange.toFixed(1)}% from last month
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white h-12 rounded-lg shadow-sm"
                onClick={() => router.push('/orders')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Manage Orders
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-lg border-gray-300 hover:bg-gray-50"
                onClick={() => router.push('/inventory')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                View Inventory
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-lg border-gray-300 hover:bg-gray-50"
                onClick={() => router.push('/reports')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Reports
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-lg border-gray-300 hover:bg-gray-50"
                onClick={() => router.push('/inventory')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Medicine
              </Button>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Sales Trend */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Sales Trend</h3>
                  <p className="text-sm text-gray-600">Revenue over the last 6 months</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stats.overview.totalRevenue.toLocaleString()} FCFA</p>
                  <p className={`text-sm flex items-center ${stats.overview.totalRevenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stats.overview.totalRevenueChange >= 0 ? "M7 17l9.2-9.2M17 17V7H7" : "M17 7l-9.2 9.2M7 7v10h10"} />
                    </svg>
                    {stats.overview.totalRevenueChange >= 0 ? '+' : ''}{stats.overview.totalRevenueChange.toFixed(1)}% from last month
                  </p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: any) => [`${value.toLocaleString()} FCFA`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Order Status</h3>
                <p className="text-sm text-gray-600">Distribution of order statuses</p>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
              <Button
                variant="outline"
                className="text-sm"
                onClick={() => router.push('/orders')}
              >
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/orders?orderId=${activity.id}`)}
                >
                  <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                    <activity.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                      <span className="font-semibold">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      {activity.time}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      New
                    </span>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'analytics' && <AdvancedAnalytics />}
      {activeTab === 'bulk' && <BulkOperations />}
      {activeTab === 'health' && <SystemHealthMonitor />}
    </div>
  )
}
