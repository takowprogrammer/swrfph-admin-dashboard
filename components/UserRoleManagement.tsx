'use client'

import React, { useState, useEffect } from 'react'
import {
    Users, Shield, UserPlus, Edit, Trash2, Eye, EyeOff,
    CheckCircle, XCircle, Search, Filter, Download, Upload,
    Settings, Activity, Clock, MapPin, Mail, Phone
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { apiService } from '@/lib/api'
import { toast } from 'sonner'

interface User {
    id: string
    name: string
    email: string
    role: 'super_admin' | 'admin' | 'provider' | 'user'
    status: 'active' | 'inactive' | 'suspended' | 'pending'
    lastLogin: string
    createdAt: string
    permissions: string[]
    profile: {
        phone?: string
        address?: string
        avatar?: string
        department?: string
    }
    activity: {
        loginCount: number
        lastActivity: string
        ipAddress: string
        userAgent: string
    }
}

interface Role {
    id: string
    name: string
    description: string
    permissions: string[]
    color: string
    userCount: number
}

interface Permission {
    id: string
    name: string
    description: string
    category: string
}

const roles: Role[] = [
    {
        id: 'super_admin',
        name: 'Super Admin',
        description: 'Full system access and control',
        permissions: ['all'],
        color: 'text-red-600 bg-red-50',
        userCount: 2
    },
    {
        id: 'admin',
        name: 'Administrator',
        description: 'Administrative access to most features',
        permissions: ['users.read', 'users.write', 'orders.read', 'orders.write', 'inventory.read', 'inventory.write', 'reports.read'],
        color: 'text-blue-600 bg-blue-50',
        userCount: 5
    },
    {
        id: 'provider',
        name: 'Provider',
        description: 'Medicine provider with order management access',
        permissions: ['orders.read', 'orders.write', 'inventory.read', 'inventory.write', 'reports.read'],
        color: 'text-green-600 bg-green-50',
        userCount: 15
    },
    {
        id: 'user',
        name: 'User',
        description: 'Basic user with limited access',
        permissions: ['orders.read', 'inventory.read'],
        color: 'text-gray-600 bg-gray-50',
        userCount: 150
    }
]

const permissions: Permission[] = [
    { id: 'users.read', name: 'View Users', description: 'Can view user information', category: 'Users' },
    { id: 'users.write', name: 'Manage Users', description: 'Can create, edit, and delete users', category: 'Users' },
    { id: 'orders.read', name: 'View Orders', description: 'Can view order information', category: 'Orders' },
    { id: 'orders.write', name: 'Manage Orders', description: 'Can create, edit, and update orders', category: 'Orders' },
    { id: 'inventory.read', name: 'View Inventory', description: 'Can view medicine inventory', category: 'Inventory' },
    { id: 'inventory.write', name: 'Manage Inventory', description: 'Can add, edit, and remove medicines', category: 'Inventory' },
    { id: 'reports.read', name: 'View Reports', description: 'Can access reports and analytics', category: 'Reports' },
    { id: 'reports.write', name: 'Generate Reports', description: 'Can create and export reports', category: 'Reports' },
    { id: 'settings.read', name: 'View Settings', description: 'Can view system settings', category: 'Settings' },
    { id: 'settings.write', name: 'Manage Settings', description: 'Can modify system settings', category: 'Settings' }
]

export default function UserRoleManagement() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [showUserDialog, setShowUserDialog] = useState(false)
    const [showRoleDialog, setShowRoleDialog] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            // Mock data - replace with actual API call
            const mockUsers: User[] = Array.from({ length: 25 }, (_, i) => ({
                id: `user-${i + 1}`,
                name: `User ${i + 1}`,
                email: `user${i + 1}@example.com`,
                role: ['super_admin', 'admin', 'provider', 'user'][i % 4] as any,
                status: ['active', 'inactive', 'suspended', 'pending'][i % 4] as any,
                lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                permissions: roles.find(r => r.id === ['super_admin', 'admin', 'provider', 'user'][i % 4])?.permissions || [],
                profile: {
                    phone: `+237 6${Math.floor(Math.random() * 100000000)}`,
                    address: `Address ${i + 1}`,
                    department: ['IT', 'Pharmacy', 'Management', 'Support'][i % 4]
                },
                activity: {
                    loginCount: Math.floor(Math.random() * 100),
                    lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
                    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }))
            setUsers(mockUsers)
        } catch (error) {
            console.error('Failed to fetch users:', error)
            toast.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = roleFilter === 'all' || user.role === roleFilter
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter
        return matchesSearch && matchesRole && matchesStatus
    })

    const handleSelectUser = (userId: string) => {
        const newSelected = new Set(selectedUsers)
        if (newSelected.has(userId)) {
            newSelected.delete(userId)
        } else {
            newSelected.add(userId)
        }
        setSelectedUsers(newSelected)
    }

    const handleSelectAll = () => {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set())
        } else {
            setSelectedUsers(new Set(filteredUsers.map(user => user.id)))
        }
    }

    const handleUserAction = async (action: string, userIds: string[]) => {
        try {
            // Mock API calls - replace with actual implementation
            switch (action) {
                case 'activate':
                    setUsers(prev => prev.map(user =>
                        userIds.includes(user.id) ? { ...user, status: 'active' } : user
                    ))
                    toast.success(`${userIds.length} users activated`)
                    break
                case 'suspend':
                    setUsers(prev => prev.map(user =>
                        userIds.includes(user.id) ? { ...user, status: 'suspended' } : user
                    ))
                    toast.success(`${userIds.length} users suspended`)
                    break
                case 'delete':
                    setUsers(prev => prev.filter(user => !userIds.includes(user.id)))
                    toast.success(`${userIds.length} users deleted`)
                    break
                case 'export':
                    toast.success(`Exporting ${userIds.length} users...`)
                    break
            }
            setSelectedUsers(new Set())
        } catch (error) {
            console.error(`Failed to ${action} users:`, error)
            toast.error(`Failed to ${action} users`)
        }
    }

    const getRoleConfig = (roleId: string) => {
        return roles.find(role => role.id === roleId) || roles[0]
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'text-green-600 bg-green-50'
            case 'inactive':
                return 'text-gray-600 bg-gray-50'
            case 'suspended':
                return 'text-red-600 bg-red-50'
            case 'pending':
                return 'text-yellow-600 bg-yellow-50'
            default:
                return 'text-gray-600 bg-gray-50'
        }
    }

    const formatLastLogin = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (diffInHours < 1) return 'Just now'
        if (diffInHours < 24) return `${diffInHours}h ago`
        return `${Math.floor(diffInHours / 24)}d ago`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading users...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">User & Role Management</h2>
                    <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowUserDialog(true)}
                    >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add User
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRoleDialog(true)}
                    >
                        <Shield className="h-4 w-4 mr-1" />
                        Manage Roles
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {roles.map((role) => (
                    <Card key={role.id}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{role.name}</p>
                                    <p className="text-2xl font-bold">{role.userCount}</p>
                                </div>
                                <Badge className={role.color}>
                                    {role.userCount} users
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Roles</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bulk Actions */}
            {selectedUsers.size > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                                {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
                            </span>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUserAction('activate', Array.from(selectedUsers))}
                                >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Activate
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUserAction('suspend', Array.from(selectedUsers))}
                                >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Suspend
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUserAction('export', Array.from(selectedUsers))}
                                >
                                    <Download className="h-4 w-4 mr-1" />
                                    Export
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUserAction('delete', Array.from(selectedUsers))}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Users ({filteredUsers.length})</CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                                            onChange={handleSelectAll}
                                            className="rounded"
                                        />
                                    </th>
                                    <th className="text-left p-2">User</th>
                                    <th className="text-left p-2">Role</th>
                                    <th className="text-left p-2">Status</th>
                                    <th className="text-left p-2">Last Login</th>
                                    <th className="text-left p-2">Activity</th>
                                    <th className="text-left p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => {
                                    const roleConfig = getRoleConfig(user.role)
                                    return (
                                        <tr key={user.id} className="border-b hover:bg-gray-50">
                                            <td className="p-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.has(user.id)}
                                                    onChange={() => handleSelectUser(user.id)}
                                                    className="rounded"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-sm text-gray-600">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                <Badge className={roleConfig.color}>
                                                    {roleConfig.name}
                                                </Badge>
                                            </td>
                                            <td className="p-2">
                                                <Badge className={getStatusColor(user.status)}>
                                                    {user.status}
                                                </Badge>
                                            </td>
                                            <td className="p-2">
                                                <span className="text-sm text-gray-600">
                                                    {formatLastLogin(user.lastLogin)}
                                                </span>
                                            </td>
                                            <td className="p-2">
                                                <div className="text-sm">
                                                    <p className="text-gray-600">{user.activity.loginCount} logins</p>
                                                    <p className="text-xs text-gray-500">{user.activity.ipAddress}</p>
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                <div className="flex space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedUser(user)
                                                            setShowUserDialog(true)
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingUser(user)
                                                            setShowUserDialog(true)
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleUserAction('delete', [user.id])}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* User Detail Dialog */}
            <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser ? 'Edit User' : selectedUser ? 'User Details' : 'Add New User'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingUser ? 'Update user information and permissions' :
                                selectedUser ? 'View detailed user information' :
                                    'Create a new user account'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && !editingUser && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium mb-2">Profile Information</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Name:</strong> {selectedUser.name}</p>
                                        <p><strong>Email:</strong> {selectedUser.email}</p>
                                        <p><strong>Phone:</strong> {selectedUser.profile.phone || 'N/A'}</p>
                                        <p><strong>Department:</strong> {selectedUser.profile.department || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Activity Information</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Login Count:</strong> {selectedUser.activity.loginCount}</p>
                                        <p><strong>Last Activity:</strong> {formatLastLogin(selectedUser.activity.lastActivity)}</p>
                                        <p><strong>IP Address:</strong> {selectedUser.activity.ipAddress}</p>
                                        <p><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Permissions</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedUser.permissions.map((permission) => {
                                        const perm = permissions.find(p => p.id === permission)
                                        return perm ? (
                                            <div key={permission} className="flex items-center space-x-2 text-sm">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <span>{perm.name}</span>
                                            </div>
                                        ) : null
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                            Close
                        </Button>
                        {editingUser && (
                            <Button onClick={() => {
                                toast.success('User updated successfully')
                                setShowUserDialog(false)
                                setEditingUser(null)
                            }}>
                                Save Changes
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Role Management Dialog */}
            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Role Management</DialogTitle>
                        <DialogDescription>Configure roles and their permissions</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {roles.map((role) => (
                            <Card key={role.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{role.name}</CardTitle>
                                            <CardDescription>{role.description}</CardDescription>
                                        </div>
                                        <Badge className={role.color}>
                                            {role.userCount} users
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        {permissions.map((permission) => (
                                            <div key={permission.id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={role.permissions.includes(permission.id) || role.permissions.includes('all')}
                                                    disabled={role.permissions.includes('all')}
                                                    className="rounded"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium">{permission.name}</p>
                                                    <p className="text-xs text-gray-600">{permission.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                            Close
                        </Button>
                        <Button onClick={() => {
                            toast.success('Roles updated successfully')
                            setShowRoleDialog(false)
                        }}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
