'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Search,
    Plus,
    FileText,
    BarChart3,
    Table,
    PieChart,
    Eye,
    Copy,
    Trash2,
    Filter
} from 'lucide-react'
import { toast } from 'sonner'

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

interface ReportTemplatesProps {
    templates: ReportTemplate[]
    onRefresh: () => void
}

const TEMPLATE_CATEGORIES = [
    'Sales',
    'Inventory',
    'Users',
    'Financial',
    'Analytics',
    'Security',
    'Custom'
]

const TEMPLATE_ICONS = {
    'Sales': BarChart3,
    'Inventory': Table,
    'Users': FileText,
    'Financial': PieChart,
    'Analytics': BarChart3,
    'Security': FileText,
    'Custom': FileText
}

export default function ReportTemplates({ templates, onRefresh }: ReportTemplatesProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        description: '',
        category: 'Custom',
        isPublic: false
    })

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const handleCreateTemplate = async () => {
        if (!newTemplate.name.trim()) {
            toast.error('Please enter a template name')
            return
        }

        try {
            // This would call the API to create a template
            toast.success('Template created successfully')
            setShowCreateForm(false)
            setNewTemplate({ name: '', description: '', category: 'Custom', isPublic: false })
            onRefresh()
        } catch (error) {
            toast.error('Failed to create template')
        }
    }

    const handleUseTemplate = (template: ReportTemplate) => {
        // This would navigate to the report builder with the template pre-loaded
        toast.success(`Using template: ${template.name}`)
    }

    const handleCopyTemplate = (template: ReportTemplate) => {
        // This would create a copy of the template
        toast.success(`Template copied: ${template.name}`)
    }

    const handleDeleteTemplate = async (templateId: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return

        try {
            // This would call the API to delete the template
            toast.success('Template deleted successfully')
            onRefresh()
        } catch (error) {
            toast.error('Failed to delete template')
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Report Templates</h2>
                    <p className="text-gray-600">Pre-built templates for common reports</p>
                </div>
                <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value="All">All Categories</option>
                        {TEMPLATE_CATEGORIES.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Create Template Form */}
            {showCreateForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Template</CardTitle>
                        <CardDescription>Create a reusable report template</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Template Name</label>
                                <Input
                                    value={newTemplate.name}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                    placeholder="Enter template name"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Category</label>
                                <select
                                    value={newTemplate.category}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                                    className="w-full mt-1 p-2 border rounded-md"
                                >
                                    {TEMPLATE_CATEGORIES.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <Input
                                value={newTemplate.description}
                                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                                placeholder="Enter template description"
                                className="mt-1"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isPublic"
                                checked={newTemplate.isPublic}
                                onChange={(e) => setNewTemplate({ ...newTemplate, isPublic: e.target.checked })}
                                className="rounded"
                            />
                            <label htmlFor="isPublic" className="text-sm font-medium">
                                Make this template public
                            </label>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateTemplate}>
                                Create Template
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm || selectedCategory !== 'All'
                                ? 'Try adjusting your search or filter criteria'
                                : 'Create your first template to get started'
                            }
                        </p>
                        {!searchTerm && selectedCategory === 'All' && (
                            <Button onClick={() => setShowCreateForm(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Template
                            </Button>
                        )}
                    </div>
                ) : (
                    filteredTemplates.map(template => {
                        const IconComponent = TEMPLATE_ICONS[template.category as keyof typeof TEMPLATE_ICONS] || FileText

                        return (
                            <Card key={template.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-2">
                                            <IconComponent className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <CardTitle className="text-lg">{template.name}</CardTitle>
                                                <CardDescription>{template.category}</CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {template.isPublic && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Public
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {template.description || 'No description provided'}
                                    </p>

                                    <div className="text-xs text-gray-500 mb-4">
                                        <p>Created by: {template.creator.name}</p>
                                        <p>Created: {new Date(template.createdAt).toLocaleDateString()}</p>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleUseTemplate(template)}
                                            className="flex-1"
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            Use
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleCopyTemplate(template)}
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDeleteTemplate(template.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
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


