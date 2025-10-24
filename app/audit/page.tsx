'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Shield, Activity, Users, Clock, AlertTriangle, Search, Download, RefreshCw, CheckCircle } from 'lucide-react'
// Removed date-fns dependency

interface AuditLog {
    id: string
    createdAt: string
    userId?: string
    action: string
    resource: string
    resourceId?: string
    description: string
    details?: any
    ipAddress?: string
    userAgent?: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    metadata?: any
    user?: {
        id: string
        email: string
        name: string
        role: string
    }
}

interface SecurityEvent {
    id: string
    createdAt: string
    userId?: string
    eventType: string
    description: string
    ipAddress?: string
    userAgent?: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    resolved: boolean
    resolvedAt?: string
    resolvedBy?: string
    metadata?: any
    user?: {
        id: string
        email: string
        name: string
        role: string
    }
}

const severityColors = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800'
}

const actionColors = {
    CREATE: 'bg-blue-100 text-blue-800',
    READ: 'bg-gray-100 text-gray-800',
    UPDATE: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800',
    LOGIN: 'bg-green-100 text-green-800',
    LOGOUT: 'bg-gray-100 text-gray-800',
    FAILED_LOGIN: 'bg-red-100 text-red-800',
    BULK_OPERATION: 'bg-purple-100 text-purple-800',
    SYSTEM_EVENT: 'bg-indigo-100 text-indigo-800'
}

export default function AuditPage() {
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
    const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'logs' | 'security'>('logs')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchData()
    }, [activeTab])

    const fetchData = async () => {
        setLoading(true)
        try {
            if (activeTab === 'logs') {
                const response = await fetch('http://localhost:5000/audit/logs?page=1&limit=50', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    setAuditLogs(data.data || [])
                }
            } else {
                const response = await fetch('http://localhost:5000/audit/security-events?page=1&limit=50', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    setSecurityEvents(data.data || [])
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const exportData = () => {
        const data = activeTab === 'logs' ? auditLogs : securityEvents
        const dataStr = JSON.stringify(data, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${activeTab}-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        URL.revokeObjectURL(url)
    }

    const filteredData = (activeTab === 'logs' ? auditLogs : securityEvents).filter(item =>
        searchTerm === '' ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.user && item.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Audit & Security</h1>
                <p className="text-muted-foreground">
                    Monitor system activities, security events, and user actions
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{auditLogs.length}</div>
                        <p className="text-xs text-muted-foreground">Audit entries</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Security Events</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{securityEvents.length}</div>
                        <p className="text-xs text-muted-foreground">Security incidents</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {[...auditLogs, ...securityEvents].filter(item => item.severity === 'CRITICAL').length}
                        </div>
                        <p className="text-xs text-muted-foreground">High priority</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {securityEvents.filter(event => !event.resolved).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Pending resolution</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'logs'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Audit Logs
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'security'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Security Events
                </button>
            </div>

            {/* Main Content */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                            {activeTab === 'logs' ? 'Audit Logs' : 'Security Events'}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={exportData}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                            <Button variant="outline" size="sm" onClick={fetchData}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Data Display */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8">
                                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                                <p>Loading...</p>
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No data found
                            </div>
                        ) : (
                            filteredData.map((item) => (
                                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className={
                                                    activeTab === 'logs'
                                                        ? (actionColors[(item as AuditLog).action as keyof typeof actionColors] || 'bg-gray-100 text-gray-800')
                                                        : 'bg-red-100 text-red-800'
                                                }>
                                                    {activeTab === 'logs' ? (item as AuditLog).action : (item as SecurityEvent).eventType}
                                                </Badge>
                                                <Badge className={severityColors[item.severity]}>
                                                    {item.severity}
                                                </Badge>
                                                {activeTab === 'security' && (
                                                    <Badge className={(item as SecurityEvent).resolved ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                                                        {(item as SecurityEvent).resolved ? 'Resolved' : 'Unresolved'}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-900 mb-1">{item.description}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span>{new Date(item.createdAt).toLocaleString()}</span>
                                                {item.user && (
                                                    <span>User: {item.user.name || item.user.email}</span>
                                                )}
                                                {item.ipAddress && (
                                                    <span>IP: {item.ipAddress}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}