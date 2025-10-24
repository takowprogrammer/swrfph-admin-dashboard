'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Plus,
    Download,
    Save,
    Play,
    Trash2,
    BarChart3,
    Table,
    PieChart,
    LineChart,
    FileText,
    Calendar,
    Settings,
    Eye,
    Edit
} from 'lucide-react'
import { apiService } from '@/lib/api'
import { toast } from 'sonner'
import ReportBuilder from '@/components/ReportBuilder'
import ReportTemplates from '@/components/ReportTemplates'
import ReportHistory from '@/components/ReportHistory'

interface ReportTemplate {
    id: string
    name: string
    description?: string
    category: string
    isPublic: boolean
    config: any
    createdAt: string
    creator: {
        id: string
        name: string
        email: string
    }
}

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

export default function ReportBuilderPage() {
    const [activeTab, setActiveTab] = useState('builder')
    const [templates, setTemplates] = useState<ReportTemplate[]>([])
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [templatesData, reportsData] = await Promise.all([
                apiService.getReportTemplates({ limit: 50 }),
                apiService.getReports({ limit: 50 })
            ])

            setTemplates((templatesData as any).data || [])
            setReports((reportsData as any).data || [])
        } catch (error) {
            console.error('Failed to fetch data:', error)
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateReport = async (reportData: any) => {
        try {
            await apiService.createReport(reportData)
            toast.success('Report created successfully')
            fetchData()
        } catch (error) {
            console.error('Failed to create report:', error)
            toast.error('Failed to create report')
        }
    }

    const handleGenerateReport = async (reportId: string) => {
        try {
            await apiService.generateReport(reportId)
            toast.success('Report generation started')
            fetchData()
        } catch (error) {
            console.error('Failed to generate report:', error)
            toast.error('Failed to generate report')
        }
    }

    const handleDownloadReport = async (reportId: string) => {
        try {
            const response = await apiService.downloadReport(reportId)
            // Handle file download
            toast.success('Report downloaded')
        } catch (error) {
            console.error('Failed to download report:', error)
            toast.error('Failed to download report')
        }
    }

    const handleDeleteReport = async (reportId: string) => {
        try {
            await apiService.deleteReport(reportId)
            toast.success('Report deleted successfully')
            fetchData()
        } catch (error) {
            console.error('Failed to delete report:', error)
            toast.error('Failed to delete report')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-800'
            case 'PROCESSING': return 'bg-blue-100 text-blue-800'
            case 'FAILED': return 'bg-red-100 text-red-800'
            case 'PENDING': return 'bg-yellow-100 text-yellow-800'
            case 'CANCELLED': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getFormatIcon = (format: string) => {
        switch (format) {
            case 'PDF': return <FileText className="h-4 w-4" />
            case 'EXCEL': return <Table className="h-4 w-4" />
            case 'CSV': return <Table className="h-4 w-4" />
            case 'JSON': return <FileText className="h-4 w-4" />
            default: return <FileText className="h-4 w-4" />
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Report Builder</h1>
                    <p className="text-gray-600">Create, manage, and export custom reports</p>
                </div>
                <div className="flex space-x-2">
                    <Button onClick={() => setActiveTab('builder')} variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        New Report
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="builder" className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Report Builder</span>
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Templates</span>
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Report History</span>
                    </TabsTrigger>
                </TabsList>

                {/* Report Builder Tab */}
                <TabsContent value="builder">
                    <ReportBuilder
                        onCreateReport={handleCreateReport}
                        templates={templates}
                    />
                </TabsContent>

                {/* Templates Tab */}
                <TabsContent value="templates">
                    <ReportTemplates
                        templates={templates}
                        onRefresh={fetchData}
                    />
                </TabsContent>

                {/* Report History Tab */}
                <TabsContent value="history">
                    <ReportHistory
                        reports={reports}
                        onGenerate={handleGenerateReport}
                        onDownload={handleDownloadReport}
                        onDelete={handleDeleteReport}
                        onRefresh={fetchData}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
