import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { updateUserStatusSchema } from '../utils/validation';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

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

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, phone, address, role } = req.body;

    // Validation
    if (!name && !phone && !address && !role) {
      return res.status(400).json(
        ApiResponse.error('At least one field is required to update')
      );
    }

    const user = await prisma.user.findUnique({ 
      where: { id },
      include: {
        _count: {
          select: {
            medicines: true,
            orders: true,
            reviews: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json(
        ApiResponse.error('User not found')
      );
    }

    // Prevent modifying admin users
    if (user.role === 'ADMIN') {
      return res.status(403).json(
        ApiResponse.error('Cannot modify admin user')
      );
    }

    // Build update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (role && role !== 'ADMIN') updateData.role = role;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            medicines: true,
            orders: true,
            reviews: true
          }
        }
      },
    });

    res.json(ApiResponse.success('User updated successfully', updatedUser));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (req.user!.id === id) {
      return res.status(400).json(
        ApiResponse.error('Cannot delete your own account')
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json(
        ApiResponse.error('User not found')
      );
    }

    // Prevent deleting admin users
    if (user.role === 'ADMIN') {
      return res.status(403).json(
        ApiResponse.error('Cannot delete admin user')
      );
    }

    // Use transaction to delete all related data
    await prisma.$transaction(async (tx) => {
      // Delete user's cart items
      await tx.cartItem.deleteMany({ where: { userId: id } });
      
      // Delete user's reviews
      await tx.review.deleteMany({ where: { customerId: id } });
      
      // Delete user's medicines (if seller)
      await tx.medicine.deleteMany({ where: { sellerId: id } });
      
      // Get all order IDs where user is customer
      const customerOrders = await tx.order.findMany({
        where: { customerId: id },
        select: { id: true }
      });
      
      // Get all order IDs where user is seller
      const sellerOrders = await tx.order.findMany({
        where: { sellerId: id },
        select: { id: true }
      });
      
      const orderIds = [
        ...customerOrders.map(order => order.id),
        ...sellerOrders.map(order => order.id)
      ];
      
      // Delete order items for those orders
      if (orderIds.length > 0) {
        await tx.orderItem.deleteMany({
          where: { orderId: { in: orderIds } }
        });
      }
      
      // Delete customer orders
      await tx.order.deleteMany({ where: { customerId: id } });
      
      // Delete seller orders
      await tx.order.deleteMany({ where: { sellerId: id } });
      
      // Finally delete the user
      await tx.user.delete({ where: { id } });
    });

    res.json(ApiResponse.success('User deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json(
        ApiResponse.error('Password must be at least 6 characters')
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json(
        ApiResponse.error('User not found')
      );
    }

    // Prevent resetting admin password
    if (user.role === 'ADMIN') {
      return res.status(403).json(
        ApiResponse.error('Cannot reset admin user password')
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    res.json(ApiResponse.success('Password reset successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json(
        ApiResponse.error('Order not found')
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
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
      }
    });

    res.json(ApiResponse.success('Order status updated successfully', updatedOrder));
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true
      }
    });

    if (!order) {
      return res.status(404).json(
        ApiResponse.error('Order not found')
      );
    }

    // First delete order items
    await prisma.orderItem.deleteMany({
      where: { orderId: id }
    });

    // Then delete the order
    await prisma.order.delete({
      where: { id }
    });

    res.json(ApiResponse.success('Order deleted successfully'));
  } catch (error) {
    next(error);
  }
};