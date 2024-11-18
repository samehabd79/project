import { createClient } from '@libsql/client';

// Create a Turso-compatible database client
const db = createClient({
  url: 'file:local.db',
});

export async function initializeDatabase() {
  try {
    // Create products table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        category TEXT NOT NULL,
        description TEXT
      )
    `);

    // Create customers table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        address TEXT
      )
    `);

    // Create sales table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        date TEXT NOT NULL,
        total REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        FOREIGN KEY (customer_id) REFERENCES customers (id)
      )
    `);

    // Create sale_items table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY,
        sale_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `);

    // Add some initial data if tables are empty
    const productsCount = await db.execute('SELECT COUNT(*) as count FROM products');
    if (productsCount.rows[0].count === 0) {
      await db.execute(`
        INSERT INTO products (id, name, sku, price, stock, category, description)
        VALUES 
          ('1', 'Laptop Pro X1', 'LAP-001', 1299.99, 50, 'Electronics', 'High-performance laptop'),
          ('2', 'Wireless Mouse', 'MOU-001', 29.99, 100, 'Electronics', 'Ergonomic wireless mouse')
      `);
    }

    const customersCount = await db.execute('SELECT COUNT(*) as count FROM customers');
    if (customersCount.rows[0].count === 0) {
      await db.execute(`
        INSERT INTO customers (id, name, email, phone, address)
        VALUES 
          ('1', 'John Doe', 'john@example.com', '+1 234-567-8900', '123 Main St'),
          ('2', 'Jane Smith', 'jane@example.com', '+1 234-567-8901', '456 Oak Ave')
      `);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export { db };