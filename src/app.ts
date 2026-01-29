import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import medicineRoutes from './routes/medicine.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import sellerRoutes from './routes/seller.routes';
import adminRoutes from './routes/admin.routes';
import errorHandler from './middleware/errorHandler';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes (EXACTLY as per requirements)
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'MediStore API',
    version: '1.0.0'
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '👋 Welcome to MediStore Server',
    version: '1.0.0',
    endpoints: {
      auth: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/auth/me'],
      medicines: ['GET /api/medicines', 'GET /api/medicines/:id', 'GET /api/medicines/categories'],
      cart: ['GET /api/cart', 'POST /api/cart', 'PUT /api/cart/:id', 'DELETE /api/cart/:id'],
      orders: ['POST /api/orders', 'GET /api/orders', 'GET /api/orders/:id', 'POST /api/orders/:medicineId/review'],
      seller: ['GET /api/seller/medicines', 'POST /api/seller/medicines', 'PUT /api/seller/medicines/:id', 'DELETE /api/seller/medicines/:id', 'GET /api/seller/orders', 'PATCH /api/seller/orders/:id/status'],
      admin: ['GET /api/admin/users', 'PATCH /api/admin/users/:id/status', 'GET /api/admin/orders', 'GET /api/admin/medicines', 'DELETE /api/admin/medicines/:id', 'GET /api/admin/categories', 'POST /api/admin/categories', 'PUT /api/admin/categories/:id', 'DELETE /api/admin/categories/:id']
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use(errorHandler);

export default app;