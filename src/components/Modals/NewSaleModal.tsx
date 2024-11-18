import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Product, Customer } from '../../types';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (saleData: any) => void;
  products: Product[];
  customers: Customer[];
}

const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  products,
  customers,
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate customer selection
    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }

    // Validate items
    if (items.length === 0) {
      setError('Please add at least one item');
      return;
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId) {
        setError('Please select a product for all items');
        return;
      }

      const product = products.find(p => p.id === item.productId);
      if (!product) {
        setError('Invalid product selected');
        return;
      }

      if (item.quantity > product.stock) {
        setError(`Insufficient stock for ${product.name}`);
        return;
      }
    }

    onSubmit({
      customerId: selectedCustomer,
      items,
      date: new Date().toISOString(),
    });

    // Reset form
    setSelectedCustomer('');
    setItems([]);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">New Sale</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer
            </label>
            <select
              className="input"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              required
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.email})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Items
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="btn btn-secondary flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <select
                  className="input flex-1"
                  value={item.productId}
                  onChange={(e) =>
                    setItems(
                      items.map((i, idx) =>
                        idx === index ? { ...i, productId: e.target.value } : i
                      )
                    )
                  }
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option 
                      key={product.id} 
                      value={product.id}
                      disabled={product.stock === 0}
                    >
                      {product.name} - ${product.price} ({product.stock} in stock)
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  max={item.productId ? products.find(p => p.id === item.productId)?.stock : undefined}
                  className="input w-24"
                  value={item.quantity}
                  onChange={(e) =>
                    setItems(
                      items.map((i, idx) =>
                        idx === index
                          ? { ...i, quantity: parseInt(e.target.value) || 1 }
                          : i
                      )
                    )
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="text-right mb-4">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="ml-2 text-lg font-bold">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewSaleModal;