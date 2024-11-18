import { db } from '../db.js';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional()
});

export async function getCustomers(req, res) {
  try {
    const result = await db.execute('SELECT * FROM customers');
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to get customers:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function createCustomer(req, res) {
  try {
    const customer = customerSchema.parse(req.body);
    const id = crypto.randomUUID();
    
    await db.execute({
      sql: `INSERT INTO customers (id, name, email, phone, address)
            VALUES (?, ?, ?, ?, ?)`,
      args: [id, customer.name, customer.email, customer.phone || null, customer.address || null]
    });
    
    res.status(201).json({ id });
  } catch (error) {
    console.error('Failed to create customer:', error);
    res.status(400).json({ error: error.message });
  }
}

export async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const customer = customerSchema.parse(req.body);
    
    await db.execute({
      sql: `UPDATE customers 
            SET name = ?, email = ?, phone = ?, address = ?
            WHERE id = ?`,
      args: [customer.name, customer.email, customer.phone || null, customer.address || null, id]
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update customer:', error);
    res.status(400).json({ error: error.message });
  }
}

export async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;
    
    await db.execute({
      sql: 'DELETE FROM customers WHERE id = ?',
      args: [id]
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete customer:', error);
    res.status(400).json({ error: error.message });
  }
}