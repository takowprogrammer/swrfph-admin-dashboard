'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { apiService } from '@/lib/api'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'

interface Medicine {
    id: string;
    name: string;
    description: string;
    quantity: number;
    price: number;
    category?: string;
    createdAt: string;
    updatedAt: string;
}

export default function InventoryPage() {
    const router = useRouter()
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newMedicine, setNewMedicine] = useState({
        name: '',
        description: '',
        quantity: '',
        price: '',
        category: '',
    });
    const [editMedicine, setEditMedicine] = useState<Partial<Medicine>>({});
    const [loading, setLoading] = useState(true);
    const [medicineToDelete, setMedicineToDelete] = useState<Medicine | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);


    const fetchMedicines = async (page = currentPage, limit = itemsPerPage, search = searchTerm, filter = activeFilter) => {
        try {
            setLoading(true);
            const data = await apiService.getMedicines() as any;
            const allMedicines = data.data || data;

            // Apply filtering
            const filteredMedicines = allMedicines.filter((medicine: Medicine) => {
                const matchesSearch = medicine.name.toLowerCase().includes(search.toLowerCase()) ||
                    medicine.description.toLowerCase().includes(search.toLowerCase());

                if (filter === 'All') {
                    return matchesSearch;
                }
                if (filter === 'Low Stock') {
                    return matchesSearch && medicine.quantity < 50 && medicine.quantity > 0;
                }
                if (filter === 'Out of Stock') {
                    return matchesSearch && medicine.quantity === 0;
                }
                return false;
            });

            // Update total items and pages
            setTotalItems(filteredMedicines.length);
            const calculatedTotalPages = Math.ceil(filteredMedicines.length / limit);
            setTotalPages(calculatedTotalPages);

            // Apply pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedMedicines = filteredMedicines.slice(startIndex, endIndex);

            setMedicines(paginatedMedicines);
        } catch (error) {
            console.error("Failed to fetch medicines:", error);
            toast.error('Failed to load medicines');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicines(1, itemsPerPage, searchTerm, activeFilter);
    }, []);

    // Handle search and filter changes
    useEffect(() => {
        setCurrentPage(1); // Reset to first page when search/filter changes
        fetchMedicines(1, itemsPerPage, searchTerm, activeFilter);
    }, [searchTerm, activeFilter, itemsPerPage]);

    // Pagination functions
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchMedicines(page, itemsPerPage, searchTerm, activeFilter);
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
        fetchMedicines(1, newItemsPerPage, searchTerm, activeFilter);
    };

    const handleAddMedicine = async () => {
        try {
            await apiService.createMedicine({
                name: newMedicine.name,
                description: newMedicine.description,
                quantity: Number(newMedicine.quantity),
                price: parseFloat(newMedicine.price),
                category: newMedicine.category,
            });

            toast.success("Medicine added successfully!");
            setNewMedicine({ name: '', description: '', quantity: '', price: '', category: '' });
            setIsAddModalOpen(false);
            await fetchMedicines(currentPage, itemsPerPage, searchTerm, activeFilter);

        } catch (error) {
            console.error("Failed to submit new medicine:", error);
            toast.error("An unexpected error occurred while adding the medicine.");
        }
    };

    const handleEditClick = (medicine: Medicine) => {
        const priceAsString = medicine.price.toString().replace('$', '');
        setSelectedMedicine(medicine);
        setEditMedicine({ ...medicine, price: parseFloat(priceAsString) });
        setIsEditModalOpen(true);
    };

    const handleUpdateMedicine = async () => {
        if (!selectedMedicine) return;

        try {
            // Prepare the data by converting price and quantity back to numbers
            const updateData: any = { ...editMedicine };
            if (updateData.quantity) {
                updateData.quantity = Number(updateData.quantity);
            }
            if (updateData.price) {
                updateData.price = parseFloat(updateData.price);
            }
            // Remove fields that shouldn't be sent in the PATCH request
            delete updateData.id;
            delete updateData.status;

            await apiService.updateMedicine(selectedMedicine.id, updateData);

            toast.success("Medicine updated successfully!");
            await fetchMedicines(currentPage, itemsPerPage, searchTerm, activeFilter);
            setIsEditModalOpen(false);
            setSelectedMedicine(null);

        } catch (error) {
            console.error("Failed to update medicine:", error);
            toast.error("An unexpected error occurred while updating the medicine.");
        }
    };

    const handleDeleteClick = (medicine: Medicine) => {
        setMedicineToDelete(medicine);
    };

    const handleDeleteConfirm = async () => {
        if (!medicineToDelete) return;

        try {
            await apiService.deleteMedicine(medicineToDelete.id);

            toast.success("Medicine deleted successfully!");
            await fetchMedicines(currentPage, itemsPerPage, searchTerm, activeFilter);
            setMedicineToDelete(null); // Close the dialog

        } catch (error) {
            console.error("Failed to delete medicine:", error);
            toast.error("An unexpected error occurred while deleting the medicine.");
        }
    };

    // Generate page numbers for pagination
    const generatePageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) pages.push('...');
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'In Stock': return 'bg-green-100 text-green-800';
            case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
            case 'Out of Stock': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="mt-2 text-lg text-gray-600">Manage medicine stock levels, add new medicines, and update details.</p>
                    {/* Debug info */}
                    <div className="mt-2 text-sm text-gray-500">
                        Showing {medicines.length} of {totalItems} medicines | Page {currentPage} of {totalPages}
                    </div>
                </div>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-sm">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Medicine
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Medicine</DialogTitle>
                            <DialogDescription>
                                Fill in the details below to add a new medicine to the inventory.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" placeholder="e.g., Paracetamol" className="col-span-3" value={newMedicine.name} onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">Description</Label>
                                <Input id="description" placeholder="e.g., Pain reliever" className="col-span-3" value={newMedicine.description} onChange={(e) => setNewMedicine({ ...newMedicine, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="quantity" className="text-right">Quantity</Label>
                                <Input id="quantity" type="number" placeholder="e.g., 500" className="col-span-3" value={newMedicine.quantity} onChange={(e) => setNewMedicine({ ...newMedicine, quantity: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="price" className="text-right">Price</Label>
                                <Input id="price" type="number" placeholder="e.g., 5.00" className="col-span-3" value={newMedicine.price} onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={handleAddMedicine}>Save Medicine</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for medicines..."
                            className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant={activeFilter === 'All' ? 'default' : 'outline'}
                            onClick={() => setActiveFilter('All')}
                            className={activeFilter === 'All' ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-gray-300 hover:bg-gray-50'}
                        >
                            All
                        </Button>
                        <Button
                            variant={activeFilter === 'Low Stock' ? 'default' : 'outline'}
                            onClick={() => setActiveFilter('Low Stock')}
                            className={activeFilter === 'Low Stock' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'border-gray-300 hover:bg-gray-50'}
                        >
                            Low Stock
                        </Button>
                        <Button
                            variant={activeFilter === 'Out of Stock' ? 'default' : 'outline'}
                            onClick={() => setActiveFilter('Out of Stock')}
                            className={activeFilter === 'Out of Stock' ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-gray-300 hover:bg-gray-50'}
                        >
                            Out of Stock
                        </Button>
                    </div>
                </div>
            </div>

            {/* Medicine Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th scope="col" className="py-4 pl-6 pr-3 text-left text-sm font-semibold text-gray-900">Medicine Name</th>
                                <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                                <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-900">Quantity</th>
                                <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                                <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
                                            <p className="text-gray-500">Loading medicines...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : medicines.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines found</h3>
                                            <p className="text-gray-500 mb-4">
                                                {searchTerm || activeFilter !== 'All'
                                                    ? 'Try adjusting your search or filter criteria.'
                                                    : 'Get started by adding your first medicine to the inventory.'
                                                }
                                            </p>
                                            {(!searchTerm && activeFilter === 'All') && (
                                                <Button
                                                    onClick={() => setIsAddModalOpen(true)}
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Add First Medicine
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : medicines.map((medicine) => (
                                <tr key={medicine.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                </svg>
                                            </div>
                                            {medicine.name}
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">{medicine.description}</td>
                                    <td className="px-3 py-4 text-sm text-gray-900 font-medium">{medicine.quantity}</td>
                                    <td className="px-3 py-4 text-sm text-gray-900 font-medium">{medicine.price} FCFA</td>
                                    <td className="px-3 py-4 text-sm">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${medicine.quantity === 0 ? 'bg-red-100 text-red-800' :
                                            medicine.quantity < 50 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {medicine.quantity === 0 ? 'Out of Stock' : medicine.quantity < 50 ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-4 text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditClick(medicine)}
                                                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </Button>
                                            <AlertDialog open={!!medicineToDelete && medicineToDelete.id === medicine.id} onOpenChange={(isOpen) => !isOpen && setMedicineToDelete(null)}>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(medicine)}
                                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the medicine
                                                            "{medicineToDelete?.name}" from the inventory.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls - Test with 5 items per page */}
            {(totalPages > 1 || totalItems > 5) && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                        {/* Items per page selector */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700">Show</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span className="text-sm text-gray-700">per page</span>
                        </div>

                        {/* Page info */}
                        <div className="text-sm text-gray-700">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                        </div>

                        {/* Pagination buttons */}
                        <div className="flex items-center space-x-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {generatePageNumbers().map((page, index) => (
                                <Button
                                    key={index}
                                    variant={page === currentPage ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                                    disabled={page === '...'}
                                    className={`h-8 w-8 p-0 ${page === currentPage
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Medicine Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Medicine</DialogTitle>
                        <DialogDescription>
                            Update the details for {selectedMedicine?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">Name</Label>
                            <Input id="edit-name" value={editMedicine?.name || ''} onChange={(e) => setEditMedicine({ ...editMedicine, name: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-description" className="text-right">Description</Label>
                            <Input id="edit-description" value={editMedicine?.description || ''} onChange={(e) => setEditMedicine({ ...editMedicine, description: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-quantity" className="text-right">Quantity</Label>
                            <Input id="edit-quantity" type="number" value={editMedicine?.quantity || ''} onChange={(e) => setEditMedicine({ ...editMedicine, quantity: e.target.valueAsNumber })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-price" className="text-right">Price</Label>
                            <Input id="edit-price" type="number" value={editMedicine?.price || ''} onChange={(e) => setEditMedicine({ ...editMedicine, price: parseFloat(e.target.value) || 0 })} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleUpdateMedicine}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
