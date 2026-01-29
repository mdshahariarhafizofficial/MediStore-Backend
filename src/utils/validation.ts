import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'SELLER']),
  phone: z.string().optional(),
  address: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const medicineSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be positive'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  manufacturer: z.string().min(2, 'Manufacturer name required'),
  expiryDate: z.string(),
  categoryId: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal(''))
});

export const orderSchema = z.object({
  items: z.array(z.object({
    medicineId: z.string(),
    quantity: z.coerce.number().int().positive('Quantity must be positive')
  })).min(1, 'At least one item is required'),
  shippingAddress: z.string().min(10, 'Shipping address is required'),
  phone: z.string().min(10, 'Valid phone number is required')
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional()
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean()
});