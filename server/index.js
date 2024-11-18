import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db.js';
import productRoutes from './routes/products.js';
import customerRoutes from './routes/customers.js';
import salesRoutes from './routes/sales.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', salesRoutes);

// Serve static files from the React app
app.use(express.static(join(__dirname, '../dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.sendFile(join(__dirname, '../dist/index.html'));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Something went wrong!' 
  });
});

const PORT = process.env.PORT || 3000;

// Initialize database and start server
try {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}