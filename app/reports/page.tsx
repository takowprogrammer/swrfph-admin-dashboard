'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { apiService } from '@/lib/api'
import { toast } from 'sonner'
import { Download, FileText, BarChart3, TrendingUp, Package } from 'lucide-react'

interface SalesTrend {
    month: string;
    sales: number;
}

interface PopularMedicine {
    medicineId: string;
    medicineName: string;
    category: string;
    totalSold: number;
    orderCount: number;
}

interface FulfillmentRate {
    totalOrders: number;
    deliveredOrders: number;
    fulfillmentRate: number;
}

interface InventoryTurnover {
    avgInventoryValue: number;
    totalSalesValue: number;
    turnoverRatio: number;
}

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [salesData, setSalesData] = useState<SalesTrend[]>([]);
    const [popularMedicines, setPopularMedicines] = useState<PopularMedicine[]>([]);
    const [fulfillmentRate, setFulfillmentRate] = useState<FulfillmentRate | null>(null);
    const [inventoryTurnover, setInventoryTurnover] = useState<InventoryTurnover | null>(null);
    const [monthlyRevenue, setMonthlyRevenue] = useState<SalesTrend[]>([]);

    // Refs for chart elements
    const salesChartRef = useRef<HTMLDivElement>(null);
    const popularMedicinesRef = useRef<HTMLDivElement>(null);

    // Custom report filters
    const [customFilters, setCustomFilters] = useState({
        startDate: '',
        endDate: '',
        category: '',
        status: '',
    });

    useEffect(() => {
        fetchReportsData();
    }, []);

    const fetchReportsData = async () => {
        try {
            setLoading(true);
            const [sales, popular, fulfillment, turnover, revenue] = await Promise.all([
                apiService.getSalesTrends(6) as any,
                apiService.getPopularMedicines(5) as any,
                apiService.getOrderFulfillmentRate() as any,
                apiService.getInventoryTurnoverRatio() as any,
                apiService.getMonthlyRevenue(6) as any,
            ]);

            setSalesData(sales.data || sales);
            setPopularMedicines(popular.data || popular);
            setFulfillmentRate(fulfillment.data || fulfillment);
            setInventoryTurnover(turnover.data || turnover);
            setMonthlyRevenue(revenue.data || revenue);
        } catch (error) {
            console.error('Failed to fetch reports data:', error);
            toast.error('Failed to load reports data');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCustomReport = async () => {
        try {
            setLoading(true);
            const report = await apiService.getCustomReport(customFilters);
            console.log('Custom report:', report);
            toast.success('Custom report generated successfully!');
        } catch (error) {
            console.error('Failed to generate custom report:', error);
            toast.error('Failed to generate custom report');
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async (reportType: 'comprehensive' | 'sales' | 'inventory' | 'custom' = 'comprehensive') => {
        try {
            setExporting(true);

            // Use browser's print dialog for PDF generation
            const reportContent = generateReportHTML(reportType);
            const printWindow = window.open('', '_blank');

            if (printWindow) {
                printWindow.document.write(reportContent);
                printWindow.document.close();
                printWindow.focus();

                // Wait for content to load then print
                setTimeout(() => {
                    printWindow.print();
                    toast.success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report ready for export!`);
                }, 500);
            } else {
                toast.error('Please allow popups to export reports');
            }
        } catch (error) {
            console.error('Failed to export PDF:', error);
            toast.error('Failed to export PDF report');
        } finally {
            setExporting(false);
        }
    };

    const generateReportHTML = (reportType: string): string => {
        const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
        const today = new Date().toLocaleDateString();

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Pharmacy Report - ${reportType}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    h1 { color: #10B981; }
                    h2 { color: #374151; margin-top: 30px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #10B981; color: white; }
                    .metric { background-color: #f3f4f6; padding: 15px; margin: 10px 0; border-radius: 8px; }
                    .metric-value { font-size: 24px; font-weight: bold; color: #10B981; }
                    @media print {
                        body { margin: 20px; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>Pharmacy Management System - Analytics Report</h1>
                <p><strong>Report Type:</strong> ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}</p>
                <p><strong>Generated:</strong> ${today}</p>
                
                ${reportType === 'comprehensive' || reportType === 'sales' ? `
                <h2>Sales Analysis</h2>
                <div class="metric">
                    <div>Total Sales (Last 6 Months)</div>
                    <div class="metric-value">${totalSales.toLocaleString()} FCFA</div>
                </div>
                <table>
                    <tr><th>Month</th><th>Sales (FCFA)</th></tr>
                    ${salesData.map(item => `<tr><td>${item.month}</td><td>${item.sales.toLocaleString()}</td></tr>`).join('')}
                </table>
                ` : ''}
                
                ${reportType === 'comprehensive' || reportType === 'inventory' ? `
                <h2>Top Selling Medicines</h2>
                <table>
                    <tr><th>Medicine</th><th>Category</th><th>Units Sold</th><th>Orders</th></tr>
                    ${popularMedicines.map(med => `
                        <tr>
                            <td>${med.medicineName}</td>
                            <td>${med.category}</td>
                            <td>${med.totalSold}</td>
                            <td>${med.orderCount}</td>
                        </tr>
                    `).join('')}
                </table>
                ` : ''}
                
                ${reportType === 'comprehensive' ? `
                <h2>Performance Metrics</h2>
                <div class="metric">
                    <div>Order Fulfillment Rate</div>
                    <div class="metric-value">${fulfillmentRate?.fulfillmentRate.toFixed(1)}%</div>
                    <div>${fulfillmentRate?.deliveredOrders} of ${fulfillmentRate?.totalOrders} orders delivered</div>
                </div>
                <div class="metric">
                    <div>Inventory Turnover Ratio</div>
                    <div class="metric-value">${inventoryTurnover?.turnoverRatio.toFixed(1)}</div>
                    <div>Sales Value: ${inventoryTurnover?.totalSalesValue.toLocaleString()} FCFA</div>
                </div>
                ` : ''}
                
                ${reportType === 'custom' ? `
                <h2>Custom Report Filters</h2>
                <p><strong>Date Range:</strong> ${customFilters.startDate || 'All'} to ${customFilters.endDate || 'All'}</p>
                <p><strong>Category:</strong> ${customFilters.category || 'All'}</p>
                <p><strong>Status:</strong> ${customFilters.status || 'All'}</p>
                ` : ''}
                
                <p style="margin-top: 50px; font-size: 12px; color: #6b7280;">
                    Pharmacy Management System - Confidential Report
                </p>
            </body>
            </html>
        `;
    };

    const handleExportChartPDF = async (chartType: 'sales' | 'popular') => {
        try {
            setExporting(true);
            // Use the comprehensive report with specific focus
            await handleExportPDF(chartType === 'sales' ? 'sales' : 'inventory');
        } catch (error) {
            console.error('Failed to export chart PDF:', error);
            toast.error('Failed to export chart PDF');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading reports...</div>
            </div>
        );
    }
    return (
        <div>
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Reporting & Analysis</h1>
                    <p className="mt-2 text-gray-600">Track key performance indicators and trends within the organization.</p>
                </div>
                <div className="flex space-x-3">
                    <Button
                        variant="outline"
                        onClick={() => handleExportPDF('comprehensive')}
                        disabled={exporting || loading}
                        className="flex items-center space-x-2"
                    >
                        <FileText className="h-4 w-4" />
                        <span>{exporting ? 'Exporting...' : 'Export Full Report'}</span>
                    </Button>
                    <Button
                        onClick={() => handleExportPDF('sales')}
                        disabled={exporting || loading}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
                    >
                        <TrendingUp className="h-4 w-4" />
                        <span>Sales Report</span>
                    </Button>
                    <Button
                        onClick={() => handleExportPDF('inventory')}
                        disabled={exporting || loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                    >
                        <Package className="h-4 w-4" />
                        <span>Inventory Report</span>
                    </Button>
                </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-2">
                {/* Sales Trends */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Sales Trends Over Time</h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportChartPDF('sales')}
                            disabled={exporting || loading}
                            className="flex items-center space-x-1"
                        >
                            <Download className="h-3 w-3" />
                            <span>Export Chart</span>
                        </Button>
                    </div>
                    <p className="text-2xl font-bold">
                        {salesData.reduce((sum, item) => sum + item.sales, 0).toLocaleString()} FCFA
                    </p>
                    <p className="text-sm text-green-600">Last 6 Months</p>
                    <div id="sales-chart" ref={salesChartRef} className="mt-6 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`${value} FCFA`, 'Sales']} />
                                <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Popular Medicines */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Popular Medicines</h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportChartPDF('popular')}
                            disabled={exporting || loading}
                            className="flex items-center space-x-1"
                        >
                            <Download className="h-3 w-3" />
                            <span>Export Chart</span>
                        </Button>
                    </div>
                    <p className="text-2xl font-bold">
                        {popularMedicines.length} Medicines
                    </p>
                    <p className="text-sm text-green-600">Top 5 by Quantity Sold</p>
                    <div id="popular-medicines" ref={popularMedicinesRef} className="mt-6 space-y-4">
                        {popularMedicines.map(med => {
                            const maxSold = Math.max(...popularMedicines.map(m => m.totalSold));
                            return (
                                <div key={med.medicineId}>
                                    <div className="flex justify-between text-sm">
                                        <span>{med.medicineName}</span>
                                        <span>{med.totalSold} units</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                        <div
                                            className="bg-green-600 h-2.5 rounded-full"
                                            style={{ width: `${(med.totalSold / maxSold) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
                {/* Order Fulfillment */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-800">Order Fulfillment Rate</h2>
                    <p className="text-4xl font-bold">
                        {fulfillmentRate ? `${fulfillmentRate.fulfillmentRate.toFixed(1)}%` : '0%'}
                    </p>
                    <p className="text-sm text-green-600">
                        {fulfillmentRate ? `${fulfillmentRate.deliveredOrders} of ${fulfillmentRate.totalOrders} orders delivered` : 'No data'}
                    </p>
                </div>

                {/* Inventory Turnover */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-800">Inventory Turnover Ratio</h2>
                    <p className="text-4xl font-bold">
                        {inventoryTurnover ? inventoryTurnover.turnoverRatio.toFixed(1) : '0.0'}
                    </p>
                    <p className="text-sm text-green-600">
                        {inventoryTurnover ? `${inventoryTurnover.totalSalesValue.toLocaleString()} FCFA in sales` : 'No data'}
                    </p>
                </div>
            </div>

            {/* Customizable Reports */}
            <div className="mt-12 bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-semibold text-gray-800">Customizable Reports</h2>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <input
                        type="date"
                        className="p-3 border-gray-300 rounded-md"
                        placeholder="Start Date"
                        value={customFilters.startDate}
                        onChange={(e) => setCustomFilters({ ...customFilters, startDate: e.target.value })}
                    />
                    <input
                        type="date"
                        className="p-3 border-gray-300 rounded-md"
                        placeholder="End Date"
                        value={customFilters.endDate}
                        onChange={(e) => setCustomFilters({ ...customFilters, endDate: e.target.value })}
                    />
                    <select
                        className="p-3 border-gray-300 rounded-md"
                        value={customFilters.category}
                        onChange={(e) => setCustomFilters({ ...customFilters, category: e.target.value })}
                    >
                        <option value="">All Categories</option>
                        <option value="Pain Relief">Pain Relief</option>
                        <option value="Antibiotic">Antibiotic</option>
                        <option value="Diabetes">Diabetes</option>
                        <option value="Cardiovascular">Cardiovascular</option>
                    </select>
                    <select
                        className="p-3 border-gray-300 rounded-md"
                        value={customFilters.status}
                        onChange={(e) => setCustomFilters({ ...customFilters, status: e.target.value })}
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <Button
                        variant="outline"
                        onClick={handleGenerateCustomReport}
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                    </Button>
                    <Button
                        onClick={() => handleExportPDF('custom')}
                        disabled={exporting || loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                    >
                        <FileText className="h-4 w-4" />
                        <span>{exporting ? 'Exporting...' : 'Export Custom Report'}</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}

