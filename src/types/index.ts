export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  customerId: string;
  date: string;
  items: SaleItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: Product[];
}