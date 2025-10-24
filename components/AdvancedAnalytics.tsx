'use client'

import React, { useState, useEffect } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart,
    ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    TrendingUp, TrendingDown, Users, Package, DollarSign, MapPin,
    Calendar, Download, Filter, RefreshCw, Eye, EyeOff
} from 'lucide-react'
import { apiService } from '@/lib/api'
import { toast } from 'sonner'

interface AnalyticsData {
    revenue: {
        trends: Array<{
            month: string
            revenue: number
            orders: number
            avgOrderValue: number
            growth: number
        }>
        forecast: Array<{
            month: string
            predicted: number
            confidence: number
        }>
    }
    users: {
        growth: Array<{
            month: string
            newUsers: number
            activeUsers: number
            totalUsers: number
        }>
        distribution: Array<{
            region: string
            users: number
            orders: number
            revenue: number
        }>
    }
    medicines: {
        performance: Array<{
            medicineId: string
            name: string
            category: string
            sales: number
            revenue: number
            profit: number
            margin: number
            stock: number
            turnover: number
        }>
        categories: Array<{
            category: string
            count: number
            revenue: number
            margin: number
        }>
    }
    providers: {
        performance: Array<{
            providerId: string
            name: string
            orders: number
            revenue: number
            rating: number
            completionRate: number
            avgResponseTime: number
        }>
    }
    seasonal: {
        patterns: Array<{
            month: string
            orders: number
            revenue: number
            category: string
        }>
    }
}

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

export default function AdvancedAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
    const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'users' | 'medicines' | 'providers'>('revenue')
    const [showForecast, setShowForecast] = useState(true)
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart')

    useEffect(() => {
        fetchAnalytics()
    }, [selectedPeriod])

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            // Mock data for now - replace with actual API calls
            const mockData: AnalyticsData = {
                revenue: {
                    trends: [
                        { month: 'Jan', revenue: 45000, orders: 120, avgOrderValue: 375, growth: 12.5 },
                        { month: 'Feb', revenue: 52000, orders: 135, avgOrderValue: 385, growth: 15.6 },
                        { month: 'Mar', revenue: 48000, orders: 128, avgOrderValue: 375, growth: -7.7 },
                        { month: 'Apr', revenue: 61000, orders: 155, avgOrderValue: 394, growth: 27.1 },
                        { month: 'May', revenue: 58000, orders: 148, avgOrderValue: 392, growth: -4.9 },
                        { month: 'Jun', revenue: 67000, orders: 165, avgOrderValue: 406, growth: 15.5 }
                    ],
                    forecast: [
                        { month: 'Jul', predicted: 72000, confidence: 85 },
                        { month: 'Aug', predicted: 75000, confidence: 82 },
                        { month: 'Sep', predicted: 78000, confidence: 80 }
                    ]
                },
                users: {
                    growth: [
                        { month: 'Jan', newUsers: 45, activeUsers: 180, totalUsers: 450 },
                        { month: 'Feb', newUsers: 52, activeUsers: 195, totalUsers: 502 },
                        { month: 'Mar', newUsers: 38, activeUsers: 188, totalUsers: 540 },
                        { month: 'Apr', newUsers: 65, activeUsers: 220, totalUsers: 605 },
                        { month: 'May', newUsers: 58, activeUsers: 235, totalUsers: 663 },
                        { month: 'Jun', newUsers: 72, activeUsers: 250, totalUsers: 735 }
                    ],
                    distribution: [
                        { region: 'North', users: 180, orders: 320, revenue: 25000 },
                        { region: 'South', users: 220, orders: 380, revenue: 30000 },
                        { region: 'East', users: 150, orders: 280, revenue: 22000 },
                        { region: 'West', users: 185, orders: 310, revenue: 24000 }
                    ]
                },
                medicines: {
                    performance: [
                        { medicineId: '1', name: 'Paracetamol 500mg', category: 'Pain Relief', sales: 450, revenue: 2250, profit: 675, margin: 30, stock: 120, turnover: 3.75 },
                        { medicineId: '2', name: 'Amoxicillin 250mg', category: 'Antibiotic', sales: 320, revenue: 1920, profit: 576, margin: 30, stock: 80, turnover: 4.0 },
                        { medicineId: '3', name: 'Ibuprofen 400mg', category: 'Pain Relief', sales: 380, revenue: 2280, profit: 684, margin: 30, stock: 95, turnover: 4.0 },
                        { medicineId: '4', name: 'Metformin 500mg', category: 'Diabetes', sales: 280, revenue: 1680, profit: 504, margin: 30, stock: 70, turnover: 4.0 }
                    ],
                    categories: [
                        { category: 'Pain Relief', count: 45, revenue: 15000, margin: 28 },
                        { category: 'Antibiotic', count: 32, revenue: 12000, margin: 30 },
                        { category: 'Diabetes', count: 28, revenue: 8500, margin: 25 },
                        { category: 'Cardiovascular', count: 22, revenue: 11000, margin: 32 }
                    ]
                },
                providers: {
                    performance: [
                        { providerId: '1', name: 'Central Pharmacy', orders: 180, revenue: 45000, rating: 4.8, completionRate: 95, avgResponseTime: 2.5 },
                        { providerId: '2', name: 'Health Plus', orders: 150, revenue: 38000, rating: 4.6, completionRate: 92, avgResponseTime: 3.2 },
                        { providerId: '3', name: 'MediCare', orders: 120, revenue: 32000, rating: 4.7, completionRate: 94, avgResponseTime: 2.8 }
                    ]
                },
                seasonal: {
                    patterns: [
                        { month: 'Jan', orders: 120, revenue: 45000, category: 'Winter' },
                        { month: 'Feb', orders: 135, revenue: 52000, category: 'Winter' },
                        { month: 'Mar', orders: 128, revenue: 48000, category: 'Spring' },
                        { month: 'Apr', orders: 155, revenue: 61000, category: 'Spring' },
                        { month: 'May', orders: 148, revenue: 58000, category: 'Spring' },
                        { month: 'Jun', orders: 165, revenue: 67000, category: 'Summer' }
                    ]
                }
            }
            setData(mockData)
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
            toast.error('Failed to load analytics data')
        } finally {
            setLoading(false)
        }
    }

    const exportData = (format: 'csv' | 'pdf' | 'excel') => {
        toast.success(`Exporting data as ${format.toUpperCase()}...`)
        // Implement actual export functionality
    }

    const renderRevenueChart = () => {
        if (!data) return null

        const chartData = [...data.revenue.trends]
        if (showForecast) {
            chartData.push(...data.revenue.forecast.map(f => ({
                month: f.month,
                revenue: f.predicted,
                orders: 0,
                avgOrderValue: 0,
                growth: 0,
                isForecast: true
            })))
        }

        return (
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                        formatter={(value: any, name: string) => [
                            name === 'revenue' ? `${value.toLocaleString()} FCFA` : value,
                            name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Avg Order Value'
                        ]}
                    />
                    <Bar yAxisId="left" dataKey="revenue" fill="#10B981" name="revenue" />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} name="orders" />
                </ComposedChart>
            </ResponsiveContainer>
        )
    }

    const renderUserGrowthChart = () => {
        if (!data) return null

        return (
            <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data.users.growth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="newUsers" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="activeUsers" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                </AreaChart>
            </ResponsiveContainer>
        )
    }

    const renderMedicinePerformanceChart = () => {
        if (!data) return null

        return (
            <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={data.medicines.performance}>
                    <CartesianGrid />
                    <XAxis dataKey="sales" name="Sales" />
                    <YAxis dataKey="revenue" name="Revenue" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Medicines" dataKey="revenue" fill="#10B981" />
                </ScatterChart>
            </ResponsiveContainer>
        )
    }

    const renderProviderPerformanceChart = () => {
        if (!data) return null

        return (
            <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={data.providers.performance}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis />
                    <Radar name="Performance" dataKey="rating" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                </RadarChart>
            </ResponsiveContainer>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading analytics...</div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-red-600">Failed to load analytics data</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
                    <p className="text-gray-600">Comprehensive insights and data-driven decision making</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant={selectedPeriod === '7d' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedPeriod('7d')}
                        >
                            7D
                        </Button>
                        <Button
                            variant={selectedPeriod === '30d' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedPeriod('30d')}
                        >
                            30D
                        </Button>
                        <Button
                            variant={selectedPeriod === '90d' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedPeriod('90d')}
                        >
                            90D
                        </Button>
                        <Button
                            variant={selectedPeriod === '1y' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedPeriod('1y')}
                        >
                            1Y
                        </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
                        >
                            {viewMode === 'chart' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchAnalytics()}
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportData('csv')}
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Metric Selector */}
            <div className="flex flex-wrap gap-2">
                {[
                    { key: 'revenue', label: 'Revenue Trends', icon: DollarSign },
                    { key: 'users', label: 'User Growth', icon: Users },
                    { key: 'medicines', label: 'Medicine Performance', icon: Package },
                    { key: 'providers', label: 'Provider Analytics', icon: TrendingUp }
                ].map(({ key, label, icon: Icon }) => (
                    <Button
                        key={key}
                        variant={selectedMetric === key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedMetric(key as any)}
                        className="flex items-center space-x-2"
                    >
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                    </Button>
                ))}
            </div>

            {/* Main Chart */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center space-x-2">
                                {selectedMetric === 'revenue' && <DollarSign className="h-5 w-5" />}
                                {selectedMetric === 'users' && <Users className="h-5 w-5" />}
                                {selectedMetric === 'medicines' && <Package className="h-5 w-5" />}
                                {selectedMetric === 'providers' && <TrendingUp className="h-5 w-5" />}
                                <span>
                                    {selectedMetric === 'revenue' && 'Revenue Trends & Forecasting'}
                                    {selectedMetric === 'users' && 'User Growth Analytics'}
                                    {selectedMetric === 'medicines' && 'Medicine Performance Metrics'}
                                    {selectedMetric === 'providers' && 'Provider Performance Analytics'}
                                </span>
                            </CardTitle>
                            <CardDescription>
                                {selectedPeriod === '7d' && 'Last 7 days'}
                                {selectedPeriod === '30d' && 'Last 30 days'}
                                {selectedPeriod === '90d' && 'Last 90 days'}
                                {selectedPeriod === '1y' && 'Last year'}
                            </CardDescription>
                        </div>
                        {selectedMetric === 'revenue' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowForecast(!showForecast)}
                            >
                                {showForecast ? 'Hide' : 'Show'} Forecast
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {selectedMetric === 'revenue' && renderRevenueChart()}
                    {selectedMetric === 'users' && renderUserGrowthChart()}
                    {selectedMetric === 'medicines' && renderMedicinePerformanceChart()}
                    {selectedMetric === 'providers' && renderProviderPerformanceChart()}
                </CardContent>
            </Card>

            {/* Additional Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Geographic Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <MapPin className="h-5 w-5" />
                            <span>Geographic Distribution</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.users.distribution.map((region, index) => (
                                <div key={region.region} className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{region.region}</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{ width: `${(region.users / Math.max(...data.users.distribution.map(r => r.users))) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600">{region.users}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Categories */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Package className="h-5 w-5" />
                            <span>Top Categories</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.medicines.categories.map((category, index) => (
                                <div key={category.category} className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{category.category}</span>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline">{category.count} items</Badge>
                                        <span className="text-sm text-gray-600">{category.revenue.toLocaleString()} FCFA</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Seasonal Patterns */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5" />
                            <span>Seasonal Patterns</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.seasonal.patterns.slice(-3).map((pattern, index) => (
                                <div key={pattern.month} className="flex justify-between items-center text-sm">
                                    <span>{pattern.month}</span>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-600">{pattern.orders} orders</span>
                                        <Badge variant="outline" className="text-xs">{pattern.category}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
