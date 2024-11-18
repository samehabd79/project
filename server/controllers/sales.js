import { db } from '../db.js';
import { z } from 'zod';

const saleItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive()
});

const saleSchema = z.object({
  customerId: z.string(),
  items: z.array(saleItemSchema),
  date: z.string().datetime(),
  status: z.enum(['pending', 'completed', 'cancelled']).default('completed')
});

export async function getSales(req, res) {
  try {
    const result = await db.execute(`
      SELECT s.*, c.name as customer_name, c.email as customer_email
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      ORDER BY s.date DESC
    `);
    
    const sales = await Promise.all(result.rows.map(async (sale) => {
      const items = await db.execute({
        sql: `
          SELECT si.*, p.name as product_name, p.sku
          FROM sale_items si
          JOIN products p ON si.product_id = p.id
          WHERE si.sale_id = ?
        `,
        args: [sale.id]
      });
      
      return {
        ...sale,
        items: items.rows
      };
    }));
    
    res.json(sales);
  } catch (error) {
    console.error('Failed to get sales:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function createSale(req, res) {
  try {
    const saleData = saleSchema.parse(req.body);
    const id = crypto.randomUUID();
    
    // Calculate total from items
    let total = 0;
    const itemsWithPrices = await Promise.all(saleData.items.map(async (item) => {
      const product = await db.execute({
        sql: 'SELECT price FROM products WHERE id = ?',
        args: [item.productId]
      });
      
      if (!product.rows.length) {
        throw new Error(`Product ${item.productId} not found`);
      }
      
      const itemTotal = product.rows[0].price * item.quantity;
      total += itemTotal;
      
      return {
        ...item,
        price: product.rows[0].price
      };
    }));
    
    // Create sale record
    await db.execute({
      sql: `INSERT INTO sales (id, customer_id, date, total, status)
            VALUES (?, ?, ?, ?, ?)`,
      args: [id, saleData.customerId, saleData.date, total, saleData.status]
    });
    
    // Create sale items
    await Promise.all(itemsWithPrices.map(item =>
      db.execute({
        sql: `INSERT INTO sale_items (id, sale_id, product_id, quantity, price)
              VALUES (?, ?, ?, ?, ?)`,
        args: [crypto.randomUUID(), id, item.productId, item.quantity, item.price]
      })
    ));
    
    // Update product stock
    await Promise.all(itemsWithPrices.map(item =>
      db.execute({
        sql: `UPDATE products 
              SET stock = stock - ?
              WHERE id = ?`,
        args: [item.quantity, item.productId]
      })
    ));
    
    res.status(201).json({ id });
  } catch (error) {
    console.error('Failed to create sale:', error);
    res.status(400).json({ error: error.message });
  }
}