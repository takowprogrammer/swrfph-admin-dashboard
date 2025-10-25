const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Debug logging
console.log('🔧 API Configuration:', {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    API_BASE_URL: API_BASE_URL,
    fallbackUsed: !process.env.NEXT_PUBLIC_API_URL
});

export interface User {
    id: string;
    email: string;
    role: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

class ApiService {
    private baseURL = API_BASE_URL;

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        };

        const cleanBaseURL = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        const requestURL = `${cleanBaseURL}/${cleanEndpoint}`;

        console.log('🌐 API Request:', {
            baseURL: this.baseURL,
            cleanBaseURL,
            endpoint,
            cleanEndpoint,
            finalURL: requestURL,
            method: config.method || 'GET'
        });

        let response;
        try {
            response = await fetch(requestURL, config);
        } catch (fetchError: any) {
            console.error('❌ Fetch Error:', {
                error: fetchError.message,
                type: fetchError.name,
                requestURL,
                stack: fetchError.stack
            });
            throw new Error(`Network error: ${fetchError.message}. Check if the backend is running and CORS is configured.`);
        }

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired, try to refresh
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    // Retry the original request with new token
                    const newToken = localStorage.getItem('access_token');
                    config.headers = {
                        ...config.headers,
                        Authorization: `Bearer ${newToken}`,
                    };
                    const retryResponse = await fetch(requestURL, config);
                    if (!retryResponse.ok) {
                        let errorMessage = `API Error: ${retryResponse.status}`;
                        try {
                            const errorData = await retryResponse.json();
                            errorMessage = errorData.message || errorMessage;
                        } catch (e) {
                            // Ignore JSON parsing errors
                        }
                        throw new Error(errorMessage);
                    }
                    return retryResponse.json();
                } else {
                    // Refresh failed, redirect to login
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/admin-login';
                    throw new Error('Authentication failed');
                }
            }

            let errorMessage = `API Error: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Ignore JSON parsing errors
            }
            throw new Error(errorMessage);
        }

        return response.json();
    }

    private async refreshToken(): Promise<boolean> {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) return false;

        try {
            const cleanBaseURL = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
            const response = await fetch(`${cleanBaseURL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('access_token', data.access_token);
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }

        return false;
    }

    // Auth endpoints
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        return this.request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async logout(): Promise<void> {
        await this.request('/auth/logout', { method: 'POST' });
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    async getProfile(): Promise<User> {
        return this.request<User>('/auth/profile');
    }

    // Dashboard endpoints
    async getAdminStats() {
        return this.request('/dashboard/admin');
    }

    // Medicines endpoints
    async getMedicines(params?: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const queryString = queryParams.toString();
        return this.request(`/medicines${queryString ? `?${queryString}` : ''}`);
    }

    async createMedicine(medicineData: {
        name: string;
        description?: string;
        quantity: number;
        price: number;
        category?: string;
    }) {
        return this.request('/medicines', {
            method: 'POST',
            body: JSON.stringify(medicineData),
        });
    }

    async updateMedicine(id: string, medicineData: {
        name?: string;
        description?: string;
        quantity?: number;
        price?: number;
        category?: string;
    }) {
        return this.request(`/medicines/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(medicineData),
        });
    }

    async deleteMedicine(id: string) {
        return this.request(`/medicines/${id}`, {
            method: 'DELETE',
        });
    }

    // Orders endpoints
    async getOrders(params?: {
        page?: number;
        limit?: number;
        status?: string;
    }) {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const queryString = queryParams.toString();
        return this.request(`/orders${queryString ? `?${queryString}` : ''}`);
    }

    async updateOrderStatus(orderId: string, status: string) {
        return this.request(`/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    async getOrderStats() {
        return this.request('/orders/stats');
    }

    async getPastOrders(params?: {
        page?: number;
        limit?: number;
    }) {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const queryString = queryParams.toString();
        return this.request(`/orders/past${queryString ? `?${queryString}` : ''}`);
    }

    // User Management endpoints
    async getUsers(params?: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const queryString = queryParams.toString();
        return this.request(`/users${queryString ? `?${queryString}` : ''}`);
    }

    async createUser(userData: {
        name: string;
        email: string;
        password: string;
        role: string;
    }) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async updateUser(id: string, userData: {
        name?: string;
        email?: string;
        password?: string;
        role?: string;
    }) {
        return this.request(`/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(userData),
        });
    }

    async deleteUser(id: string) {
        return this.request(`/users/${id}`, {
            method: 'DELETE',
        });
    }

    async getUsersStats() {
        return this.request('/users/stats/overview');
    }

    // Notifications endpoints
    async getNotifications(params?: {
        page?: number;
        limit?: number;
        search?: string;
        type?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const queryString = queryParams.toString();
        return this.request(`/notifications${queryString ? `?${queryString}` : ''}`);
    }

    async createNotification(notificationData: {
        event: string;
        details: string;
        type: string;
    }) {
        return this.request('/notifications', {
            method: 'POST',
            body: JSON.stringify(notificationData),
        });
    }

    async markNotificationAsRead(id: string) {
        return this.request(`/notifications/${id}/read`, {
            method: 'PATCH',
        });
    }

    async markAllNotificationsAsRead() {
        return this.request('/notifications/read-all', {
            method: 'PATCH',
        });
    }

    async deleteNotification(id: string) {
        return this.request(`/notifications/${id}`, {
            method: 'DELETE',
        });
    }

    async getNotificationStats() {
        return this.request('/notifications/stats');
    }

    // Settings endpoints
    async getSettings() {
        return this.request('/settings');
    }

    async getSettingsByCategory(category: string) {
        return this.request(`/settings/category/${category}`);
    }

    async updateOrganizationSettings(settings: {
        orgName?: string;
        orgAddress?: string;
        orgContact?: string;
        orgPhone?: string;
    }) {
        return this.request('/settings/organization', {
            method: 'PATCH',
            body: JSON.stringify(settings),
        });
    }

    async updateNotificationSettings(settings: {
        emailAlerts?: boolean;
        smsAlerts?: boolean;
    }) {
        return this.request('/settings/notifications', {
            method: 'PATCH',
            body: JSON.stringify(settings),
        });
    }

    async updateGeneralSettings(settings: {
        language?: string;
        timezone?: string;
    }) {
        return this.request('/settings/general', {
            method: 'PATCH',
            body: JSON.stringify(settings),
        });
    }

    // Invoices endpoints
    async getInvoices() {
        return this.request('/invoices');
    }

    async createInvoice(invoiceData: {
        orderId: string;
        customerName: string;
        customerEmail: string;
        billingAddress: string;
        amount: number;
        tax?: number;
        discount?: number;
        totalAmount: number;
        dueDate: string;
    }) {
        return this.request('/invoices', {
            method: 'POST',
            body: JSON.stringify(invoiceData),
        });
    }

    async updateInvoiceStatus(id: string, status: string) {
        return this.request(`/invoices/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    async getInvoiceByOrderId(orderId: string) {
        return this.request(`/invoices/order/${orderId}`);
    }

    // Analytics endpoints
    async getSalesTrends(months?: number) {
        const query = months ? `?months=${months}` : '';
        const data = await this.request(`/analytics/revenue-trends${query}`);
        // Transform revenue data to sales data for the frontend
        if (Array.isArray(data)) {
            return data.map(item => ({
                month: item.month,
                sales: item.revenue
            }));
        }
        return data;
    }

    async getPopularMedicines(limit?: number) {
        const query = limit ? `?limit=${limit}` : '';
        const data = await this.request(`/analytics/medicine-performance${query}`);
        // Transform medicine performance data to popular medicines format
        if (Array.isArray(data)) {
            return data.map(item => ({
                medicineId: item.medicineId,
                medicineName: item.name,
                category: item.category,
                totalSold: item.sales,
                orderCount: item.sales // Using sales as order count for now
            }));
        }
        return data;
    }

    async getOrderFulfillmentRate() {
        // Mock data for now - this endpoint doesn't exist yet
        return Promise.resolve({
            data: {
                fulfillmentRate: 0.85,
                totalOrders: 0,
                deliveredOrders: 0
            }
        });
    }

    async getInventoryTurnoverRatio() {
        // Mock data for now - this endpoint doesn't exist yet
        return Promise.resolve({
            data: {
                turnoverRatio: 2.3,
                totalSalesValue: 0
            }
        });
    }

    async getMonthlyRevenue(months?: number) {
        const query = months ? `?months=${months}` : '';
        return this.request(`/analytics/revenue-trends${query}`);
    }

    async getCustomReport(filters: {
        startDate?: string;
        endDate?: string;
        category?: string;
        status?: string;
    }) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, value.toString());
            }
        });

        const queryString = queryParams.toString();
        return this.request(`/reports/custom${queryString ? `?${queryString}` : ''}`);
    }

    // Audit endpoints
    async getAuditLogs(params?: {
        page?: number;
        limit?: number;
        userId?: string;
        action?: string;
        resource?: string;
        severity?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
    }) {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }
        const queryString = queryParams.toString();
        return this.request(`/audit/logs${queryString ? `?${queryString}` : ''}`);
    }

    async getAuditStats() {
        return this.request('/audit/logs/stats');
    }

    async getSecurityEvents(params?: {
        page?: number;
        limit?: number;
        userId?: string;
        eventType?: string;
        severity?: string;
        resolved?: boolean;
        startDate?: string;
        endDate?: string;
    }) {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }
        const queryString = queryParams.toString();
        return this.request(`/audit/security-events${queryString ? `?${queryString}` : ''}`);
    }

    async getSecurityEventStats() {
        return this.request('/audit/security-events/stats');
    }

    async resolveSecurityEvent(id: string) {
        return this.request(`/audit/security-events/${id}/resolve`, {
            method: 'PATCH',
        });
    }

    // Reports endpoints
    async getReportTemplates(params?: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        isPublic?: boolean;
    }) {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }
        const queryString = queryParams.toString();
        return this.request(`/reports/templates${queryString ? `?${queryString}` : ''}`);
    }

    async createReportTemplate(data: {
        name: string;
        description?: string;
        category: string;
        isPublic?: boolean;
        config: any;
    }) {
        return this.request('/reports/templates', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getReports(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        format?: string;
    }) {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }
        const queryString = queryParams.toString();
        return this.request(`/reports${queryString ? `?${queryString}` : ''}`);
    }

    async createReport(data: {
        name: string;
        description?: string;
        templateId?: string;
        config: any;
        format: string;
        scheduledAt?: string;
        expiresAt?: string;
    }) {
        return this.request('/reports', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async generateReport(id: string) {
        return this.request(`/reports/${id}/generate`, {
            method: 'POST',
        });
    }

    async downloadReport(id: string) {
        return this.request(`/reports/${id}/download`);
    }

    async deleteReport(id: string) {
        return this.request(`/reports/${id}`, {
            method: 'DELETE',
        });
    }
}

export const apiService = new ApiService();
