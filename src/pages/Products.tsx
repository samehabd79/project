import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../lib/api';
import toast from 'react-hot-toast';
import NewProductModal from '../components/Modals/NewProductModal';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching products...');
      const data = await fetchProducts();
      console.log('Products fetched:', data);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      console.log('Creating new product:', productData);
      const response = await createProduct(productData);
      console.log('Product created:', response);
      
      if (response.id) {
        setProducts([...products, { ...productData, id: response.id }]);
        setIsNewProductModalOpen(false);
        toast.success('Product added successfully');
      } else {
        throw new Error('No ID returned from create operation');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const handleEditProduct = async (id: string, productData: Omit<Product, 'id'>) => {
    try {
      console.log('Updating product:', id, productData);
      await updateProduct(id, productData);
      setProducts(products.map(p => p.id === id ? { ...productData, id } : p));
      setIsNewProductModalOpen(false);
      setEditingProduct(null);
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      console.log('Deleting product:', id);
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500">Manage your product inventory</p>
        </div>
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={() => {
            setEditingProduct(null);
            setIsNewProductModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading products...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.stock > 10 
                          ? 'bg-green-100 text-green-800'
                          : product.stock > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <button 
                          className="p-1 hover:bg-gray-100 rounded"
                          onClick={() => {
                            setEditingProduct(product);
                            setIsNewProductModalOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button 
                          className="p-1 hover:bg-gray-100 rounded"
                          onClick={() => handleDeleteProduct(product.id)}
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

      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => {
          setIsNewProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={(productData) => {
          if (editingProduct) {
            handleEditProduct(editingProduct.id, productData);
          } else {
            handleNewProduct(productData);
          }
        }}
        editingProduct={editingProduct}
      />
    </div>
  );
};

export default Products;