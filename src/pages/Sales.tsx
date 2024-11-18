import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, FileText } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Sale, Customer, Product } from '../types';
import NewSaleModal from '../components/Modals/NewSaleModal';
import { fetchCustomers, fetchProducts, createSale } from '../lib/api';
import { subscribeToData } from '../lib/firebase';

const Sales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInitialData();
    const unsubscribe = subscribeToData('sales', setSales, 'date');
    return () => unsubscribe();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [customersData, productsData] = await Promise.all([
        fetchCustomers(),
        fetchProducts()
      ]);
      setCustomers(customersData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load required data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSale = async (saleData: any) => {
    try {
      const response = await createSale(saleData);
      toast.success('Sale created successfully!');
      setIsNewSaleModalOpen(false);
      
      // Refresh products to get updated stock levels
      const updatedProducts = await fetchProducts();
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error creating sale:', error);
      toast.error('Failed to create sale');
    }
  };

  const filteredSales = sales.filter(sale => {
    const customer = customers.find(c => c.id === sale.customerId);
    return customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           sale.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-500">Manage your sales transactions</p>
        </div>
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={() => setIsNewSaleModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          New Sale
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sales..."
              className="pl-10 input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSales.map((sale) => {
                const customer = customers.find(c => c.id === sale.customerId);
                return (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(sale.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {customer?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.items.length} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${sale.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <FileText className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <NewSaleModal
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
        onSubmit={handleNewSale}
        products={products}
        customers={customers}
      />
    </div>
  );
};

export default Sales;