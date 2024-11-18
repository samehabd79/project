import React, { useState, useEffect } from 'react';
import Stats from '../components/Dashboard/Stats';
import RecentSales from '../components/Dashboard/RecentSales';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { subscribeToData } from '../lib/firebase';
import { Sale, Product } from '../types';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const Dashboard = () => {
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubSales = subscribeToData('sales', (data) => setSalesData(data), 'date');
    const unsubProducts = subscribeToData('products', setProducts);

    // Cleanup subscriptions
    return () => {
      unsubSales();
      unsubProducts();
    };
  }, []);

  useEffect(() => {
    // Calculate monthly data for the chart
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      
      const monthlySales = salesData.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= start && saleDate <= end;
      });

      return {
        name: format(date, 'MMM yyyy'),
        sales: monthlySales.reduce((sum, sale) => sum + sale.total, 0),
        count: monthlySales.length
      };
    }).reverse();

    setMonthlyData(last6Months);
  }, [salesData]);

  const calculateStats = () => {
    const totalSales = salesData.length;
    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total, 0);
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Calculate product performance
    const productSales = new Map<string, number>();
    salesData.forEach(sale => {
      sale.items.forEach(item => {
        const current = productSales.get(item.productId) || 0;
        productSales.set(item.productId, current + item.quantity);
      });
    });

    const topProducts = Array.from(productSales.entries())
      .map(([id, quantity]) => ({
        product: products.find(p => p.id === id),
        quantity
      }))
      .filter(item => item.product)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      totalSales,
      totalRevenue,
      averageOrderValue,
      topProducts
    };
  };

  const stats = calculateStats();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
      </div>

      <Stats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                  name="Sales"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
          <div className="space-y-4">
            {stats.topProducts.map(({ product, quantity }) => (
              <div key={product?.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{product?.name}</p>
                  <p className="text-sm text-gray-500">{product?.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{quantity} units</p>
                  <p className="text-sm text-gray-500">${(product?.price || 0) * quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <RecentSales sales={salesData.slice(0, 5)} />
    </div>
  );
};

export default Dashboard;