import app from './app';
import prisma from './config/database';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║                🚀 MediStore Backend Started!             ║
╠══════════════════════════════════════════════════════════╣
║  🔗 Server URL: http://localhost:${PORT}                 ║
║  📚 API Base: http://localhost:${PORT}/api              ║
║  🩺 Health Check: http://localhost:${PORT}/api/health   ║
╠══════════════════════════════════════════════════════════╣
║                 📋 AVAILABLE ENDPOINTS                   ║
╠══════════════════════════════════════════════════════════╣
║  🔐 Auth: POST /api/auth/register, /api/auth/login      ║
║  💊 Medicines: GET /api/medicines, /api/medicines/:id   ║
║  🛒 Cart: GET/POST/PUT/DELETE /api/cart                 ║
║  📦 Orders: POST/GET /api/orders                        ║
║  🏪 Seller: /api/seller/* (requires SELLER role)        ║
║  👑 Admin: /api/admin/* (requires ADMIN role)           ║
╠══════════════════════════════════════════════════════════╣
║                 🔑 DEMO CREDENTIALS                      ║
╠══════════════════════════════════════════════════════════╣
║  👑 ADMIN:    admin@medistore.com / admin123            ║
║  🏪 SELLER:   seller@medistore.com / seller123          ║
║  👤 CUSTOMER: customer@medistore.com / customer123      ║
╚══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await prisma.$disconnect();
  console.log('✅ Database connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await prisma.$disconnect();
  console.log('✅ Database connection closed');
  process.exit(0);
});

startServer();