import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthUser extends JwtPayload {
  userId: string;
  role: string;
}

export type AuthRequest = Request & {
  user?: AuthUser;
};

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'SELLER';
  phone?: string;
  address?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface MedicineData {
  name: string;
  description: string;
  price: number;
  stock: number;
  manufacturer: string;
  expiryDate: string;
  categoryId: string;
  imageUrl?: string;
}

export interface OrderData {
  items: Array<{
    medicineId: string;
    quantity: number;
  }>;
  shippingAddress: string;
  phone: string;
}

export interface ReviewData {
  rating: number;
  comment?: string;
}
