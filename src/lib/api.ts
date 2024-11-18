import { 
  getData, 
  getOrderedData, 
  createData, 
  updateData, 
  deleteData 
} from './firebase';
import { Product, Customer, Sale } from '../types';

// Products
export async function fetchProducts() {
  try {
    return await getData('products') as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
}

export async function createProduct(product: Omit<Product, 'id'>) {
  try {
    return await createData('products', product);
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product');
  }
}

export async function updateProduct(id: string, product: Omit<Product, 'id'>) {
  try {
    return await updateData('products', id, product);
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
}

export async function deleteProduct(id: string) {
  try {
    return await deleteData('products', id);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
}

// Customers
export async function fetchCustomers() {
  try {
    return await getData('customers') as Customer[];
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw new Error('Failed to fetch customers');
  }
}

export async function createCustomer(customer: Omit<Customer, 'id'>) {
  try {
    return await createData('customers', customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    throw new Error('Failed to create customer');
  }
}

export async function updateCustomer(id: string, customer: Omit<Customer, 'id'>) {
  try {
    return await updateData('customers', id, customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    throw new Error('Failed to update customer');
  }
}

export async function deleteCustomer(id: string) {
  try {
    return await deleteData('customers', id);
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw new Error('Failed to delete customer');
  }
}

// Sales
export async function fetchSales() {
  try {
    return await getOrderedData('sales', 'date') as Sale[];
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw new Error('Failed to fetch sales');
  }
}

export async function createSale(sale: Omit<Sale, 'id' | 'total' | 'status'>) {
  try {
    // Calculate total from items
    const products = await fetchProducts();
    const total = sale.items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      return sum + (product.price * item.quantity);
    }, 0);

    const saleData = {
      ...sale,
      total,
      status: 'completed' as const,
      date: new Date().toISOString()
    };

    const newSale = await createData('sales', saleData);

    // Update product stock
    await Promise.all(sale.items.map(async (item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      
      await updateProduct(item.productId, {
        ...product,
        stock: product.stock - item.quantity
      });
    }));

    return newSale;
  } catch (error) {
    console.error('Error creating sale:', error);
    throw new Error('Failed to create sale');
  }
}