'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Clock, Star, Filter, Download, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { apiService } from '@/lib/api'
import { toast } from 'sonner'

interface SearchResult {
    id: string
    type: 'order' | 'user' | 'medicine' | 'notification' | 'report'
    title: string
    description: string
    metadata: {
        status?: string
        date?: string
        amount?: number
        category?: string
        priority?: string
        [key: string]: any
    }
    relevance: number
    url: string
}

interface SearchFilter {
    type: string[]
    dateRange: {
        start: string
        end: string
    }
    status: string[]
    category: string[]
}

interface SavedSearch {
    id: string
    name: string
    query: string
    filters: SearchFilter
    createdAt: string
}

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState<SearchFilter>({
        type: [],
        dateRange: { start: '', end: '' },
        status: [],
        category: []
    })
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
    const [showFilters, setShowFilters] = useState(false)
    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const searchInputRef = useRef<HTMLInputElement>(null)

    const searchTypes = [
        { key: 'order', label: 'Orders', icon: '📦', color: 'text-blue-600' },
        { key: 'user', label: 'Users', icon: '👤', color: 'text-green-600' },
        { key: 'medicine', label: 'Medicines', icon: '💊', color: 'text-purple-600' },
        { key: 'notification', label: 'Notifications', icon: '🔔', color: 'text-yellow-600' },
        { key: 'report', label: 'Reports', icon: '📊', color: 'text-indigo-600' }
    ]

    const statusOptions = [
        'pending', 'processing', 'completed', 'cancelled', 'active', 'inactive', 'suspended'
    ]

    const categoryOptions = [
        'Pain Relief', 'Antibiotic', 'Diabetes', 'Cardiovascular', 'Respiratory', 'Digestive'
    ]

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [isOpen])

    useEffect(() => {
        // Load saved searches and recent searches from localStorage
        const saved = localStorage.getItem('admin-saved-searches')
        const recent = localStorage.getItem('admin-recent-searches')

        if (saved) {
            setSavedSearches(JSON.parse(saved))
        }
        if (recent) {
            setRecentSearches(JSON.parse(recent))
        }
    }, [])

    const performSearch = async (searchQuery: string, searchFilters: SearchFilter = filters) => {
        if (!searchQuery.trim()) {
            setResults([])
            return
        }

        setLoading(true)
        try {
            // Mock search results - replace with actual API call
            const mockResults: SearchResult[] = [
                {
                    id: '1',
                    type: 'order' as const,
                    title: `Order #ORD-${searchQuery}`,
                    description: 'Customer order for pain relief medication',
                    metadata: { status: 'pending', date: '2024-01-15', amount: 250 },
                    relevance: 0.95,
                    url: '/orders/1'
                },
                {
                    id: '2',
                    type: 'user' as const,
                    title: `User: ${searchQuery}`,
                    description: 'Provider account with active status',
                    metadata: { status: 'active', date: '2024-01-10' },
                    relevance: 0.88,
                    url: '/users/2'
                },
                {
                    id: '3',
                    type: 'medicine' as const,
                    title: `${searchQuery} 500mg`,
                    description: 'Pain relief medication in stock',
                    metadata: { category: 'Pain Relief', status: 'active', amount: 150 },
                    relevance: 0.82,
                    url: '/inventory/3'
                },
                {
                    id: '4',
                    type: 'notification' as const,
                    title: `Notification: ${searchQuery}`,
                    description: 'System alert regarding low stock levels',
                    metadata: { priority: 'high', date: '2024-01-14' },
                    relevance: 0.75,
                    url: '/notifications/4'
                }
            ].filter(result =>
                result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                result.description.toLowerCase().includes(searchQuery.toLowerCase())
            )

            // Apply filters
            let filteredResults = mockResults
            if (searchFilters.type.length > 0) {
                filteredResults = filteredResults.filter(result =>
                    searchFilters.type.includes(result.type)
                )
            }
            if (searchFilters.status.length > 0) {
                filteredResults = filteredResults.filter(result =>
                    searchFilters.status.includes(result.metadata.status || '')
                )
            }

            setResults(filteredResults)

            // Add to recent searches
            if (!recentSearches.includes(searchQuery)) {
                const newRecent = [searchQuery, ...recentSearches].slice(0, 10)
                setRecentSearches(newRecent)
                localStorage.setItem('admin-recent-searches', JSON.stringify(newRecent))
            }
        } catch (error) {
            console.error('Search failed:', error)
            toast.error('Search failed')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        performSearch(query)
    }

    const handleQueryChange = (value: string) => {
        setQuery(value)
        if (value.length > 2) {
            performSearch(value)
        } else {
            setResults([])
        }
    }

    const handleFilterChange = (filterType: keyof SearchFilter, value: any) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }))
        if (query) {
            performSearch(query, { ...filters, [filterType]: value })
        }
    }

    const saveSearch = () => {
        if (!query.trim()) return

        const newSavedSearch: SavedSearch = {
            id: `saved-${Date.now()}`,
            name: `Search: ${query}`,
            query,
            filters,
            createdAt: new Date().toISOString()
        }

        const updatedSaved = [newSavedSearch, ...savedSearches].slice(0, 20)
        setSavedSearches(updatedSaved)
        localStorage.setItem('admin-saved-searches', JSON.stringify(updatedSaved))
        toast.success('Search saved successfully')
    }

    const loadSavedSearch = (savedSearch: SavedSearch) => {
        setQuery(savedSearch.query)
        setFilters(savedSearch.filters)
        performSearch(savedSearch.query, savedSearch.filters)
    }

    const clearFilters = () => {
        setFilters({
            type: [],
            dateRange: { start: '', end: '' },
            status: [],
            category: []
        })
        if (query) {
            performSearch(query, {
                type: [],
                dateRange: { start: '', end: '' },
                status: [],
                category: []
            })
        }
    }

    const exportResults = () => {
        if (results.length === 0) {
            toast.error('No results to export')
            return
        }
        toast.success(`Exporting ${results.length} results...`)
        // Implement actual export functionality
    }

    const getResultIcon = (type: string) => {
        const typeConfig = searchTypes.find(t => t.key === type)
        return typeConfig?.icon || '📄'
    }

    const getResultColor = (type: string) => {
        const typeConfig = searchTypes.find(t => t.key === type)
        return typeConfig?.color || 'text-gray-600'
    }

    return (
        <>
            {/* Search Trigger */}
            <Button
                variant="ghost"
                size="sm"
                className="relative w-full justify-start text-gray-500"
                onClick={() => setIsOpen(true)}
            >
                <Search className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Search everything...</span>
                <span className="sm:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-5 px-1.5 text-xs font-mono text-gray-500 bg-gray-100 rounded border hidden sm:inline-flex">
                    ⌘K
                </kbd>
            </Button>

            {/* Search Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Global Search</span>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <Filter className="h-4 w-4 mr-1" />
                                    Filters
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={exportResults}
                                    disabled={results.length === 0}
                                >
                                    <Download className="h-4 w-4 mr-1" />
                                    Export
                                </Button>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Search Input */}
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search orders, users, medicines, notifications..."
                                value={query}
                                onChange={(e) => handleQueryChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {query && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                    onClick={() => {
                                        setQuery('')
                                        setResults([])
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </form>

                        {/* Filters */}
                        {showFilters && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Search Filters</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Type</label>
                                            <div className="space-y-2">
                                                {searchTypes.map((type) => (
                                                    <label key={type.key} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={filters.type.includes(type.key)}
                                                            onChange={(e) => {
                                                                const newTypes = e.target.checked
                                                                    ? [...filters.type, type.key]
                                                                    : filters.type.filter(t => t !== type.key)
                                                                handleFilterChange('type', newTypes)
                                                            }}
                                                            className="rounded"
                                                        />
                                                        <span className="text-sm">{type.icon} {type.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Status</label>
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {statusOptions.map((status) => (
                                                    <label key={status} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={filters.status.includes(status)}
                                                            onChange={(e) => {
                                                                const newStatuses = e.target.checked
                                                                    ? [...filters.status, status]
                                                                    : filters.status.filter(s => s !== status)
                                                                handleFilterChange('status', newStatuses)
                                                            }}
                                                            className="rounded"
                                                        />
                                                        <span className="text-sm capitalize">{status}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Category</label>
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {categoryOptions.map((category) => (
                                                    <label key={category} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={filters.category.includes(category)}
                                                            onChange={(e) => {
                                                                const newCategories = e.target.checked
                                                                    ? [...filters.category, category]
                                                                    : filters.category.filter(c => c !== category)
                                                                handleFilterChange('category', newCategories)
                                                            }}
                                                            className="rounded"
                                                        />
                                                        <span className="text-sm">{category}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        <Button variant="outline" size="sm" onClick={clearFilters}>
                                            Clear Filters
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={saveSearch}>
                                            Save Search
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Search Results */}
                        <div className="max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Search className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                                    <p>Searching...</p>
                                </div>
                            ) : results.length > 0 ? (
                                <div className="space-y-2">
                                    {results.map((result) => (
                                        <Card
                                            key={result.id}
                                            className="cursor-pointer hover:shadow-md transition-shadow"
                                            onClick={() => {
                                                // Navigate to result URL
                                                window.location.href = result.url
                                            }}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start space-x-3">
                                                    <div className="text-2xl">{getResultIcon(result.type)}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-sm font-medium text-gray-900 truncate">
                                                                {result.title}
                                                            </h4>
                                                            <div className="flex items-center space-x-2">
                                                                <Badge variant="outline" className={getResultColor(result.type)}>
                                                                    {result.type}
                                                                </Badge>
                                                                <span className="text-xs text-gray-500">
                                                                    {Math.round(result.relevance * 100)}% match
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                            {result.description}
                                                        </p>
                                                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                            {result.metadata.status && (
                                                                <span>Status: {result.metadata.status}</span>
                                                            )}
                                                            {result.metadata.date && (
                                                                <span>Date: {new Date(result.metadata.date).toLocaleDateString()}</span>
                                                            )}
                                                            {result.metadata.amount && (
                                                                <span>Amount: {result.metadata.amount.toLocaleString()} FCFA</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : query ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Search className="h-8 w-8 mx-auto mb-2" />
                                    <p>No results found for "{query}"</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Recent Searches */}
                                    {recentSearches.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">Recent Searches</h3>
                                            <div className="space-y-1">
                                                {recentSearches.slice(0, 5).map((search, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => {
                                                            setQuery(search)
                                                            performSearch(search)
                                                        }}
                                                        className="flex items-center space-x-2 w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-gray-600"
                                                    >
                                                        <Clock className="h-4 w-4" />
                                                        <span>{search}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Saved Searches */}
                                    {savedSearches.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">Saved Searches</h3>
                                            <div className="space-y-1">
                                                {savedSearches.slice(0, 5).map((savedSearch) => (
                                                    <button
                                                        key={savedSearch.id}
                                                        onClick={() => loadSavedSearch(savedSearch)}
                                                        className="flex items-center space-x-2 w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-gray-600"
                                                    >
                                                        <Star className="h-4 w-4" />
                                                        <span>{savedSearch.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
