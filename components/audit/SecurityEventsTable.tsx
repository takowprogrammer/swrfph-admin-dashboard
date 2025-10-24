'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertTriangle, Search, Shield, CheckCircle, Download, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

interface SecurityEvent {
    id: string
    timestamp: string
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

interface SecurityEventsResponse {
    data: SecurityEvent[]
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

const eventTypeColors = {
    UNAUTHORIZED_ACCESS: 'bg-red-100 text-red-800',
    FORBIDDEN_ACCESS: 'bg-red-100 text-red-800',
    FAILED_LOGIN_ATTEMPT: 'bg-orange-100 text-orange-800',
    SUSPICIOUS_LOGIN: 'bg-yellow-100 text-yellow-800',
    MULTIPLE_FAILED_ATTEMPTS: 'bg-red-100 text-red-800',
    DATA_BREACH_ATTEMPT: 'bg-red-100 text-red-800',
    SYSTEM_INTRUSION: 'bg-red-100 text-red-800'
}

export function SecurityEventsTable() {
    const [events, setEvents] = useState<SecurityEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    })
    const [filters, setFilters] = useState({
        search: '',
        eventType: '',
        severity: '',
        resolved: '',
        userId: ''
    })

    const fetchEvents = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(filters.search && { search: filters.search }),
                ...(filters.eventType && { eventType: filters.eventType }),
                ...(filters.severity && { severity: filters.severity }),
                ...(filters.resolved && { resolved: filters.resolved }),
                ...(filters.userId && { userId: filters.userId })
            })

            const response = await fetch(`http://localhost:5000/audit/security-events?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            })

            if (response.ok) {
                const data: SecurityEventsResponse = await response.json()
                setEvents(data.data)
                setPagination(data.pagination)
            } else {
                console.error('Failed to fetch security events')
            }
        } catch (error) {
            console.error('Error fetching security events:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [pagination.page, filters])

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }))
    }

    const resolveEvent = async (eventId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/audit/security-events/${eventId}/resolve`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            })

            if (response.ok) {
                await fetchEvents() // Refresh the list
            } else {
                console.error('Failed to resolve security event')
            }
        } catch (error) {
            console.error('Error resolving security event:', error)
        }
    }

    const exportEvents = () => {
        const dataStr = JSON.stringify(events, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `security-events-${format(new Date(), 'yyyy-MM-dd')}.json`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security Events
                        </CardTitle>
                        <CardDescription>
                            Security incidents and suspicious activities
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={exportEvents}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm" onClick={fetchEvents}>
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
                            placeholder="Search events..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select value={filters.eventType} onValueChange={(value: string) => handleFilterChange('eventType', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Event Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Types</SelectItem>
                            <SelectItem value="UNAUTHORIZED_ACCESS">Unauthorized Access</SelectItem>
                            <SelectItem value="FORBIDDEN_ACCESS">Forbidden Access</SelectItem>
                            <SelectItem value="FAILED_LOGIN_ATTEMPT">Failed Login</SelectItem>
                            <SelectItem value="SUSPICIOUS_LOGIN">Suspicious Login</SelectItem>
                            <SelectItem value="MULTIPLE_FAILED_ATTEMPTS">Multiple Failed Attempts</SelectItem>
                            <SelectItem value="DATA_BREACH_ATTEMPT">Data Breach Attempt</SelectItem>
                            <SelectItem value="SYSTEM_INTRUSION">System Intrusion</SelectItem>
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

                    <Select value={filters.resolved} onValueChange={(value: string) => handleFilterChange('resolved', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Status</SelectItem>
                            <SelectItem value="false">Unresolved</SelectItem>
                            <SelectItem value="true">Resolved</SelectItem>
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
                                <TableHead>Event Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Loading security events...
                                    </TableCell>
                                </TableRow>
                            ) : events.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                        No security events found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                events.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell className="text-sm">
                                            {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={eventTypeColors[event.eventType as keyof typeof eventTypeColors] || 'bg-gray-100 text-gray-800'}>
                                                {event.eventType.replace(/_/g, ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate" title={event.description}>
                                            {event.description}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={severityColors[event.severity]}>
                                                {event.severity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {event.resolved ? (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                    <span className="text-sm text-green-600">Resolved</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                                    <span className="text-sm text-orange-600">Unresolved</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {event.ipAddress || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {!event.resolved && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => resolveEvent(event.id)}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Resolve
                                                </Button>
                                            )}
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
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} events
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
