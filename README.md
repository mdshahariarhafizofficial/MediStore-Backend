# 🏥 MediStore - Online Medicine Shop

A comprehensive full-stack web application for buying and selling medicines online. MediStore connects customers with medicine sellers and provides admin controls for managing the platform.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Roles & Permissions](#roles--permissions)
- [Database Schema Overview](#database-schema-overview)
- [API Endpoints Overview](#api-endpoints-overview)
- [Installation & Setup Instructions](#installation--setup-instructions)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Deployment Instructions](#deployment-instructions)
- [Admin Credentials](#admin-credentials)
- [License](#license)

---

## 🎯 Project Overview

MediStore is a multi-role e-commerce platform specifically designed for the pharmaceutical industry. It enables:

- **Customers** to browse, search, and purchase medicines from multiple sellers
- **Sellers** to list and manage their medicine inventory and fulfill orders
- **Admins** to oversee the entire platform, manage users, categories, and ensure compliance

The platform uses JWT-based authentication, role-based authorization, and PostgreSQL for reliable data management.

---

## ✨ Features

### Public Features
- 🔍 Browse all available medicines
- 📦 View medicine details and categories
- 👤 Create customer or seller account
- 🔐 User authentication (login/logout)

### Customer Features
- 🛒 Add medicines to cart
- 💰 Place orders from multiple sellers
- 📋 View order history and status tracking
- ⭐ Leave reviews and ratings for medicines
- 📝 Manage profile information
- ❌ Cancel orders

### Seller Features
- 📊 Add, update, and delete medicines from inventory
- 💼 View all their medicines
- 📦 Manage orders received
- 📈 Update order status (Processing, Shipped, Delivered)
- 👁️ Monitor seller dashboard

### Admin Features
- 👥 Manage all users (activate/deactivate)
- 📋 Create and manage medicine categories
- 🏥 View and delete medicines
- 📦 Oversee all orders and update status
- 🔑 Reset user passwords
- 🚫 Delete users or orders when necessary

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js (v4.18.2)
- **ORM:** Prisma (v6.19.2)
- **Authentication:** JWT (jsonwebtoken v9.0.2)
- **Password Hashing:** bcryptjs (v2.4.3)
- **Validation:** Zod (v4.3.6)
- **CORS:** cors (v2.8.5)

### Database
- **Primary Database:** PostgreSQL
- **Migrations:** Prisma Migrations

### Development Tools
- **Package Manager:** npm
- **Task Runner:** nodemon
- **Build Tool:** TypeScript Compiler
- **Code Transpilation:** ts-node

---

## 🔐 Roles & Permissions

| Feature | Customer | Seller | Admin |
|---------|----------|--------|-------|
| View Medicines | ✅ | ✅ | ✅ |
| Add Medicines | ❌ | ✅ | ❌ |
| Update Medicines | ❌ | ✅ | ❌ |
| Delete Medicines | ❌ | ✅ | ✅ |
| Create Orders | ✅ | ❌ | ❌ |
| View Own Orders | ✅ | ✅ | ❌ |
| View All Orders | ❌ | ❌ | ✅ |
| Update Order Status | ❌ | ✅ | ✅ |
| Leave Reviews | ✅ | ❌ | ❌ |
| Manage Users | ❌ | ❌ | ✅ |
| Manage Categories | ❌ | ❌ | ✅ |
| Manage Site Content | ❌ | ❌ | ✅ |

---

## 📊 Database Schema Overview

### Tables

#### User
- `id` - Unique identifier (CUID)
- `email` - Unique email address
- `password` - Encrypted password
- `name` - Full name
- `phone` - Contact phone number
- `address` - Shipping address
- `photoUrl` - Profile photo URL
- `role` - USER_ROLE (CUSTOMER, SELLER, ADMIN)
- `isActive` - Account status
- `createdAt` - Account creation timestamp
- `updatedAt` - Last updated timestamp

#### Medicine
- `id` - Unique identifier
- `name` - Medicine name
- `description` - Medicine details
- `price` - Price per unit
- `stock` - Available quantity
- `manufacturer` - Medicine manufacturer
- `expiryDate` - Expiration date
- `categoryId` - Foreign key to Category
- `sellerId` - Foreign key to User (Seller)
- `imageUrl` - Product image URL
- `createdAt` - Creation timestamp
- `updatedAt` - Last updated timestamp

#### Category
- `id` - Unique identifier
- `name` - Category name (unique)
- `description` - Category description
- `createdAt` - Creation timestamp
- `updatedAt` - Last updated timestamp

#### Order
- `id` - Unique identifier
- `orderNumber` - Human-readable order number
- `customerId` - Foreign key to User (Customer)
- `sellerId` - Foreign key to User (Seller)
- `totalAmount` - Order total
- `shippingAddress` - Delivery address
- `phone` - Contact phone
- `status` - Order status (PLACED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- `paymentMethod` - Payment method (default: COD)
- `createdAt` - Order creation timestamp
- `updatedAt` - Last updated timestamp

#### OrderItem
- `id` - Unique identifier
- `orderId` - Foreign key to Order
- `medicineId` - Foreign key to Medicine
- `quantity` - Quantity ordered
- `price` - Price at time of order

#### CartItem
- `id` - Unique identifier
- `userId` - Foreign key to User
- `medicineId` - Foreign key to Medicine
- `quantity` - Quantity in cart
- `createdAt` - Addition timestamp
- `updatedAt` - Last updated timestamp

#### Review
- `id` - Unique identifier
- `rating` - Rating (1-5)
- `comment` - Optional review comment
- `medicineId` - Foreign key to Medicine
- `customerId` - Foreign key to User (Customer)
- `createdAt` - Review creation timestamp
- `updatedAt` - Last updated timestamp

---

## 📡 API Endpoints Overview

### Authentication Endpoints
```
POST   /api/auth/register          - Register new user (CUSTOMER or SELLER)
POST   /api/auth/login             - Login user
GET    /api/auth/me                - Get current user profile
PUT    /api/auth/profile           - Update user profile
```

### Medicine Endpoints (Public)
```
GET    /api/medicines              - Get all medicines (with filters)
GET    /api/medicines/:id          - Get medicine details
GET    /api/medicines/categories   - Get all categories
```

### Cart Endpoints (Customer Only)
```
GET    /api/cart                   - Get cart items
POST   /api/cart                   - Add medicine to cart
PUT    /api/cart/:id               - Update cart item quantity
DELETE /api/cart/:id               - Remove item from cart
DELETE /api/cart                   - Clear entire cart
```

### Order Endpoints (Authenticated)
```
POST   /api/orders                 - Create new order
GET    /api/orders                 - Get user's orders
GET    /api/orders/:id             - Get order details
POST   /api/orders/:medicineId/review - Add review for medicine
PATCH  /api/orders/:id/cancel      - Cancel order
```

### Seller Endpoints (Seller Only)
```
GET    /api/seller/medicines       - Get seller's medicines
POST   /api/seller/medicines       - Add new medicine
PUT    /api/seller/medicines/:id   - Update medicine
DELETE /api/seller/medicines/:id   - Delete medicine
GET    /api/seller/orders          - Get seller's orders
PATCH  /api/seller/orders/:id/status - Update order status
```

### Admin Endpoints (Admin Only)
```
GET    /api/admin/users            - Get all users
PATCH  /api/admin/users/:id/status - Update user status
PUT    /api/admin/users/:id        - Update user details
DELETE /api/admin/users/:id        - Delete user
POST   /api/admin/users/:id/reset-password - Reset user password

GET    /api/admin/orders           - Get all orders
PATCH  /api/admin/orders/:id/status - Update order status
DELETE /api/admin/orders/:id       - Delete order

GET    /api/admin/medicines        - Get all medicines
DELETE /api/admin/medicines/:id    - Delete medicine

GET    /api/admin/categories       - Get all categories
POST   /api/admin/categories       - Create category
PUT    /api/admin/categories/:id   - Update category
DELETE /api/admin/categories/:id   - Delete category
```

---

## 💾 Installation & Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/MediStore.git
cd MediStore-Backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/medistore"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRY="7d"

# Server Configuration
PORT=5000
NODE_ENV="development"

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"
```

### Step 4: Set Up Database

Generate Prisma Client:
```bash
npm run prisma:generate
```

Run migrations:
```bash
npm run prisma:migrate
```

(Optional) Seed database with initial data:
```bash
npm run prisma:seed
```

### Step 5: Verify Setup

```bash
npm run build
```

This compiles TypeScript to JavaScript. If there are no errors, the setup is complete!

---

## 🚀 Running the Project

### Running Backend (Development Mode)

```bash
npm run dev
```

The backend will start on `http://localhost:5000`

### Running Backend (Production Mode)

Build the project:
```bash
npm run build
```

Start the server:
```bash
npm start
```

### Database Management

Open Prisma Studio to view/manage data:
```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555`

### API Testing

Use Postman or similar tools to test endpoints:

**Example Login Request:**
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "password123"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "user123",
      "email": "customer@example.com",
      "name": "John Doe",
      "role": "CUSTOMER"
    }
  }
}
```

---

## 📁 Project Structure

```
MediStore-Backend/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   ├── seed.ts                # Database seeding script
│   └── migrations/            # Database migration files
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── index.ts               # Server entry point
│   ├── config/
│   │   └── database.ts        # Database configuration
│   ├── controllers/           # Business logic handlers
│   │   ├── admin.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── medicine.controller.ts
│   │   ├── order.controller.ts
│   │   └── seller.controller.ts
│   ├── middleware/            # Express middleware
│   │   ├── auth.ts            # JWT authentication & authorization
│   │   ├── errorHandler.ts    # Global error handler
│   │   └── validate.ts        # Request validation
│   ├── routes/                # API routes
│   │   ├── admin.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── medicine.routes.ts
│   │   ├── order.routes.ts
│   │   └── seller.routes.ts
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── utils/
│       ├── apiResponse.ts     # Standardized API response utility
│       └── validation.ts      # Zod validation schemas
├── package.json               # Project dependencies
├── tsconfig.json              # TypeScript configuration
├── prisma.config.ts           # Prisma configuration
└── README.md                  # This file
```

---

## 🌐 Deployment Instructions

### Deploy on Heroku

#### Prerequisites
- Heroku CLI installed
- Heroku account created
- Git initialized

#### Steps

1. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables:**
   ```bash
   heroku config:set JWT_SECRET="your-secret-key"
   heroku config:set NODE_ENV="production"
   heroku config:set CORS_ORIGIN="https://your-frontend-url.com"
   ```

3. **Add PostgreSQL addon:**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

5. **Run migrations on Heroku:**
   ```bash
   heroku run npm run prisma:migrate
   ```

### Deploy on AWS EC2

1. Launch an EC2 instance with Node.js
2. SSH into the instance
3. Clone the repository
4. Install dependencies and set environment variables
5. Configure PostgreSQL database
6. Use PM2 for process management:
   ```bash
   npm install -g pm2
   npm run build
   pm2 start dist/index.js --name "medistore"
   ```

### Deploy with Docker

Create a `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t medistore .
docker run -p 5000:5000 medistore
```

---

## 🔐 Admin Credentials

**Note:** These should be configured during initial setup via the seed script.

```
Email: admin@medistore.com
Password: admin123

(Change these immediately in production!)
```

To create an admin user manually:

```bash
npm run prisma:studio
```

Then create a new User record with:
- Email: your-admin@example.com
- Password: (hashed using bcryptjs)
- Role: ADMIN
- isActive: true

---

## 📸 Screenshots & Visuals

*Note: Add actual screenshots here*

### Features in Action:

- 🏠 **Homepage** - Browse medicines by category
- 🔐 **Login Page** - Secure authentication
- 💳 **Product Details** - View medicine information, prices, and reviews
- 🛒 **Shopping Cart** - Add/remove items, adjust quantities
- 📦 **Checkout** - Place orders with shipping details
- 📋 **Order History** - Track order status
- 👨‍💼 **Seller Dashboard** - Manage inventory and orders
- ⚙️ **Admin Panel** - Manage users, categories, and orders

---

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support & Contact

For questions or issues:
- Email: support@medistore.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/MediStore/issues)
- Documentation: [Wiki](https://github.com/yourusername/MediStore/wiki)

---

## 🙏 Acknowledgments

- Express.js community for the excellent web framework
- Prisma team for the amazing ORM
- PostgreSQL for reliable database management
- All contributors and users of MediStore

---

**Made with ❤️ by the MediStore Team**

Last Updated: February 2, 2026
