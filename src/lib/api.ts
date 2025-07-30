import { AuthService } from './auth';

const API_BASE_URL = 'http://localhost:8080';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...AuthService.getAuthHeaders(),
      ...options.headers,
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Đã xảy ra lỗi không xác định',
      }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[] | {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

// Entity Types
export interface Department {
  id: number;
  name: string;
  code_department: string;
  composite_code: string;
  address: string;
  address_code: string;
  createdAt: string;
  updatedAt: string;
  CashFlows?: CashFlow[];
}

export interface BudgetType {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  Budgets?: Budget[];
}

export interface Budget {
  id: number;
  name: string;
  code: string;
  budget_type_id: number;
  BudgetType?: BudgetType;
  createdAt: string;
  updatedAt: string;
  Transactions?: Transaction[];
}

export interface CashFlowType {
  id: number;
  name: string;
  code: string;
  parentId?: number;
  Parent?: CashFlowType;
  children?: CashFlowType[];
  createdAt: string;
  updatedAt: string;
  CashFlows?: CashFlow[];
}

export interface CashFlow {
  id: number;
  name: string;
  code: string;
  deparment_id: number;
  cash_flow_type_id: number;
  Department?: Department;
  CashFlowType?: CashFlowType;
  createdAt: string;
  updatedAt: string;
  Transactions?: Transaction[];
}

export interface Transaction {
  id: number;
  cash_flow_id: number;
  budget_id: number;
  description: string;
  amount: string;
  transaction_day: string;
  CashFlow?: CashFlow;
  Budget?: Budget;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Types
export interface DashboardOverview {
  overview: {
    totalTransactions: number;
    totalAmount: number;
  };
  departmentStats: Array<{
    totalAmount: string;
    transactionCount: string;
    'CashFlow.Department.id': number;
    'CashFlow.Department.name': string;
    'CashFlow.Department.code_department': string;
  }>;
  budgetTypeStats: Array<{
    totalAmount: string;
    transactionCount: string;
    'Budget.BudgetType.id': number;
    'Budget.BudgetType.name': string;
  }>;
}

export interface TrendData {
  period: string;
  totalAmount: string;
  transactionCount: string;
}

// Service Classes
export class DepartmentService {
  static async getAll(params?: { page?: number; limit?: number; search?: string }) {
    return apiClient.get<PaginatedResponse<Department>>('/api/department', params);
  }

  static async getById(id: number) {
    return apiClient.get<ApiResponse<Department>>(`/api/department/${id}`);
  }

  static async create(data: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>) {
    return apiClient.post<ApiResponse<Department>>('/api/department', data);
  }

  static async update(id: number, data: Partial<Department>) {
    return apiClient.put<ApiResponse<Department>>(`/api/department/${id}`, data);
  }

  static async delete(id: number) {
    return apiClient.delete<ApiResponse<null>>(`/api/department/${id}`);
  }
}

export class BudgetTypeService {
  static async getAll(params?: { page?: number; limit?: number; search?: string }) {
    return apiClient.get<PaginatedResponse<BudgetType>>('/api/budget-type', params);
  }

  static async getById(id: number) {
    return apiClient.get<ApiResponse<BudgetType>>(`/api/budget-type/${id}`);
  }

  static async create(data: Omit<BudgetType, 'id' | 'createdAt' | 'updatedAt'>) {
    return apiClient.post<ApiResponse<BudgetType>>('/api/budget-type', data);
  }

  static async update(id: number, data: Partial<BudgetType>) {
    return apiClient.put<ApiResponse<BudgetType>>(`/api/budget-type/${id}`, data);
  }

  static async delete(id: number) {
    return apiClient.delete<ApiResponse<null>>(`/api/budget-type/${id}`);
  }
}

export class BudgetService {
  static async getAll(params?: { page?: number; limit?: number; search?: string; budget_type_id?: number }) {
    return apiClient.get<PaginatedResponse<Budget>>('/api/budget', params);
  }

  static async getById(id: number) {
    return apiClient.get<ApiResponse<Budget>>(`/api/budget/${id}`);
  }

  static async create(data: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) {
    return apiClient.post<ApiResponse<Budget>>('/api/budget', data);
  }

  static async update(id: number, data: Partial<Budget>) {
    return apiClient.put<ApiResponse<Budget>>(`/api/budget/${id}`, data);
  }

  static async delete(id: number) {
    return apiClient.delete<ApiResponse<null>>(`/api/budget/${id}`);
  }
}

export class CashFlowTypeService {
  static async getAll(params?: { page?: number; limit?: number; search?: string; parentId?: number }) {
    return apiClient.get<PaginatedResponse<CashFlowType>>('/api/cash-flow-type', params);
  }

  static async getById(id: number) {
    return apiClient.get<ApiResponse<CashFlowType>>(`/api/cash-flow-type/${id}`);
  }

  static async create(data: Omit<CashFlowType, 'id' | 'createdAt' | 'updatedAt'>) {
    return apiClient.post<ApiResponse<CashFlowType>>('/api/cash-flow-type', data);
  }

  static async update(id: number, data: Partial<CashFlowType>) {
    return apiClient.put<ApiResponse<CashFlowType>>(`/api/cash-flow-type/${id}`, data);
  }

  static async delete(id: number) {
    return apiClient.delete<ApiResponse<null>>(`/api/cash-flow-type/${id}`);
  }
}

export class CashFlowService {
  static async getAll(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    deparment_id?: number; 
    cash_flow_type_id?: number;
  }) {
    return apiClient.get<PaginatedResponse<CashFlow>>('/api/cash-flow', params);
  }

  static async getById(id: number) {
    return apiClient.get<ApiResponse<CashFlow>>(`/api/cash-flow/${id}`);
  }

  static async create(data: Omit<CashFlow, 'id' | 'createdAt' | 'updatedAt'>) {
    return apiClient.post<ApiResponse<CashFlow>>('/api/cash-flow', data);
  }

  static async update(id: number, data: Partial<CashFlow>) {
    return apiClient.put<ApiResponse<CashFlow>>(`/api/cash-flow/${id}`, data);
  }

  static async delete(id: number) {
    return apiClient.delete<ApiResponse<null>>(`/api/cash-flow/${id}`);
  }
}

export class TransactionService {
  static async getAll(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    cash_flow_id?: number; 
    budget_id?: number;
    start_date?: string;
    end_date?: string;
  }) {
    return apiClient.get<PaginatedResponse<Transaction>>('/api/transaction', params);
  }

  static async getById(id: number) {
    return apiClient.get<ApiResponse<Transaction>>(`/api/transaction/${id}`);
  }

  static async create(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) {
    return apiClient.post<ApiResponse<Transaction>>('/api/transaction', data);
  }

  static async update(id: number, data: Partial<Transaction>) {
    return apiClient.put<ApiResponse<Transaction>>(`/api/transaction/${id}`, data);
  }

  static async delete(id: number) {
    return apiClient.delete<ApiResponse<null>>(`/api/transaction/${id}`);
  }
}

export class DashboardService {
  static async getOverview(params?: { 
    start_date?: string; 
    end_date?: string; 
    deparment_id?: number; 
  }) {
    return apiClient.get<ApiResponse<DashboardOverview>>('/api/dashboard/overview', params);
  }

  static async getTrends(params?: { 
    period?: 'day' | 'week' | 'month' | 'year';
    start_date?: string; 
    end_date?: string; 
    deparment_id?: number; 
  }) {
    return apiClient.get<ApiResponse<{ trends: TrendData[]; period: string; summary: any }>>('/api/dashboard/trends', params);
  }

  static async getCashFlowStats(params?: { 
    start_date?: string; 
    end_date?: string; 
    deparment_id?: number; 
  }) {
    return apiClient.get<ApiResponse<any>>('/api/dashboard/cashflow-stats', params);
  }

  static async getTopDepartments(params?: { 
    limit?: number;
    start_date?: string; 
    end_date?: string; 
  }) {
    return apiClient.get<ApiResponse<any>>('/api/dashboard/top-departments', params);
  }

  static async getBudgetUtilization(params?: { 
    start_date?: string; 
    end_date?: string; 
    budget_type_id?: number; 
  }) {
    return apiClient.get<ApiResponse<any>>('/api/dashboard/budget-utilization', params);
  }
}