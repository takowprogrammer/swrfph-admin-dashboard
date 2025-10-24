'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
    Search,
    CheckCircle,
    AlertTriangle,
    Info,
    Package,
    DollarSign,
    Calendar,
    Trash2,
    Eye,
    Bell
} from 'lucide-react'
import { apiService } from '@/lib/api'
import { toast } from 'sonner'

interface Notification {
    id: string;
    event: string;
    details: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

const notificationTypes = {
    ORDER: {
        icon: Package,
        color: 'bg-blue-100 text-blue-800',
        iconColor: 'text-blue-600'
    },
    INVENTORY: {
        icon: AlertTriangle,
        color: 'bg-yellow-100 text-yellow-800',
        iconColor: 'text-yellow-600'
    },
    SYSTEM: {
        icon: Info,
        color: 'bg-gray-100 text-gray-800',
        iconColor: 'text-gray-600'
    },
    SHIPMENT: {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800',
        iconColor: 'text-green-600'
    },
    PRICE_CHANGE: {
        icon: DollarSign,
        color: 'bg-purple-100 text-purple-800',
        iconColor: 'text-purple-600'
    },
    STOCK_ALERT: {
        icon: AlertTriangle,
        color: 'bg-red-100 text-red-800',
        iconColor: 'text-red-600'
    },
    PROMOTION: {
        icon: Bell,
        color: 'bg-indigo-100 text-indigo-800',
        iconColor: 'text-indigo-600'
    }
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, [searchTerm, typeFilter, statusFilter]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await apiService.getNotifications({
                search: searchTerm || undefined,
                type: typeFilter || undefined,
                page: 1,
                limit: 50,
            }) as any;
            setNotifications(data.data || data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        setSelectedNotification(notification);
        setIsModalOpen(true);

        // Mark as read if unread
        if (!notification.isRead) {
            handleMarkAsRead(notification.id);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await apiService.markNotificationAsRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
            toast.success('Notification marked as read');
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            toast.error('Failed to mark notification as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await apiService.markAllNotificationsAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            toast.error('Failed to mark all notifications as read');
        }
    };

    const handleDeleteNotification = async (id: string) => {
        if (!confirm('Are you sure you want to delete this notification?')) return;

        try {
            await apiService.deleteNotification(id);
            setNotifications(notifications.filter(n => n.id !== id));
            toast.success('Notification deleted');
        } catch (error) {
            console.error('Failed to delete notification:', error);
            toast.error('Failed to delete notification');
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    const filteredNotifications = notifications.filter(notification => {
        const matchesSearch = notification.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.details.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !typeFilter || notification.type === typeFilter;
        const matchesStatus = !statusFilter ||
            (statusFilter === 'read' && notification.isRead) ||
            (statusFilter === 'unread' && !notification.isRead);
        return matchesSearch && matchesType && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading notifications...</div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-gray-600 mt-2">Manage and view all system notifications</p>
                    </div>
                    <Button onClick={handleMarkAllAsRead} className="bg-green-600 hover:bg-green-700 text-white">
                        Mark All as Read
                    </Button>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="ORDER">Order</option>
                            <option value="INVENTORY">Inventory</option>
                            <option value="SYSTEM">System</option>
                            <option value="SHIPMENT">Shipment</option>
                            <option value="PRICE_CHANGE">Price Change</option>
                            <option value="STOCK_ALERT">Stock Alert</option>
                            <option value="PROMOTION">Promotion</option>
                        </select>
                        <select
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="unread">Unread</option>
                            <option value="read">Read</option>
                        </select>
                    </div>
                </div>

                {/* Notifications Grid */}
                <div className="space-y-3">
                    {filteredNotifications.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                                <p className="text-gray-500">
                                    {searchTerm || typeFilter || statusFilter
                                        ? 'Try adjusting your filters to see more notifications.'
                                        : 'You\'re all caught up! No notifications at the moment.'
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredNotifications.map((notification) => {
                            const typeConfig = notificationTypes[notification.type as keyof typeof notificationTypes] || notificationTypes.SYSTEM;
                            const IconComponent = typeConfig.icon;

                            return (
                                <Card
                                    key={notification.id}
                                    className={`transition-all duration-200 hover:shadow-md cursor-pointer ${!notification.isRead ? 'border-l-4 border-l-green-500 bg-green-50/30' : ''
                                        }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start space-x-3">
                                            <div className={`p-1.5 rounded-full ${typeConfig.color}`}>
                                                <IconComponent className={`h-4 w-4 ${typeConfig.iconColor}`} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <h3 className={`text-sm font-semibold line-clamp-1 ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                                                }`}>
                                                                {notification.event}
                                                            </h3>
                                                            {!notification.isRead && (
                                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                                            {notification.details}
                                                        </p>
                                                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                                                            <div className="flex items-center space-x-1">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>{formatTimeAgo(notification.createdAt)}</span>
                                                            </div>
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-xs px-1.5 py-0.5 ${typeConfig.color}`}
                                                            >
                                                                {notification.type.replace('_', ' ')}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-1 ml-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleNotificationClick(notification);
                                                            }}
                                                            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 h-6 w-6"
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                        </Button>
                                                        {!notification.isRead && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleMarkAsRead(notification.id);
                                                                }}
                                                                className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1 h-6 w-6"
                                                            >
                                                                <CheckCircle className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteNotification(notification.id);
                                                            }}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Notification Details Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            {selectedNotification && (
                                <>
                                    <div className={`p-2 rounded-full ${notificationTypes[selectedNotification.type as keyof typeof notificationTypes]?.color || notificationTypes.SYSTEM.color}`}>
                                        {(() => {
                                            const IconComponent = notificationTypes[selectedNotification.type as keyof typeof notificationTypes]?.icon || notificationTypes.SYSTEM.icon;
                                            return <IconComponent className={`h-5 w-5 ${notificationTypes[selectedNotification.type as keyof typeof notificationTypes]?.iconColor || notificationTypes.SYSTEM.iconColor}`} />;
                                        })()}
                                    </div>
                                    <span>{selectedNotification.event}</span>
                                    {!selectedNotification.isRead && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                                            New
                                        </Badge>
                                    )}
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedNotification && (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(selectedNotification.createdAt).toLocaleString()}</span>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`${notificationTypes[selectedNotification.type as keyof typeof notificationTypes]?.color || notificationTypes.SYSTEM.color}`}
                                        >
                                            {selectedNotification.type.replace('_', ' ')}
                                        </Badge>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedNotification.details}</p>
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            Close
                                        </Button>
                                        {!selectedNotification.isRead && (
                                            <Button
                                                onClick={() => {
                                                    handleMarkAsRead(selectedNotification.id);
                                                    setIsModalOpen(false);
                                                }}
                                            >
                                                Mark as Read
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
}

