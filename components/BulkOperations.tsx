'use client'

import React, { useState, useEffect } from 'react'
import {
    CheckSquare, Square, Trash2, Edit, Check, X, AlertTriangle,
    Users, Package, ShoppingCart, Bell, Download, Upload, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { apiService } from '@/lib/api'
import { toast } from 'sonner'

interface BulkOperation {
    id: string
    type: 'orders' | 'users' | 'medicines' | 'notifications'
    action: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress: number
    totalItems: number
    processedItems: number
    errors: string[]
    createdAt: string
    completedAt?: string
}

interface BulkOperationConfig {
    type: 'orders' | 'users' | 'medicines' | 'notifications'
    label: string
    icon: React.ComponentType<{ className?: string }>
    actions: {
        key: string
        label: string
        description: string
        icon: React.ComponentType<{ className?: string }>
        color: string
    }[]
}

const bulkOperationConfigs: BulkOperationConfig[] = [
    {
        type: 'orders',
        label: 'Order Management',
        icon: ShoppingCart,
        actions: [
            {
                key: 'approve',
                label: 'Approve Orders',
                description: 'Approve selected orders for processing',
                icon: Check,
                color: 'text-green-600'
            },
            {
                key: 'reject',
                label: 'Reject Orders',
                description: 'Reject selected orders',
                icon: X,
                color: 'text-red-600'
            },
            {
                key: 'update_status',
                label: 'Update Status',
                description: 'Update status of selected orders',
                icon: Edit,
                color: 'text-blue-600'
            },
            {
                key: 'export',
                label: 'Export Orders',
                description: 'Export selected orders to CSV/Excel',
                icon: Download,
                color: 'text-purple-600'
            }
        ]
    },
    {
        type: 'users',
        label: 'User Management',
        icon: Users,
        actions: [
            {
                key: 'activate',
                label: 'Activate Users',
                description: 'Activate selected user accounts',
                icon: Check,
                color: 'text-green-600'
            },
            {
                key: 'suspend',
                label: 'Suspend Users',
                description: 'Suspend selected user accounts',
                icon: X,
                color: 'text-yellow-600'
            },
            {
                key: 'delete',
                label: 'Delete Users',
                description: 'Permanently delete selected users',
                icon: Trash2,
                color: 'text-red-600'
            },
            {
                key: 'export',
                label: 'Export Users',
                description: 'Export selected users to CSV/Excel',
                icon: Download,
                color: 'text-purple-600'
            }
        ]
    },
    {
        type: 'medicines',
        label: 'Medicine Management',
        icon: Package,
        actions: [
            {
                key: 'update_prices',
                label: 'Update Prices',
                description: 'Update prices for selected medicines',
                icon: Edit,
                color: 'text-blue-600'
            },
            {
                key: 'update_stock',
                label: 'Update Stock',
                description: 'Update stock levels for selected medicines',
                icon: RefreshCw,
                color: 'text-orange-600'
            },
            {
                key: 'delete',
                label: 'Delete Medicines',
                description: 'Remove selected medicines from inventory',
                icon: Trash2,
                color: 'text-red-600'
            },
            {
                key: 'export',
                label: 'Export Medicines',
                description: 'Export selected medicines to CSV/Excel',
                icon: Download,
                color: 'text-purple-600'
            }
        ]
    },
    {
        type: 'notifications',
        label: 'Notification Management',
        icon: Bell,
        actions: [
            {
                key: 'mark_read',
                label: 'Mark as Read',
                description: 'Mark selected notifications as read',
                icon: Check,
                color: 'text-green-600'
            },
            {
                key: 'delete',
                label: 'Delete Notifications',
                description: 'Delete selected notifications',
                icon: Trash2,
                color: 'text-red-600'
            },
            {
                key: 'send_bulk',
                label: 'Send Bulk Notification',
                description: 'Send notification to selected users',
                icon: Bell,
                color: 'text-blue-600'
            },
            {
                key: 'export',
                label: 'Export Notifications',
                description: 'Export selected notifications to CSV/Excel',
                icon: Download,
                color: 'text-purple-600'
            }
        ]
    }
]

export default function BulkOperations() {
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
    const [selectedOperation, setSelectedOperation] = useState<string | null>(null)
    const [isOperationDialogOpen, setIsOperationDialogOpen] = useState(false)
    const [operationProgress, setOperationProgress] = useState(0)
    const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([])
    const [isProcessing, setIsProcessing] = useState(false)

    // Mock data - replace with actual API calls
    const [mockData, setMockData] = useState({
        orders: Array.from({ length: 20 }, (_, i) => ({
            id: `order-${i + 1}`,
            status: ['pending', 'processing', 'completed', 'cancelled'][i % 4],
            customer: `Customer ${i + 1}`,
            total: Math.floor(Math.random() * 1000) + 100,
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        })),
        users: Array.from({ length: 15 }, (_, i) => ({
            id: `user-${i + 1}`,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            role: ['admin', 'provider', 'user'][i % 3],
            status: ['active', 'suspended', 'pending'][i % 3],
            lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        })),
        medicines: Array.from({ length: 25 }, (_, i) => ({
            id: `medicine-${i + 1}`,
            name: `Medicine ${i + 1}`,
            category: ['Pain Relief', 'Antibiotic', 'Diabetes', 'Cardiovascular'][i % 4],
            price: Math.floor(Math.random() * 500) + 50,
            stock: Math.floor(Math.random() * 100),
            status: ['active', 'inactive', 'low_stock'][i % 3]
        })),
        notifications: Array.from({ length: 30 }, (_, i) => ({
            id: `notification-${i + 1}`,
            title: `Notification ${i + 1}`,
            type: ['ORDER_UPDATE', 'USER_REGISTRATION', 'LOW_STOCK', 'SYSTEM_HEALTH'][i % 4],
            isRead: i % 3 === 0,
            createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        }))
    })

    const handleSelectAll = (type: string) => {
        const items = mockData[type as keyof typeof mockData] as any[]
        const allIds = items.map(item => item.id)

        if (selectedItems.size === allIds.length) {
            setSelectedItems(new Set())
        } else {
            setSelectedItems(new Set(allIds))
        }
    }

    const handleSelectItem = (id: string) => {
        const newSelected = new Set(selectedItems)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedItems(newSelected)
    }

    const handleBulkAction = async (action: string, type: string) => {
        if (selectedItems.size === 0) {
            toast.error('Please select items to perform bulk action')
            return
        }

        setSelectedOperation(`${type}-${action}`)
        setIsOperationDialogOpen(true)
    }

    const executeBulkOperation = async () => {
        if (!selectedOperation) return

        const [type, action] = selectedOperation.split('-')
        const operationId = `op-${Date.now()}`

        const newOperation: BulkOperation = {
            id: operationId,
            type: type as any,
            action,
            status: 'processing',
            progress: 0,
            totalItems: selectedItems.size,
            processedItems: 0,
            errors: [],
            createdAt: new Date().toISOString()
        }

        setBulkOperations(prev => [newOperation, ...prev])
        setIsProcessing(true)
        setIsOperationDialogOpen(false)

        // Simulate bulk operation processing
        for (let i = 0; i <= selectedItems.size; i++) {
            await new Promise(resolve => setTimeout(resolve, 100))

            setBulkOperations(prev =>
                prev.map(op =>
                    op.id === operationId
                        ? {
                            ...op,
                            progress: (i / selectedItems.size) * 100,
                            processedItems: i,
                            status: i === selectedItems.size ? 'completed' : 'processing'
                        }
                        : op
                )
            )
        }

        // Mark as completed
        setBulkOperations(prev =>
            prev.map(op =>
                op.id === operationId
                    ? {
                        ...op,
                        status: 'completed',
                        completedAt: new Date().toISOString()
                    }
                    : op
            )
        )

        setIsProcessing(false)
        setSelectedItems(new Set())
        toast.success(`Bulk ${action} completed successfully`)
    }

    const getCurrentData = () => {
        const type = selectedOperation?.split('-')[0]
        return type ? mockData[type as keyof typeof mockData] : []
    }

    const getCurrentConfig = () => {
        const type = selectedOperation?.split('-')[0]
        return bulkOperationConfigs.find(config => config.type === type)
    }

    const currentData = getCurrentData() as any[]
    const currentConfig = getCurrentConfig()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Bulk Operations</h2>
                <p className="text-gray-600">Perform batch operations on multiple items efficiently</p>
            </div>

            {/* Operation Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {bulkOperationConfigs.map((config) => {
                    const Icon = config.icon
                    return (
                        <Card key={config.type} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Icon className="h-5 w-5" />
                                    <span>{config.label}</span>
                                </CardTitle>
                                <CardDescription>
                                    {currentData.length} items available
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {config.actions.map((action) => {
                                        const ActionIcon = action.icon
                                        return (
                                            <Button
                                                key={action.key}
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-start"
                                                onClick={() => handleBulkAction(action.key, config.type)}
                                                disabled={currentData.length === 0}
                                            >
                                                <ActionIcon className={`h-4 w-4 mr-2 ${action.color}`} />
                                                {action.label}
                                            </Button>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Selected Items Preview */}
            {selectedItems.size > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Selected Items ({selectedItems.size})</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedItems(new Set())}
                            >
                                Clear Selection
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                            {Array.from(selectedItems).slice(0, 10).map((id) => {
                                const item = currentData.find(item => item.id === id)
                                return item ? (
                                    <div key={id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <span className="text-sm font-medium">{item.name || item.title || item.customer || `Item ${id}`}</span>
                                        <Badge variant="outline">{item.status || item.role || item.type || 'N/A'}</Badge>
                                    </div>
                                ) : null
                            })}
                            {selectedItems.size > 10 && (
                                <div className="text-sm text-gray-500 text-center py-2">
                                    ... and {selectedItems.size - 10} more items
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bulk Operations History */}
            {bulkOperations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Bulk Operations</CardTitle>
                        <CardDescription>Track the progress of your bulk operations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {bulkOperations.slice(0, 5).map((operation) => (
                                <div key={operation.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium capitalize">{operation.type} - {operation.action}</span>
                                            <Badge
                                                variant={
                                                    operation.status === 'completed' ? 'default' :
                                                        operation.status === 'processing' ? 'secondary' :
                                                            operation.status === 'failed' ? 'destructive' : 'outline'
                                                }
                                            >
                                                {operation.status}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {operation.processedItems} of {operation.totalItems} items processed
                                        </div>
                                        {operation.status === 'processing' && (
                                            <Progress value={operation.progress} className="mt-2" />
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(operation.createdAt).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bulk Operation Confirmation Dialog */}
            <Dialog open={isOperationDialogOpen} onOpenChange={setIsOperationDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            <span>Confirm Bulk Operation</span>
                        </DialogTitle>
                        <DialogDescription>
                            You are about to perform a bulk operation on {selectedItems.size} selected items.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-800">Operation Details</span>
                            </div>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p><strong>Type:</strong> {currentConfig?.label}</p>
                                <p><strong>Action:</strong> {currentConfig?.actions.find(a => a.key === selectedOperation?.split('-')[1])?.label}</p>
                                <p><strong>Items:</strong> {selectedItems.size} selected</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOperationDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={executeBulkOperation} disabled={isProcessing}>
                            {isProcessing ? 'Processing...' : 'Confirm & Execute'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
