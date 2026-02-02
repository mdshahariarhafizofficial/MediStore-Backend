import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user (REQUIRED: admin@medistore.com / admin123)
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@medistore.com',
      password: adminPassword,
      name: 'Admin User',
      role: Role.ADMIN,
      phone: '+8801234567890',
      address: '123 Admin Street, Dhaka, Bangladesh',
      photoUrl: 'https://i.pravatar.cc/300?img=1',
      isActive: true
    }
  });

  console.log('✅ Admin user created');

  // Create categories
  const categories = [
    { name: 'Pain Relief', description: 'Medicines for pain and fever' },
    { name: 'Cold & Cough', description: 'Medicines for cold, cough, and flu' },
    { name: 'First Aid', description: 'Bandages, antiseptics, and first aid supplies' },
    { name: 'Digestive Health', description: 'Medicines for stomach and digestive issues' },
    { name: 'Skin Care', description: 'Creams and ointments for skin conditions' },
    { name: 'Vitamins & Supplements', description: 'Nutritional supplements and vitamins' }
  ];

  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.create({
      data: category
    });
    createdCategories.push(created);
  }

  console.log(`✅ ${createdCategories.length} categories created`);

  // Create seller user
  const sellerPassword = await bcrypt.hash('seller123', 10);
  const seller = await prisma.user.create({
    data: {
      email: 'seller@medistore.com',
      password: sellerPassword,
      name: 'Seller User',
      role: Role.SELLER,
      phone: '+8801234567891',
      address: '456 Seller Road, Chittagong, Bangladesh',
      photoUrl: 'https://i.pravatar.cc/300?img=2',
      isActive: true
    }
  });

  console.log('✅ Seller user created');

  // Create customer user
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.create({
    data: {
      email: 'customer@medistore.com',
      password: customerPassword,
      name: 'Customer User',
      role: Role.CUSTOMER,
      phone: '+8801234567892',
      address: '789 Customer Lane, Sylhet, Bangladesh',
      photoUrl: 'https://i.pravatar.cc/300?img=3',
      isActive: true
    }
  });

  console.log('✅ Customer user created');

  // Create medicines
  const medicines = [
    {
      name: 'Paracetamol 500mg',
      description: 'For fever and pain relief. Effective for headaches and body pain.',
      price: 5.99,
      stock: 100,
      manufacturer: 'ACI Limited',
      expiryDate: new Date('2026-12-31'),
      categoryId: createdCategories[0].id,
      sellerId: seller.id,
      imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'
    },
    {
      name: 'Ibuprofen 400mg',
      description: 'Anti-inflammatory pain relief for arthritis and muscle pain.',
      price: 8.99,
      stock: 50,
      manufacturer: 'Square Pharmaceuticals',
      expiryDate: new Date('2026-12-31'),
      categoryId: createdCategories[0].id,
      sellerId: seller.id,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'
    },
    {
      name: 'Vitamin C 1000mg',
      description: 'Immune system support and antioxidant protection.',
      price: 12.99,
      stock: 200,
      manufacturer: 'Beximco Pharmaceuticals',
      expiryDate: new Date('2026-12-31'),
      categoryId: createdCategories[5].id,
      sellerId: seller.id,
      imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400'
    },
    {
      name: 'Cetirizine 10mg',
      description: 'Antihistamine for allergy relief and hay fever.',
      price: 6.99,
      stock: 150,
      manufacturer: 'Incepta Pharmaceuticals',
      expiryDate: new Date('2026-12-31'),
      categoryId: createdCategories[1].id,
      sellerId: seller.id,
      imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'
    },
    {
      name: 'Omeprazole 20mg',
      description: 'For acid reflux and heartburn relief.',
      price: 9.99,
      stock: 75,
      manufacturer: 'Drug International',
      expiryDate: new Date('2026-12-31'),
      categoryId: createdCategories[3].id,
      sellerId: seller.id,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'
    },
    {
      name: 'Aspirin 75mg',
      description: 'Blood thinner for heart health and pain relief.',
      price: 4.99,
      stock: 120,
      manufacturer: 'Renata Limited',
      expiryDate: new Date('2026-12-31'),
      categoryId: createdCategories[0].id,
      sellerId: seller.id,
      imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400'
    },
    {
      name: 'Amoxicillin 500mg',
      description: 'Antibiotic for bacterial infections.',
      price: 15.99,
      stock: 80,
      manufacturer: 'ACI Limited',
      expiryDate: new Date('2026-12-31'),
      categoryId: createdCategories[2].id,
      sellerId: seller.id,
      imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'
    },
    {
      name: 'Multivitamin Capsules',
      description: 'Complete daily vitamin supplement.',
      price: 18.99,
      stock: 150,
      manufacturer: 'Square Pharmaceuticals',
      expiryDate: new Date('2026-12-31'),
      categoryId: createdCategories[5].id,
      sellerId: seller.id,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'
    }
  ];

  for (const medicine of medicines) {
    await prisma.medicine.create({
      data: medicine
    });
  }

  console.log(`✅ ${medicines.length} medicines created`);

  // Create sample order for customer
  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      sellerId: seller.id,
      totalAmount: 24.97,
      shippingAddress: '789 Customer Lane, Sylhet, Bangladesh',
      phone: '+8801234567892',
      status: 'DELIVERED',
      paymentMethod: 'COD',
      items: {
        create: [
          {
            medicineId: (await prisma.medicine.findFirst({ where: { name: 'Paracetamol 500mg' } }))!.id,
            quantity: 2,
            price: 5.99
          },
          {
            medicineId: (await prisma.medicine.findFirst({ where: { name: 'Vitamin C 1000mg' } }))!.id,
            quantity: 1,
            price: 12.99
          }
        ]
      }
    }
  });

  console.log('✅ Sample order created');

  // Create review for delivered order
  await prisma.review.create({
    data: {
      medicineId: (await prisma.medicine.findFirst({ where: { name: 'Paracetamol 500mg' } }))!.id,
      customerId: customer.id,
      rating: 5,
      comment: 'Very effective for headaches!'
    }
  });

  console.log('✅ Sample review created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 LOGIN CREDENTIALS:');
  console.log('====================');
  console.log('👑 ADMIN:    admin@medistore.com / admin123');
  console.log('🏪 SELLER:   seller@medistore.com / seller123');
  console.log('👤 CUSTOMER: customer@medistore.com / customer123');
  console.log('\n📊 STATISTICS:');
  console.log('=============');
  console.log(`👥 Users: ${await prisma.user.count()}`);
  console.log(`💊 Medicines: ${await prisma.medicine.count()}`);
  console.log(`📂 Categories: ${await prisma.category.count()}`);
  console.log(`📦 Orders: ${await prisma.order.count()}`);
  console.log(`⭐ Reviews: ${await prisma.review.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });