'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertCircle, Search, Filter, Download, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

interface AuditLog {
    id: string
    timestamp: string
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

interface AuditLogsResponse {
    data: AuditLog[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
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

export function AuditLogsTable() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    })
    const [filters, setFilters] = useState({
        search: '',
        action: '',
        resource: '',
        severity: '',
        userId: ''
    })

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(filters.search && { search: filters.search }),
                ...(filters.action && { action: filters.action }),
                ...(filters.resource && { resource: filters.resource }),
                ...(filters.severity && { severity: filters.severity }),
                ...(filters.userId && { userId: filters.userId })
            })

            const response = await fetch(`http://localhost:5000/audit/logs?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            })

            if (response.ok) {
                const data: AuditLogsResponse = await response.json()
                setLogs(data.data)
                setPagination(data.pagination)
            } else {
                console.error('Failed to fetch audit logs')
            }
        } catch (error) {
            console.error('Error fetching audit logs:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [pagination.page, filters])

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }))
    }

    const exportLogs = () => {
        const dataStr = JSON.stringify(logs, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.json`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Audit Logs
                        </CardTitle>
                        <CardDescription>
                            Complete audit trail of all system activities
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={exportLogs}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm" onClick={fetchLogs}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search logs..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select value={filters.action} onValueChange={(value: string) => handleFilterChange('action', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Action" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Actions</SelectItem>
                            <SelectItem value="CREATE">Create</SelectItem>
                            <SelectItem value="READ">Read</SelectItem>
                            <SelectItem value="UPDATE">Update</SelectItem>
                            <SelectItem value="DELETE">Delete</SelectItem>
                            <SelectItem value="LOGIN">Login</SelectItem>
                            <SelectItem value="LOGOUT">Logout</SelectItem>
                            <SelectItem value="FAILED_LOGIN">Failed Login</SelectItem>
                            <SelectItem value="BULK_OPERATION">Bulk Operation</SelectItem>
                            <SelectItem value="SYSTEM_EVENT">System Event</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.resource} onValueChange={(value: string) => handleFilterChange('resource', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Resource" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Resources</SelectItem>
                            <SelectItem value="User">User</SelectItem>
                            <SelectItem value="Order">Order</SelectItem>
                            <SelectItem value="Medicine">Medicine</SelectItem>
                            <SelectItem value="Notification">Notification</SelectItem>
                            <SelectItem value="System">System</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.severity} onValueChange={(value: string) => handleFilterChange('severity', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Severities</SelectItem>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                    </Select>

                    <Input
                        placeholder="User ID"
                        value={filters.userId}
                        onChange={(e) => handleFilterChange('userId', e.target.value)}
                    />
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Resource</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>IP Address</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Loading audit logs...
                                    </TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                        No audit logs found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-sm">
                                            {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                                        </TableCell>
                                        <TableCell>
                                            {log.user ? (
                                                <div>
                                                    <div className="font-medium">{log.user.name || log.user.email}</div>
                                                    <div className="text-sm text-gray-500">{log.user.role}</div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">System</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={actionColors[log.action as keyof typeof actionColors] || 'bg-gray-100 text-gray-800'}>
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">{log.resource}</TableCell>
                                        <TableCell className="max-w-xs truncate" title={log.description}>
                                            {log.description}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={severityColors[log.severity]}>
                                                {log.severity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {log.ipAddress || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} logs
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                            >
                                Previous
                            </Button>
                            <span className="px-3 py-2 text-sm">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
