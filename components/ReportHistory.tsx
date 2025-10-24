'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Search,
    Download,
    Play,
    Trash2,
    FileText,
    Calendar,
    User,
    Filter,
    RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface Report {
    id: string
    name: string
    description?: string
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
    format: 'JSON' | 'CSV' | 'EXCEL' | 'PDF'
    filePath?: string
    fileSize?: number
    createdAt: string
    completedAt?: string
    creator: {
        id: string
        name: string
        email: string
    }
}

interface ReportHistoryProps {
    reports: Report[]
    onGenerate: (reportId: string) => void
    onDownload: (reportId: string) => void
    onDelete: (reportId: string) => void
    onRefresh: () => void
}

const STATUS_COLORS = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'PROCESSING': 'bg-blue-100 text-blue-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'FAILED': 'bg-red-100 text-red-800',
    'CANCELLED': 'bg-gray-100 text-gray-800'
}

const FORMAT_ICONS = {
    'PDF': FileText,
    'EXCEL': FileText,
    'CSV': FileText,
    'JSON': FileText
}

const STATUS_OPTIONS = [
    'All',
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
]

const FORMAT_OPTIONS = [
    'All',
    'PDF',
    'EXCEL',
    'CSV',
    'JSON'
]

export default function ReportHistory({
    reports,
    onGenerate,
    onDownload,
    onDelete,
    onRefresh
}: ReportHistoryProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [formatFilter, setFormatFilter] = useState('All')
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    const filteredReports = reports
        .filter(report => {
            const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.description?.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesStatus = statusFilter === 'All' || report.status === statusFilter
            const matchesFormat = formatFilter === 'All' || report.format === formatFilter
            return matchesSearch && matchesStatus && matchesFormat
        })
        .sort((a, b) => {
            let aValue = a[sortBy as keyof Report]
            let bValue = b[sortBy as keyof Report]

            if (sortBy === 'createdAt' || sortBy === 'completedAt') {
                aValue = new Date(aValue as string).getTime()
                bValue = new Date(bValue as string).getTime()
            }

            // Handle undefined values
            if (aValue === undefined && bValue === undefined) return 0
            if (aValue === undefined) return sortOrder === 'asc' ? -1 : 1
            if (bValue === undefined) return sortOrder === 'asc' ? 1 : -1

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
            }
        })

    const handleGenerate = (reportId: string) => {
        onGenerate(reportId)
    }

    const handleDownload = (reportId: string) => {
        onDownload(reportId)
    }

    const handleDelete = (reportId: string) => {
        if (!confirm('Are you sure you want to delete this report?')) return
        onDelete(reportId)
    }

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return 'Unknown'
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return '✅'
            case 'PROCESSING': return '⏳'
            case 'FAILED': return '❌'
            case 'PENDING': return '⏸️'
            case 'CANCELLED': return '🚫'
            default: return '❓'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Report History</h2>
                    <p className="text-gray-600">View and manage your generated reports</p>
                </div>
                <Button onClick={onRefresh} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search reports..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                    >
                        {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    <select
                        value={formatFilter}
                        onChange={(e) => setFormatFilter(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                    >
                        {FORMAT_OPTIONS.map(format => (
                            <option key={format} value={format}>{format}</option>
                        ))}
                    </select>
                    <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                            const [field, order] = e.target.value.split('-')
                            setSortBy(field)
                            setSortOrder(order as 'asc' | 'desc')
                        }}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                        <option value="status-asc">Status A-Z</option>
                        <option value="status-desc">Status Z-A</option>
                    </select>
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {filteredReports.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                            <p className="text-gray-600">
                                {searchTerm || statusFilter !== 'All' || formatFilter !== 'All'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Generate your first report to get started'
                                }
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredReports.map(report => {
                        const FormatIcon = FORMAT_ICONS[report.format]

                        return (
                            <Card key={report.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <FormatIcon className="h-5 w-5 text-blue-600" />
                                                <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                                                <Badge className={STATUS_COLORS[report.status]}>
                                                    {getStatusIcon(report.status)} {report.status}
                                                </Badge>
                                            </div>

                                            {report.description && (
                                                <p className="text-gray-600 mb-3">{report.description}</p>
                                            )}

                                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <User className="h-4 w-4" />
                                                    <span>{report.creator.name}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                {report.completedAt && (
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>Completed: {new Date(report.completedAt).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                                {report.fileSize && (
                                                    <span>Size: {formatFileSize(report.fileSize)}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 ml-4">
                                            {report.status === 'COMPLETED' && report.filePath && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleDownload(report.id)}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <Download className="h-3 w-3 mr-1" />
                                                    Download
                                                </Button>
                                            )}

                                            {report.status === 'PENDING' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleGenerate(report.id)}
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    <Play className="h-3 w-3 mr-1" />
                                                    Generate
                                                </Button>
                                            )}

                                            {report.status === 'PROCESSING' && (
                                                <Button size="sm" disabled>
                                                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                                    Processing...
                                                </Button>
                                            )}

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDelete(report.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    )
}
