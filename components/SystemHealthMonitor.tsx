'use client'

import React, { useState, useEffect } from 'react'
import {
    Activity, Server, Database, Globe, AlertTriangle, CheckCircle,
    XCircle, Clock, RefreshCw, Download, Settings, Bell
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { apiService } from '@/lib/api'
import { toast } from 'sonner'

interface HealthMetric {
    name: string
    value: number
    status: 'healthy' | 'warning' | 'critical'
    threshold: {
        warning: number
        critical: number
    }
    unit: string
    trend: 'up' | 'down' | 'stable'
    lastUpdated: string
}

interface SystemHealth {
    overall: 'healthy' | 'warning' | 'critical'
    uptime: number
    lastCheck: string
    metrics: {
        cpu: HealthMetric
        memory: HealthMetric
        disk: HealthMetric
        database: HealthMetric
        api: HealthMetric
        network: HealthMetric
    }
    alerts: Array<{
        id: string
        type: 'error' | 'warning' | 'info'
        message: string
        timestamp: string
        resolved: boolean
    }>
    performance: Array<{
        timestamp: string
        responseTime: number
        requests: number
        errors: number
    }>
}

export default function SystemHealthMonitor() {
    const [health, setHealth] = useState<SystemHealth | null>(null)
    const [loading, setLoading] = useState(true)
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h')

    useEffect(() => {
        fetchHealthData()

        if (autoRefresh) {
            const interval = setInterval(fetchHealthData, 30000) // Refresh every 30 seconds
            return () => clearInterval(interval)
        }
    }, [autoRefresh])

    const fetchHealthData = async () => {
        try {
            setLoading(true)
            // Mock data - replace with actual API call
            const mockHealth: SystemHealth = {
                overall: 'healthy',
                uptime: 99.9,
                lastCheck: new Date().toISOString(),
                metrics: {
                    cpu: {
                        name: 'CPU Usage',
                        value: 45,
                        status: 'healthy',
                        threshold: { warning: 70, critical: 90 },
                        unit: '%',
                        trend: 'stable',
                        lastUpdated: new Date().toISOString()
                    },
                    memory: {
                        name: 'Memory Usage',
                        value: 62,
                        status: 'healthy',
                        threshold: { warning: 80, critical: 95 },
                        unit: '%',
                        trend: 'up',
                        lastUpdated: new Date().toISOString()
                    },
                    disk: {
                        name: 'Disk Usage',
                        value: 78,
                        status: 'warning',
                        threshold: { warning: 75, critical: 90 },
                        unit: '%',
                        trend: 'up',
                        lastUpdated: new Date().toISOString()
                    },
                    database: {
                        name: 'Database Connections',
                        value: 12,
                        status: 'healthy',
                        threshold: { warning: 50, critical: 80 },
                        unit: 'connections',
                        trend: 'stable',
                        lastUpdated: new Date().toISOString()
                    },
                    api: {
                        name: 'API Response Time',
                        value: 120,
                        status: 'healthy',
                        threshold: { warning: 500, critical: 1000 },
                        unit: 'ms',
                        trend: 'down',
                        lastUpdated: new Date().toISOString()
                    },
                    network: {
                        name: 'Network Latency',
                        value: 25,
                        status: 'healthy',
                        threshold: { warning: 100, critical: 200 },
                        unit: 'ms',
                        trend: 'stable',
                        lastUpdated: new Date().toISOString()
                    }
                },
                alerts: [
                    {
                        id: '1',
                        type: 'warning',
                        message: 'Disk usage is approaching warning threshold',
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                        resolved: false
                    },
                    {
                        id: '2',
                        type: 'info',
                        message: 'Scheduled maintenance completed successfully',
                        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                        resolved: true
                    }
                ],
                performance: Array.from({ length: 24 }, (_, i) => ({
                    timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
                    responseTime: Math.floor(Math.random() * 200) + 50,
                    requests: Math.floor(Math.random() * 1000) + 500,
                    errors: Math.floor(Math.random() * 10)
                }))
            }
            setHealth(mockHealth)
        } catch (error) {
            console.error('Failed to fetch health data:', error)
            toast.error('Failed to load system health data')
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="h-5 w-5 text-green-600" />
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-600" />
            case 'critical':
                return <XCircle className="h-5 w-5 text-red-600" />
            default:
                return <Clock className="h-5 w-5 text-gray-600" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'text-green-600 bg-green-50'
            case 'warning':
                return 'text-yellow-600 bg-yellow-50'
            case 'critical':
                return 'text-red-600 bg-red-50'
            default:
                return 'text-gray-600 bg-gray-50'
        }
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return '↗️'
            case 'down':
                return '↘️'
            case 'stable':
                return '→'
            default:
                return '→'
        }
    }

    const exportHealthReport = () => {
        if (!health) return
        toast.success('Exporting health report...')
        // Implement actual export functionality
    }

    const resolveAlert = (alertId: string) => {
        if (!health) return
        setHealth(prev => prev ? {
            ...prev,
            alerts: prev.alerts.map(alert =>
                alert.id === alertId ? { ...alert, resolved: true } : alert
            )
        } : null)
        toast.success('Alert resolved')
    }

    if (loading && !health) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading system health...</div>
            </div>
        )
    }

    if (!health) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-red-600">Failed to load system health data</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">System Health Monitor</h2>
                    <p className="text-gray-600">Real-time monitoring of system performance and health metrics</p>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={autoRefresh ? 'bg-green-50 text-green-700' : ''}
                    >
                        <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                        Auto Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchHealthData}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportHealthReport}
                    >
                        <Download className="h-4 w-4 mr-1" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Overall Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        {getStatusIcon(health.overall)}
                        <span>System Status</span>
                        <Badge className={getStatusColor(health.overall)}>
                            {health.overall.toUpperCase()}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">{health.uptime}%</div>
                            <div className="text-sm text-gray-600">Uptime</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">
                                {health.alerts.filter(alert => !alert.resolved).length}
                            </div>
                            <div className="text-sm text-gray-600">Active Alerts</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">
                                {new Date(health.lastCheck).toLocaleTimeString()}
                            </div>
                            <div className="text-sm text-gray-600">Last Check</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Health Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(health.metrics).map(([key, metric]) => (
                    <Card key={key}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="text-sm font-medium">{metric.name}</span>
                                {getStatusIcon(metric.status)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold">{metric.value}</span>
                                    <span className="text-sm text-gray-600">{metric.unit}</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>Current</span>
                                        <span>{getTrendIcon(metric.trend)}</span>
                                    </div>
                                    <Progress
                                        value={metric.value}
                                        className="h-2"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Warning: {metric.threshold.warning}{metric.unit}</span>
                                        <span>Critical: {metric.threshold.critical}{metric.unit}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Performance Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5" />
                        <span>Performance Trends</span>
                    </CardTitle>
                    <CardDescription>API response time and request volume over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={health.performance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                                />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip
                                    labelFormatter={(value) => new Date(value).toLocaleString()}
                                    formatter={(value: any, name: string) => [
                                        name === 'responseTime' ? `${value}ms` : value,
                                        name === 'responseTime' ? 'Response Time' :
                                            name === 'requests' ? 'Requests' : 'Errors'
                                    ]}
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="responseTime"
                                    stroke="#10B981"
                                    fill="#10B981"
                                    fillOpacity={0.3}
                                    name="responseTime"
                                />
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="requests"
                                    stroke="#3B82F6"
                                    fill="#3B82F6"
                                    fillOpacity={0.3}
                                    name="requests"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Bell className="h-5 w-5" />
                        <span>System Alerts</span>
                        <Badge variant="outline">
                            {health.alerts.filter(alert => !alert.resolved).length} Active
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {health.alerts.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                <p>No active alerts</p>
                            </div>
                        ) : (
                            health.alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`flex items-center justify-between p-4 rounded-lg border ${alert.resolved ? 'bg-gray-50' :
                                        alert.type === 'error' ? 'bg-red-50 border-red-200' :
                                            alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                                'bg-blue-50 border-blue-200'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        {getStatusIcon(alert.resolved ? 'healthy' : alert.type)}
                                        <div>
                                            <p className="text-sm font-medium">{alert.message}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(alert.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    {!alert.resolved && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => resolveAlert(alert.id)}
                                        >
                                            Resolve
                                        </Button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
