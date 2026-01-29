import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { updateUserStatusSchema } from '../utils/validation';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            medicines: true,
            orders: true,
            reviews: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(
      ApiResponse.success('Users retrieved successfully', users)
    );
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = updateUserStatusSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json(
        ApiResponse.error('User not found')
      );
    }

    if (user.role === 'ADMIN') {
      return res.status(403).json(
        ApiResponse.error('Cannot modify admin user')
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: validatedData.isActive }
    });

    res.json(
      ApiResponse.success('User status updated successfully', {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive
      })
    );
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            medicine: true
          }
        },
        customer: {
          select: {
            name: true,
            email: true
          }
        },
        seller: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(
      ApiResponse.success('Orders retrieved successfully', orders)
    );
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { medicines: true }
        }
      }
    });

    res.json(
      ApiResponse.success('Categories retrieved successfully', categories)
    );
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json(
        ApiResponse.error('Category name is required')
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        description
      }
    });

    res.status(201).json(
      ApiResponse.success('Category created successfully', category)
    );
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json(
        ApiResponse.error('Category name is required')
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description
      }
    });

    res.json(
      ApiResponse.success('Category updated successfully', category)
    );
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { medicines: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json(
        ApiResponse.error('Category not found')
      );
    }

    if (category._count.medicines > 0) {
      return res.status(400).json(
        ApiResponse.error('Cannot delete category with medicines')
      );
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json(
      ApiResponse.success('Category deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getAllMedicines = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const medicines = await prisma.medicine.findMany({
      include: {
        category: true,
        seller: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            orderItems: true,
            reviews: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(
      ApiResponse.success('Medicines retrieved successfully', medicines)
    );
  } catch (error) {
    next(error);
  }
};

export const deleteMedicine = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const medicine = await prisma.medicine.findUnique({
      where: { id }
    });

    if (!medicine) {
      return res.status(404).json(
        ApiResponse.error('Medicine not found')
      );
    }

    await prisma.medicine.delete({
      where: { id }
    });

    res.json(
      ApiResponse.success('Medicine deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};