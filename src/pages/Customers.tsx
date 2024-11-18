import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { Customer } from '../types';
import NewCustomerModal from '../components/Modals/NewCustomerModal';
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '../lib/api';

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewCustomer = async (customerData: Omit<Customer, 'id'>) => {
    try {
      const response = await createCustomer(customerData);
      setCustomers([...customers, { ...customerData, id: response.id }]);
      setIsNewCustomerModalOpen(false);
      toast.success('Customer added successfully!');
    } catch (error) {
      toast.error('Failed to add customer');
    }
  };

  const handleEditCustomer = async (id: string, customerData: Omit<Customer, 'id'>) => {
    try {
      await updateCustomer(id, customerData);
      setCustomers(customers.map(c => c.id === id ? { ...customerData, id } : c));
      setIsNewCustomerModalOpen(false);
      setEditingCustomer(null);
      toast.success('Customer updated successfully!');
    } catch (error) {
      toast.error('Failed to update customer');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      await deleteCustomer(id);
      setCustomers(customers.filter(c => c.id !== id));
      toast.success('Customer deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500">Manage your customer relationships</p>
        </div>
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={() => {
            setEditingCustomer(null);
            setIsNewCustomerModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              className="pl-10 input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading customers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="w-4 h-4" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <button 
                          className="p-1 hover:bg-gray-100 rounded"
                          onClick={() => {
                            setEditingCustomer(customer);
                            setIsNewCustomerModalOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button 
                          className="p-1 hover:bg-gray-100 rounded"
                          onClick={() => handleDeleteCustomer(customer.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => {
          setIsNewCustomerModalOpen(false);
          setEditingCustomer(null);
        }}
        onSubmit={(customerData) => {
          if (editingCustomer) {
            handleEditCustomer(editingCustomer.id, customerData);
          } else {
            handleNewCustomer(customerData);
          }
        }}
        editingCustomer={editingCustomer}
      />
    </div>
  );
};

export default Customers;