'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWebSocket } from './useWebSocket'
import { apiService } from '@/lib/api'
import { toast } from 'sonner'

export interface Notification {
    id: string
    type: 'ORDER_UPDATE' | 'USER_REGISTRATION' | 'LOW_STOCK' | 'SYSTEM_HEALTH' | 'BULK_ACTION' | 'GENERAL'
    title: string
    message: string
    details?: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    isRead: boolean
    createdAt: string
    metadata?: {
        orderId?: string
        userId?: string
        medicineId?: string
        action?: string
        [key: string]: any
    }
}

interface NotificationStats {
    total: number
    unread: number
    byType: {
        ORDER_UPDATE: number
        USER_REGISTRATION: number
        LOW_STOCK: number
        SYSTEM_HEALTH: number
        BULK_ACTION: number
        GENERAL: number
    }
    bySeverity: {
        low: number
        medium: number
        high: number
        critical: number
    }
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [stats, setStats] = useState<NotificationStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)

    // WebSocket connection for real-time updates (disabled for now)
    const { isConnected, sendMessage } = useWebSocket({
        url: 'ws://localhost:5000/ws/notifications',
        onMessage: (message) => {
            handleRealtimeNotification(message)
        },
        onError: (error) => {
            // WebSocket errors are handled gracefully in useWebSocket
        },
        onOpen: () => {
            console.log('Connected to notifications WebSocket')
        },
        onClose: () => {
            console.log('Disconnected from notifications WebSocket')
        }
    })

    const handleRealtimeNotification = useCallback((message: any) => {
        if (message.type === 'notification') {
            const newNotification: Notification = {
                id: message.data.id,
                type: message.data.type,
                title: message.data.title,
                message: message.data.message,
                details: message.data.details,
                severity: message.data.severity || 'medium',
                isRead: false,
                createdAt: message.data.createdAt || new Date().toISOString(),
                metadata: message.data.metadata
            }

            setNotifications(prev => [newNotification, ...prev])
            setUnreadCount(prev => prev + 1)

            // Show toast notification
            const showToast = (severity: string) => {
                switch (severity) {
                    case 'low':
                        toast.info(newNotification.title, {
                            description: newNotification.message,
                            duration: 5000
                        })
                        break
                    case 'medium':
                        toast(newNotification.title, {
                            description: newNotification.message,
                            duration: 5000
                        })
                        break
                    case 'high':
                        toast.warning(newNotification.title, {
                            description: newNotification.message,
                            duration: 7000
                        })
                        break
                    case 'critical':
                        toast.error(newNotification.title, {
                            description: newNotification.message,
                            duration: 10000
                        })
                        break
                    default:
                        toast(newNotification.title, {
                            description: newNotification.message,
                            duration: 5000
                        })
                }
            }

            showToast(newNotification.severity)
        }
    }, [])

    const fetchNotifications = useCallback(async (params?: {
        page?: number
        limit?: number
        type?: string
        severity?: string
        isRead?: boolean
    }) => {
        try {
            setLoading(true)

            // Mock data for demonstration - replace with actual API call when backend is ready
            const mockNotifications: Notification[] = [
                {
                    id: '1',
                    type: 'ORDER_UPDATE',
                    title: 'New Order Received',
                    message: 'Order #ORD-001 has been placed by John Doe',
                    details: 'Order contains 3 items: Paracetamol, Amoxicillin, Ibuprofen',
                    severity: 'medium',
                    isRead: false,
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    metadata: {
                        orderId: 'ORD-001',
                        userId: 'user-123',
                        action: 'order_placed'
                    }
                },
                {
                    id: '2',
                    type: 'LOW_STOCK',
                    title: 'Low Stock Alert',
                    message: 'Paracetamol 500mg is running low (5 units remaining)',
                    details: 'Please restock this medicine to avoid stockout',
                    severity: 'high',
                    isRead: false,
                    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                    metadata: {
                        medicineId: 'med-001',
                        currentStock: 5,
                        threshold: 10
                    }
                },
                {
                    id: '3',
                    type: 'USER_REGISTRATION',
                    title: 'New User Registered',
                    message: 'Provider account created for Central Pharmacy',
                    details: 'New provider has completed registration and is pending approval',
                    severity: 'low',
                    isRead: true,
                    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                    metadata: {
                        userId: 'user-456',
                        userType: 'provider',
                        status: 'pending'
                    }
                }
            ]

            setNotifications(mockNotifications)
            setUnreadCount(mockNotifications.filter(n => !n.isRead).length)
            setStats({
                total: mockNotifications.length,
                unread: mockNotifications.filter(n => !n.isRead).length,
                byType: {
                    ORDER_UPDATE: mockNotifications.filter(n => n.type === 'ORDER_UPDATE').length,
                    USER_REGISTRATION: mockNotifications.filter(n => n.type === 'USER_REGISTRATION').length,
                    LOW_STOCK: mockNotifications.filter(n => n.type === 'LOW_STOCK').length,
                    SYSTEM_HEALTH: mockNotifications.filter(n => n.type === 'SYSTEM_HEALTH').length,
                    BULK_ACTION: mockNotifications.filter(n => n.type === 'BULK_ACTION').length,
                    GENERAL: mockNotifications.filter(n => n.type === 'GENERAL').length
                },
                bySeverity: {
                    low: mockNotifications.filter(n => n.severity === 'low').length,
                    medium: mockNotifications.filter(n => n.severity === 'medium').length,
                    high: mockNotifications.filter(n => n.severity === 'high').length,
                    critical: mockNotifications.filter(n => n.severity === 'critical').length
                }
            })
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
            // Don't show error toast for mock data
            // toast.error('Failed to load notifications')
        } finally {
            setLoading(false)
        }
    }, [])

    const markAsRead = useCallback(async (id: string) => {
        try {
            // Mock API call - replace with actual API call when backend is ready
            // await apiService.markNotificationAsRead(id)
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === id
                        ? { ...notification, isRead: true }
                        : notification
                )
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
            toast.success('Notification marked as read')
        } catch (error) {
            console.error('Failed to mark notification as read:', error)
            toast.error('Failed to mark notification as read')
        }
    }, [])

    const markAllAsRead = useCallback(async () => {
        try {
            // Mock API call - replace with actual API call when backend is ready
            // await apiService.markAllNotificationsAsRead()
            setNotifications(prev =>
                prev.map(notification => ({ ...notification, isRead: true }))
            )
            setUnreadCount(0)
            toast.success('All notifications marked as read')
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error)
            toast.error('Failed to mark all notifications as read')
        }
    }, [])

    const deleteNotification = useCallback(async (id: string) => {
        try {
            // Mock API call - replace with actual API call when backend is ready
            // await apiService.deleteNotification(id)
            setNotifications(prev => prev.filter(notification => notification.id !== id))
            setUnreadCount(prev => {
                const notification = notifications.find(n => n.id === id)
                return notification && !notification.isRead ? Math.max(0, prev - 1) : prev
            })
            toast.success('Notification deleted')
        } catch (error) {
            console.error('Failed to delete notification:', error)
            toast.error('Failed to delete notification')
        }
    }, [notifications])

    const createNotification = useCallback(async (notificationData: {
        event: string
        details: string
        type: string
    }) => {
        try {
            // Mock API call - replace with actual API call when backend is ready
            // await apiService.createNotification(notificationData)
            toast.success('Notification created')
        } catch (error) {
            console.error('Failed to create notification:', error)
            toast.error('Failed to create notification')
        }
    }, [])

    const getNotificationsByType = useCallback((type: Notification['type']) => {
        return notifications.filter(notification => notification.type === type)
    }, [notifications])

    const getNotificationsBySeverity = useCallback((severity: Notification['severity']) => {
        return notifications.filter(notification => notification.severity === severity)
    }, [notifications])

    const getUnreadNotifications = useCallback(() => {
        return notifications.filter(notification => !notification.isRead)
    }, [notifications])

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    return {
        notifications,
        stats,
        loading,
        unreadCount,
        isConnected,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        createNotification,
        getNotificationsByType,
        getNotificationsBySeverity,
        getUnreadNotifications,
        sendMessage
    }
}
