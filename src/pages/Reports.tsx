import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Download } from 'lucide-react';
import { subscribeToData } from '../lib/firebase';
import { Sale, Product } from '../types';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

const Reports = () => {
  const [dateRange, setDateRange] = useState('month');
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const unsubSales = subscribeToData('sales', setSales, 'date');
    const unsubProducts = subscribeToData('products', setProducts);

    return () => {
      unsubSales();
      unsubProducts();
    };
  }, []);

  const getFilteredSales = () => {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = subDays(now, 30);
        break;
      case 'year':
        startDate = subDays(now, 365);
        break;
      default:
        startDate = subDays(now, 30);
    }

    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return isWithinInterval(saleDate, {
        start: startOfDay(startDate),
        end: endOfDay(now)
      });
    });
  };

  const calculateMetrics = () => {
    const filteredSales = getFilteredSales();
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const averageOrderValue = filteredSales.length > 0 
      ? totalRevenue / filteredSales.length 
      : 0;

    // Calculate sales by category
    const categoryData = new Map<string, number>();
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const current = categoryData.get(product.category) || 0;
          categoryData.set(product.category, current + (item.price * item.quantity));
        }
      });
    });

    // Calculate daily sales for chart
    const dailySales = new Map<string, number>();
    filteredSales.forEach(sale => {
      const date = format(new Date(sale.date), 'MMM d');
      const current = dailySales.get(date) || 0;
      dailySales.set(date, current + sale.total);
    });

    return {
      totalRevenue,
      averageOrderValue,
      conversionRate: 3.2, // This would need actual visitor data to calculate
      categoryData: Array.from(categoryData.entries()).map(([name, value]) => ({
        name,
        value
      })),
      dailySales: Array.from(dailySales.entries()).map(([name, sales]) => ({
        name,
        sales
      }))
    };
  };

  const metrics = calculateMetrics();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleExport = () => {
    const filteredSales = getFilteredSales();
    const csvContent = [
      ['Date', 'Customer ID', 'Items', 'Total'],
      ...filteredSales.map(sale => [
        format(new Date(sale.date), 'yyyy-MM-dd HH:mm:ss'),
        sale.customerId,
        sale.items.length,
        sale.total
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${dateRange}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">View your business analytics and reports</p>
        </div>
        <div className="flex gap-4">
          <select
            className="input"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button 
            className="btn btn-primary flex items-center gap-2"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar 
                  dataKey="sales" 
                  fill="#3B82F6" 
                  name="Sales"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                label: 'Total Revenue', 
                value: `$${metrics.totalRevenue.toFixed(2)}`,
                change: '+12.5%' 
              },
              { 
                label: 'Average Order Value', 
                value: `$${metrics.averageOrderValue.toFixed(2)}`,
                change: '+5.2%' 
              },
              { 
                label: 'Conversion Rate', 
                value: `${metrics.conversionRate}%`,
                change: '+2.4%' 
              },
            ].map((metric, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                <p className="text-sm text-green-600 mt-1">{metric.change}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;