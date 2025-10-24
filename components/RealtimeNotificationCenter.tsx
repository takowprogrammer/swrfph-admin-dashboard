'use client'

import React, { useState, useEffect } from 'react'
import { Bell, X, Check, Trash2, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useNotifications, Notification } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'

interface RealtimeNotificationCenterProps {
    className?: string
}

const severityConfig = {
    low: {
        icon: Info,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
    },
    medium: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
    },
    high: {
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
    },
    critical: {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
    }
}

const typeConfig = {
    ORDER_UPDATE: {
        label: 'Order Update',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
    },
    USER_REGISTRATION: {
        label: 'New User',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
    },
    LOW_STOCK: {
        label: 'Low Stock',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
    },
    SYSTEM_HEALTH: {
        label: 'System Health',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
    },
    BULK_ACTION: {
        label: 'Bulk Action',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100'
    },
    GENERAL: {
        label: 'General',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
    }
}

export default function RealtimeNotificationCenter({ className }: RealtimeNotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
    const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all')

    const {
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        getUnreadNotifications,
        getNotificationsBySeverity
    } = useNotifications()

    const filteredNotifications = () => {
        switch (filter) {
            case 'unread':
                return getUnreadNotifications()
            case 'critical':
                return getNotificationsBySeverity('critical')
            default:
                return notifications
        }
    }

    const handleNotificationClick = (notification: Notification) => {
        setSelectedNotification(notification)
        if (!notification.isRead) {
            markAsRead(notification.id)
        }
    }

    const handleMarkAllAsRead = () => {
        markAllAsRead()
    }

    const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        deleteNotification(id)
    }

    const formatTimeAgo = (dateString: string) => {
        const now = new Date()
        const date = new Date(dateString)
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return 'Just now'
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
        return `${Math.floor(diffInSeconds / 86400)}d ago`
    }

    return (
        <div className={cn('relative', className)}>
            {/* Notification Bell */}
            <Button
                variant="ghost"
                size="sm"
                className="relative p-2"
                onClick={() => setIsOpen(true)}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
                {isConnected && (
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
            </Button>

            {/* Notification Center Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Bell className="h-5 w-5" />
                                <span>Notifications</span>
                                {isConnected && (
                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                        Live
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                {unreadCount > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs"
                                    >
                                        <Check className="h-3 w-3 mr-1" />
                                        Mark All Read
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {/* Filter Tabs */}
                    <div className="flex space-x-1 border-b">
                        {[
                            { key: 'all', label: 'All', count: notifications.length },
                            { key: 'unread', label: 'Unread', count: getUnreadNotifications().length },
                            { key: 'critical', label: 'Critical', count: getNotificationsBySeverity('critical').length }
                        ].map(({ key, label, count }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key as any)}
                                className={cn(
                                    'px-3 py-2 text-sm font-medium border-b-2 transition-colors',
                                    filter === key
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                )}
                            >
                                {label} ({count})
                            </button>
                        ))}
                    </div>

                    {/* Notifications List */}
                    <div className="flex-1 overflow-y-auto space-y-2 py-4">
                        {filteredNotifications().length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>No notifications found</p>
                            </div>
                        ) : (
                            filteredNotifications().map((notification) => {
                                const severity = severityConfig[notification.severity]
                                const type = typeConfig[notification.type]
                                const SeverityIcon = severity.icon

                                return (
                                    <Card
                                        key={notification.id}
                                        className={cn(
                                            'p-4 cursor-pointer transition-all hover:shadow-md',
                                            !notification.isRead && 'ring-2 ring-blue-200 bg-blue-50/50',
                                            severity.borderColor
                                        )}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className={cn(
                                                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                                                severity.bgColor
                                            )}>
                                                <SeverityIcon className={cn('h-4 w-4', severity.color)} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                                            {notification.title}
                                                        </h4>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn('text-xs', type.color, type.bgColor)}
                                                        >
                                                            {type.label}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-xs text-gray-500">
                                                            {formatTimeAgo(notification.createdAt)}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                                                            onClick={(e) => handleDeleteNotification(notification.id, e)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                                    {notification.message}
                                                </p>

                                                {notification.metadata && (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {notification.metadata.orderId && (
                                                            <Badge variant="outline" className="text-xs">
                                                                Order: {notification.metadata.orderId.substring(0, 8)}...
                                                            </Badge>
                                                        )}
                                                        {notification.metadata.userId && (
                                                            <Badge variant="outline" className="text-xs">
                                                                User: {notification.metadata.userId.substring(0, 8)}...
                                                            </Badge>
                                                        )}
                                                        {notification.metadata.action && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {notification.metadata.action}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Notification Detail Modal */}
            {selectedNotification && (
                <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                                <div className={cn(
                                    'w-6 h-6 rounded-full flex items-center justify-center',
                                    severityConfig[selectedNotification.severity].bgColor
                                )}>
                                    {React.createElement(severityConfig[selectedNotification.severity].icon, {
                                        className: cn('h-4 w-4', severityConfig[selectedNotification.severity].color)
                                    })}
                                </div>
                                <span>{selectedNotification.title}</span>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        'text-xs',
                                        typeConfig[selectedNotification.type].color,
                                        typeConfig[selectedNotification.type].bgColor
                                    )}
                                >
                                    {typeConfig[selectedNotification.type].label}
                                </Badge>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                {selectedNotification.message}
                            </p>

                            {selectedNotification.details && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Details</h4>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {selectedNotification.details}
                                    </p>
                                </div>
                            )}

                            {selectedNotification.metadata && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-900">Metadata</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        {Object.entries(selectedNotification.metadata).map(([key, value]) => (
                                            <div key={key} className="flex justify-between">
                                                <span className="text-gray-500 capitalize">{key}:</span>
                                                <span className="text-gray-900 font-mono text-xs">
                                                    {typeof value === 'string' && value.length > 20
                                                        ? `${value.substring(0, 20)}...`
                                                        : String(value)
                                                    }
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>Created: {new Date(selectedNotification.createdAt).toLocaleString()}</span>
                                <span>Severity: {selectedNotification.severity}</span>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
