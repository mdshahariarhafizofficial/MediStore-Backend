import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

export const getCartItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user!.id },
      include: {
        medicine: {
          include: {
            category: true
          }
        }
      }
    });

    const total = cartItems.reduce((sum, item) => {
      return sum + (item.medicine.price * item.quantity);
    }, 0);

    res.json(
      ApiResponse.success('Cart items retrieved successfully', {
        items: cartItems,
        total: parseFloat(total.toFixed(2)),
        itemCount: cartItems.length
      })
    );
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { medicineId, quantity = 1 } = req.body;

    if (!medicineId) {
      return res.status(400).json(
        ApiResponse.error('Medicine ID is required')
      );
    }

    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId }
    });

    if (!medicine) {
      return res.status(404).json(
        ApiResponse.error('Medicine not found')
      );
    }

    if (medicine.stock < quantity) {
      return res.status(400).json(
        ApiResponse.error('Not enough stock available')
      );
    }

    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_medicineId: {
          userId: req.user!.id,
          medicineId
        }
      }
    });

    let cartItem;
    if (existingCartItem) {
      cartItem = await prisma.cartItem.update({
        where: {
          id: existingCartItem.id
        },
        data: {
          quantity: existingCartItem.quantity + quantity
        },
        include: {
          medicine: true
        }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user!.id,
          medicineId,
          quantity
        },
        include: {
          medicine: true
        }
      });
    }

    res.json(
      ApiResponse.success('Added to cart successfully', cartItem)
    );
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json(
        ApiResponse.error('Quantity must be at least 1')
      );
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id }
    });

    if (!cartItem || cartItem.userId !== req.user!.id) {
      return res.status(404).json(
        ApiResponse.error('Cart item not found')
      );
    }

    const medicine = await prisma.medicine.findUnique({
      where: { id: cartItem.medicineId }
    });

    if (!medicine) {
      return res.status(404).json(
        ApiResponse.error('Medicine not found')
      );
    }

    if (medicine.stock < quantity) {
      return res.status(400).json(
        ApiResponse.error('Not enough stock available')
      );
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        medicine: true
      }
    });

    res.json(
      ApiResponse.success('Cart item updated successfully', updatedCartItem)
    );
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id }
    });

    if (!cartItem || cartItem.userId !== req.user!.id) {
      return res.status(404).json(
        ApiResponse.error('Cart item not found')
      );
    }

    await prisma.cartItem.delete({
      where: { id }
    });

    res.json(
      ApiResponse.success('Cart item removed successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user!.id }
    });

    res.json(
      ApiResponse.success('Cart cleared successfully')
    );
  } catch (error) {
    next(error);
  }
};