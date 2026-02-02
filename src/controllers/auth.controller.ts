import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { registerSchema, loginSchema } from '../utils/validation';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';
import { updateUserSchema } from '../utils/validation';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return res.status(400).json(
        ApiResponse.error('User already exists')
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        phone: validatedData.phone,
        address: validatedData.address
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true
      }
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json(
      ApiResponse.success('User registered successfully', { user, token })
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      return res.status(401).json(
        ApiResponse.error('Invalid credentials')
      );
    }

    if (!user.isActive) {
      return res.status(401).json(
        ApiResponse.error('Account is disabled')
      );
    }

    const isValidPassword = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    if (!isValidPassword) {
      return res.status(401).json(
        ApiResponse.error('Invalid credentials')
      );
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json(
      ApiResponse.success('Login successful', {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address
        },
        token
      })
    );
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json(
      ApiResponse.success('User retrieved successfully', user)
    );
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = updateUserSchema.parse(req.body);
    const userId = req.user!.id;

    // Prepare update data, remove empty strings for optional fields
    const updateData: any = {};
    
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone || null;
    if (validatedData.address !== undefined) updateData.address = validatedData.address || null;
    if (validatedData.photoUrl !== undefined) {
      // If photoUrl is empty string, set it to null
      updateData.photoUrl = validatedData.photoUrl || null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        photoUrl: true,
        isActive: true,
        createdAt: true,
      }
    });

    res.json(
      ApiResponse.success('Profile updated successfully', updatedUser)
    );
  } catch (error) {
    next(error);
  }
};