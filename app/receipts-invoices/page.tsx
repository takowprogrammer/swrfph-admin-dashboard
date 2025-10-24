'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Search } from 'lucide-react'
import { apiService } from '@/lib/api'
import { toast } from 'sonner'

interface Invoice {
    id: string;
    invoiceId: string;
    orderId: string;
    customerName: string;
    customerEmail: string;
    billingAddress: string;
    amount: number;
    tax: number;
    discount: number;
    totalAmount: number;
    dueDate: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface Order {
    id: string;
    userId: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    user: {
        name: string;
        email: string;
    };
}

export default function ReceiptsInvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [previewInvoice, setPreviewInvoice] = useState<any>(null);

    // Invoice form state
    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [invoiceForm, setInvoiceForm] = useState({
        customerName: '',
        customerEmail: '',
        billingAddress: '',
        dueDate: '',
        discount: 0,
        tax: 0,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [invoicesData, ordersData] = await Promise.all([
                apiService.getInvoices() as any,
                apiService.getOrders() as any,
            ]);
            setInvoices(invoicesData.data || invoicesData);
            setOrders(ordersData.data || ordersData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInvoice = async () => {
        if (!selectedOrderId) {
            toast.error('Please select an order');
            return;
        }

        const order = orders.find(o => o.id === selectedOrderId);
        if (!order) {
            toast.error('Order not found');
            return;
        }

        try {
            const totalAmount = order.totalPrice + invoiceForm.tax - invoiceForm.discount;
            await apiService.createInvoice({
                orderId: selectedOrderId,
                customerName: invoiceForm.customerName || order.user.name,
                customerEmail: invoiceForm.customerEmail || order.user.email,
                billingAddress: invoiceForm.billingAddress,
                amount: order.totalPrice,
                tax: invoiceForm.tax,
                discount: invoiceForm.discount,
                totalAmount,
                dueDate: invoiceForm.dueDate,
            });

            toast.success('Invoice created successfully!');
            setInvoiceForm({
                customerName: '',
                customerEmail: '',
                billingAddress: '',
                dueDate: '',
                discount: 0,
                tax: 0,
            });
            setSelectedOrderId('');
            await fetchData();
        } catch (error: any) {
            console.error('Failed to create invoice:', error);
            toast.error(error.message || 'Failed to create invoice');
        }
    };

    const handleUpdateInvoiceStatus = async (invoiceId: string, status: string) => {
        try {
            await apiService.updateInvoiceStatus(invoiceId, status);
            toast.success('Invoice status updated successfully!');
            await fetchData();
        } catch (error: any) {
            console.error('Failed to update invoice status:', error);
            toast.error(error.message || 'Failed to update invoice status');
        }
    };

    const handlePreviewInvoice = () => {
        if (!selectedOrderId) {
            toast.error('Please select an order first');
            return;
        }

        const order = orders.find(o => o.id === selectedOrderId);
        if (!order) {
            toast.error('Order not found');
            return;
        }

        const totalAmount = order.totalPrice + invoiceForm.tax - invoiceForm.discount;

        setPreviewInvoice({
            orderId: selectedOrderId,
            customerName: invoiceForm.customerName || order.user.name,
            customerEmail: invoiceForm.customerEmail || order.user.email,
            billingAddress: invoiceForm.billingAddress,
            amount: order.totalPrice,
            tax: invoiceForm.tax,
            discount: invoiceForm.discount,
            totalAmount,
            dueDate: invoiceForm.dueDate,
            order: order
        });

        setShowPreview(true);
    };

    const handlePrintInvoice = () => {
        if (!previewInvoice) {
            toast.error('Please preview the invoice first');
            return;
        }

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(generateInvoiceHTML(previewInvoice));
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };

    const generateInvoiceHTML = (invoice: any) => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .invoice-details { margin-bottom: 30px; }
                    .customer-details { margin-bottom: 30px; }
                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .items-table th { background-color: #f2f2f2; }
                    .totals { text-align: right; margin-top: 20px; }
                    .total-row { font-weight: bold; font-size: 1.1em; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>INVOICE</h1>
                    <p>South West Regional Fund for Health Promotion</p>
                </div>
                
                <div class="invoice-details">
                    <p><strong>Invoice ID:</strong> INV-${Date.now().toString().slice(-6)}</p>
                    <p><strong>Order ID:</strong> ${invoice.orderId}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
                
                <div class="customer-details">
                    <h3>Bill To:</h3>
                    <p><strong>${invoice.customerName}</strong></p>
                    <p>${invoice.customerEmail}</p>
                    <p>${invoice.billingAddress}</p>
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Order #${invoice.orderId.substring(0, 7)}...</td>
                            <td>1</td>
                            <td>${invoice.amount.toFixed(2)} FCFA</td>
                            <td>${invoice.amount.toFixed(2)} FCFA</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="totals">
                    <p>Subtotal: ${invoice.amount.toFixed(2)} FCFA</p>
                    ${invoice.tax > 0 ? `<p>Tax: ${invoice.tax.toFixed(2)} FCFA</p>` : ''}
                    ${invoice.discount > 0 ? `<p>Discount: -${invoice.discount.toFixed(2)} FCFA</p>` : ''}
                    <p class="total-row">Total: ${invoice.totalAmount.toFixed(2)} FCFA</p>
                </div>
            </body>
            </html>
        `;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || invoice.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading invoices...</div>
            </div>
        );
    }
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Overdue': return 'bg-red-100 text-red-800';
            case 'Sent': return 'bg-blue-100 text-blue-800';
            case 'Draft': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    return (
        <div>
            <h1 className="text-4xl font-bold text-gray-900">Receipt/Invoice Generation</h1>
            <p className="mt-2 text-gray-600">Generate professional receipts and invoices for completed orders.</p>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Form Section */}
                <div className="space-y-8">
                    {/* Order Selection */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Select Order</h2>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Choose an order to create invoice for
                        </label>
                        <select
                            className="mt-2 block w-full pl-4 pr-10 py-3 text-base border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-lg bg-white shadow-sm transition-colors"
                            value={selectedOrderId}
                            onChange={(e) => setSelectedOrderId(e.target.value)}
                        >
                            <option value="">Select Order</option>
                            {orders.map(order => (
                                <option key={order.id} value={order.id}>
                                    Order #{order.id.substring(0, 7)}... - {order.user.name} ({order.totalPrice.toFixed(2)} FCFA)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Invoice Details Form */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Invoice Details</h2>
                        <div className="mt-4 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter customer name"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                                    value={invoiceForm.customerName}
                                    onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter customer email"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                                    value={invoiceForm.customerEmail}
                                    onChange={(e) => setInvoiceForm({ ...invoiceForm, customerEmail: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Billing Address
                                </label>
                                <textarea
                                    placeholder="Enter billing address"
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm resize-none"
                                    value={invoiceForm.billingAddress}
                                    onChange={(e) => setInvoiceForm({ ...invoiceForm, billingAddress: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                                    value={invoiceForm.dueDate}
                                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Discount (FCFA)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                                        value={invoiceForm.discount}
                                        onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tax (FCFA)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                                        value={invoiceForm.tax}
                                        onChange={(e) => setInvoiceForm({ ...invoiceForm, tax: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Invoice Preview</h2>
                    <div className="mt-4 space-y-6">
                        <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                            <div className="text-center">
                                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Invoice Preview</h3>
                                <p className="mt-2 text-gray-600">Select an order to see the invoice preview</p>
                                {selectedOrderId && (
                                    <div className="mt-4 p-4 bg-white rounded-lg border">
                                        <p className="text-sm text-gray-600">Order selected: #{selectedOrderId.substring(0, 7)}...</p>
                                        <p className="text-sm text-gray-600">Customer: {invoiceForm.customerName || 'Not specified'}</p>
                                        <p className="text-sm text-gray-600">Amount: {orders.find(o => o.id === selectedOrderId)?.totalPrice.toFixed(2) || '0.00'} FCFA</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handlePreviewInvoice}
                                disabled={!selectedOrderId}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Preview
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handlePrintInvoice}
                                disabled={!previewInvoice}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 flex justify-end space-x-4">
                <Button
                    variant="outline"
                    className="px-8 py-3"
                    onClick={handlePrintInvoice}
                    disabled={!previewInvoice}
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Invoice
                </Button>
                <Button
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 shadow-lg"
                    onClick={handleCreateInvoice}
                    disabled={!selectedOrderId}
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Invoice
                </Button>
            </div>

            {/* Invoice History */}
            <div className="mt-20">
                <h2 className="text-3xl font-bold text-gray-900">Invoice History</h2>
                <div className="mt-6 flex justify-between items-center">
                    <div className="relative w-1/3">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            className="w-full pl-12 pr-4 py-3 rounded-lg bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <select
                            className="pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Filter by Status</option>
                            <option value="DRAFT">Draft</option>
                            <option value="SENT">Sent</option>
                            <option value="PAID">Paid</option>
                            <option value="OVERDUE">Overdue</option>
                        </select>
                    </div>
                </div>
                <div className="mt-8 flow-root">
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full align-middle">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Invoice ID</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Customer</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Due Date</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {filteredInvoices.map((invoice) => (
                                            <tr key={invoice.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{invoice.invoiceId}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{invoice.customerName}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{invoice.totalAmount.toFixed(2)} FCFA</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(invoice.dueDate)}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(invoice.status)}`}>
                                                        {invoice.status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium space-x-4">
                                                    <select
                                                        value={invoice.status}
                                                        onChange={(e) => handleUpdateInvoiceStatus(invoice.id, e.target.value)}
                                                        className="text-xs border rounded px-2 py-1"
                                                    >
                                                        <option value="DRAFT">Draft</option>
                                                        <option value="SENT">Sent</option>
                                                        <option value="PAID">Paid</option>
                                                        <option value="OVERDUE">Overdue</option>
                                                    </select>
                                                    <a href="#" className="text-blue-600 hover:text-blue-900">Download</a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice Preview Modal */}
            {showPreview && previewInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Invoice Preview</h2>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                            <div className="text-center mb-6">
                                <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                                <p className="text-gray-600">South West Regional Fund for Health Promotion</p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Invoice Details</h3>
                                    <p><strong>Invoice ID:</strong> INV-{Date.now().toString().slice(-6)}</p>
                                    <p><strong>Order ID:</strong> {previewInvoice.orderId}</p>
                                    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                                    <p><strong>Due Date:</strong> {new Date(previewInvoice.dueDate).toLocaleDateString()}</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Bill To</h3>
                                    <p><strong>{previewInvoice.customerName}</strong></p>
                                    <p>{previewInvoice.customerEmail}</p>
                                    <p>{previewInvoice.billingAddress}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-2">Order #{previewInvoice.orderId.substring(0, 7)}...</td>
                                            <td className="border border-gray-300 px-4 py-2">1</td>
                                            <td className="border border-gray-300 px-4 py-2">{previewInvoice.amount.toFixed(2)} FCFA</td>
                                            <td className="border border-gray-300 px-4 py-2">{previewInvoice.amount.toFixed(2)} FCFA</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="text-right">
                                <p>Subtotal: {previewInvoice.amount.toFixed(2)} FCFA</p>
                                {previewInvoice.tax > 0 && <p>Tax: {previewInvoice.tax.toFixed(2)} FCFA</p>}
                                {previewInvoice.discount > 0 && <p>Discount: -{previewInvoice.discount.toFixed(2)} FCFA</p>}
                                <p className="text-xl font-bold mt-2">Total: {previewInvoice.totalAmount.toFixed(2)} FCFA</p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 mt-6">
                            <Button variant="outline" onClick={() => setShowPreview(false)}>
                                Close
                            </Button>
                            <Button onClick={handlePrintInvoice} className="bg-green-600 hover:bg-green-700">
                                Print Invoice
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
