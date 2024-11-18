import { db } from '../db.js';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional()
});

export async function getProducts(req, res) {
  try {
    const result = await db.execute('SELECT * FROM products ORDER BY name ASC');
    if (!result?.rows) {
      throw new Error('No data returned from database');
    }
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to get products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

export async function createProduct(req, res) {
  try {
    const product = productSchema.parse(req.body);
    const id = crypto.randomUUID();
    
    // Check if SKU already exists
    const existingSku = await db.execute({
      sql: 'SELECT id FROM products WHERE sku = ?',
      args: [product.sku]
    });

    if (existingSku.rows.length > 0) {
      return res.status(400).json({ error: 'SKU already exists' });
    }
    
    await db.execute({
      sql: `INSERT INTO products (id, name, sku, price, stock, category, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, product.name, product.sku, product.price, product.stock, product.category, product.description || null]
    });
    
    const newProduct = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id]
    });
    
    if (!newProduct?.rows?.[0]) {
      throw new Error('Failed to retrieve created product');
    }
    
    res.status(201).json(newProduct.rows[0]);
  } catch (error) {
    console.error('Failed to create product:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      res.status(400).json({ error: 'Failed to create product' });
    }
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const product = productSchema.parse(req.body);
    
    // Check if product exists
    const existingProduct = await db.execute({
      sql: 'SELECT id FROM products WHERE id = ?',
      args: [id]
    });

    if (!existingProduct?.rows?.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if SKU is unique (excluding current product)
    const existingSku = await db.execute({
      sql: 'SELECT id FROM products WHERE sku = ? AND id != ?',
      args: [product.sku, id]
    });

    if (existingSku.rows?.length > 0) {
      return res.status(400).json({ error: 'SKU already exists' });
    }
    
    await db.execute({
      sql: `UPDATE products 
            SET name = ?, sku = ?, price = ?, stock = ?, category = ?, description = ?
            WHERE id = ?`,
      args: [product.name, product.sku, product.price, product.stock, product.category, product.description || null, id]
    });
    
    const updatedProduct = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id]
    });
    
    if (!updatedProduct?.rows?.[0]) {
      throw new Error('Failed to retrieve updated product');
    }
    
    res.json(updatedProduct.rows[0]);
  } catch (error) {
    console.error('Failed to update product:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      res.status(400).json({ error: 'Failed to update product' });
    }
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const existingProduct = await db.execute({
      sql: 'SELECT id FROM products WHERE id = ?',
      args: [id]
    });

    if (!existingProduct?.rows?.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product is used in any sales
    const usedInSales = await db.execute({
      sql: 'SELECT id FROM sale_items WHERE product_id = ? LIMIT 1',
      args: [id]
    });

    if (usedInSales.rows?.length > 0) {
      return res.status(400).json({ error: 'Cannot delete product that has been sold' });
    }
    
    await db.execute({
      sql: 'DELETE FROM products WHERE id = ?',
      args: [id]
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    res.status(400).json({ error: 'Failed to delete product' });
  }
}