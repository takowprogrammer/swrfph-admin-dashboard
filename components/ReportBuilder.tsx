'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Plus,
    Trash2,
    BarChart3,
    Table,
    PieChart,
    LineChart,
    FileText,
    Settings,
    Save,
    Play,
    Download
} from 'lucide-react'
import { toast } from 'sonner'

interface ReportTemplate {
    id: string
    name: string
    description?: string
    category: string
    isPublic: boolean
    config: any
}

interface ReportBuilderProps {
    onCreateReport: (reportData: any) => void
    templates: ReportTemplate[]
}

interface ReportComponent {
    id: string
    type: 'chart' | 'table' | 'text'
    title: string
    config: any
    position: { x: number; y: number }
    size: { width: number; height: number }
}

const DATA_SOURCES = [
    { value: 'orders', label: 'Orders', description: 'Order data and analytics' },
    { value: 'users', label: 'Users', description: 'User information and activity' },
    { value: 'medicines', label: 'Medicines', description: 'Medicine inventory and sales' },
    { value: 'analytics', label: 'Analytics', description: 'Business analytics and metrics' },
    { value: 'auditLogs', label: 'Audit Logs', description: 'System audit and security logs' },
    { value: 'securityEvents', label: 'Security Events', description: 'Security events and alerts' }
]

const CHART_TYPES = [
    { value: 'line', label: 'Line Chart', icon: LineChart },
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'pie', label: 'Pie Chart', icon: PieChart }
]

const EXPORT_FORMATS = [
    { value: 'PDF', label: 'PDF Document' },
    { value: 'EXCEL', label: 'Excel Spreadsheet' },
    { value: 'CSV', label: 'CSV File' },
    { value: 'JSON', label: 'JSON Data' }
]

export default function ReportBuilder({ onCreateReport, templates }: ReportBuilderProps) {
    const [reportName, setReportName] = useState('')
    const [reportDescription, setReportDescription] = useState('')
    const [dataSource, setDataSource] = useState('orders')
    const [exportFormat, setExportFormat] = useState('PDF')
    const [components, setComponents] = useState<ReportComponent[]>([])
    const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    const canvasRef = useRef<HTMLDivElement>(null)

    const addComponent = (type: 'chart' | 'table' | 'text') => {
        const newComponent: ReportComponent = {
            id: `component-${Date.now()}`,
            type,
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Component`,
            config: {
                chartType: type === 'chart' ? 'line' : undefined,
                fields: [],
                filters: {},
                groupBy: [],
                aggregates: []
            },
            position: { x: 50, y: 50 + components.length * 200 },
            size: { width: 400, height: 300 }
        }
        setComponents([...components, newComponent])
        setSelectedComponent(newComponent.id)
    }

    const updateComponent = (id: string, updates: Partial<ReportComponent>) => {
        setComponents(components.map(comp =>
            comp.id === id ? { ...comp, ...updates } : comp
        ))
    }

    const deleteComponent = (id: string) => {
        setComponents(components.filter(comp => comp.id !== id))
        if (selectedComponent === id) {
            setSelectedComponent(null)
        }
    }

    const handleSave = () => {
        if (!reportName.trim()) {
            toast.error('Please enter a report name')
            return
        }

        if (components.length === 0) {
            toast.error('Please add at least one component to the report')
            return
        }

        const reportData = {
            name: reportName,
            description: reportDescription,
            config: {
                dataSource,
                components,
                filters: {},
                groupBy: [],
                aggregates: []
            },
            format: exportFormat
        }

        onCreateReport(reportData)

        // Reset form
        setReportName('')
        setReportDescription('')
        setComponents([])
        setSelectedComponent(null)
    }

    const handleGenerate = async () => {
        if (!reportName.trim()) {
            toast.error('Please enter a report name')
            return
        }

        setIsGenerating(true)
        try {
            const reportData = {
                name: reportName,
                description: reportDescription,
                config: {
                    dataSource,
                    components,
                    filters: {},
                    groupBy: [],
                    aggregates: []
                },
                format: exportFormat
            }

            await onCreateReport(reportData)
            toast.success('Report generated successfully!')
        } catch (error) {
            toast.error('Failed to generate report')
        } finally {
            setIsGenerating(false)
        }
    }

    const selectedComponentData = components.find(comp => comp.id === selectedComponent)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            {/* Left Sidebar - Components & Settings */}
            <div className="lg:col-span-1 space-y-4">
                {/* Report Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Report Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Report Name</label>
                            <Input
                                value={reportName}
                                onChange={(e) => setReportName(e.target.value)}
                                placeholder="Enter report name"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <Input
                                value={reportDescription}
                                onChange={(e) => setReportDescription(e.target.value)}
                                placeholder="Enter description"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Data Source</label>
                            <select
                                value={dataSource}
                                onChange={(e) => setDataSource(e.target.value)}
                                className="w-full mt-1 p-2 border rounded-md"
                            >
                                {DATA_SOURCES.map(source => (
                                    <option key={source.value} value={source.value}>
                                        {source.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Export Format</label>
                            <select
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value)}
                                className="w-full mt-1 p-2 border rounded-md"
                            >
                                {EXPORT_FORMATS.map(format => (
                                    <option key={format.value} value={format.value}>
                                        {format.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Component Library */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Components</CardTitle>
                        <CardDescription>Drag components to the canvas</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button
                            onClick={() => addComponent('chart')}
                            variant="outline"
                            className="w-full justify-start"
                        >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Chart
                        </Button>
                        <Button
                            onClick={() => addComponent('table')}
                            variant="outline"
                            className="w-full justify-start"
                        >
                            <Table className="h-4 w-4 mr-2" />
                            Table
                        </Button>
                        <Button
                            onClick={() => addComponent('text')}
                            variant="outline"
                            className="w-full justify-start"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Text Block
                        </Button>
                    </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button
                            onClick={handleSave}
                            className="w-full"
                            disabled={!reportName.trim() || components.length === 0}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save Report
                        </Button>
                        <Button
                            onClick={handleGenerate}
                            className="w-full"
                            disabled={!reportName.trim() || components.length === 0}
                        >
                            <Play className="h-4 w-4 mr-2" />
                            {isGenerating ? 'Generating...' : 'Generate Report'}
                        </Button>
                        <Button
                            onClick={() => setShowPreview(!showPreview)}
                            variant="outline"
                            className="w-full"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Center - Canvas */}
            <div className="lg:col-span-2">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="text-lg">Report Canvas</CardTitle>
                        <CardDescription>
                            {components.length} component{components.length !== 1 ? 's' : ''} in report
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-full p-0">
                        <div
                            ref={canvasRef}
                            className="h-full min-h-[500px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 relative overflow-auto"
                        >
                            {components.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="text-center">
                                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                        <p className="text-lg font-medium">No components yet</p>
                                        <p className="text-sm">Add components from the sidebar to start building your report</p>
                                    </div>
                                </div>
                            ) : (
                                components.map(component => (
                                    <div
                                        key={component.id}
                                        className={`absolute border-2 rounded-lg p-4 bg-white shadow-sm cursor-pointer ${selectedComponent === component.id
                                                ? 'border-blue-500'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        style={{
                                            left: component.position.x,
                                            top: component.position.y,
                                            width: component.size.width,
                                            height: component.size.height
                                        }}
                                        onClick={() => setSelectedComponent(component.id)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium text-sm">{component.title}</h3>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    deleteComponent(component.id)
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {component.type === 'chart' && `Chart: ${component.config.chartType || 'line'}`}
                                            {component.type === 'table' && 'Data Table'}
                                            {component.type === 'text' && 'Text Block'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Sidebar - Component Properties */}
            <div className="lg:col-span-1">
                {selectedComponentData ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Component Properties</CardTitle>
                            <CardDescription>Configure the selected component</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={selectedComponentData.title}
                                    onChange={(e) => updateComponent(selectedComponentData.id, { title: e.target.value })}
                                    className="mt-1"
                                />
                            </div>

                            {selectedComponentData.type === 'chart' && (
                                <div>
                                    <label className="text-sm font-medium">Chart Type</label>
                                    <select
                                        value={selectedComponentData.config.chartType || 'line'}
                                        onChange={(e) => updateComponent(selectedComponentData.id, {
                                            config: { ...selectedComponentData.config, chartType: e.target.value }
                                        })}
                                        className="w-full mt-1 p-2 border rounded-md"
                                    >
                                        {CHART_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium">Size</label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <Input
                                        type="number"
                                        placeholder="Width"
                                        value={selectedComponentData.size.width}
                                        onChange={(e) => updateComponent(selectedComponentData.id, {
                                            size: { ...selectedComponentData.size, width: parseInt(e.target.value) || 400 }
                                        })}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Height"
                                        value={selectedComponentData.size.height}
                                        onChange={(e) => updateComponent(selectedComponentData.id, {
                                            size: { ...selectedComponentData.size, height: parseInt(e.target.value) || 300 }
                                        })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="flex items-center justify-center h-32 text-gray-500">
                            <div className="text-center">
                                <Settings className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">Select a component to configure</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}


