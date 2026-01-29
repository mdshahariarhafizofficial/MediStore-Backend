import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { medicineSchema, updateOrderStatusSchema } from '../utils/validation';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

export const addMedicine = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = medicineSchema.parse(req.body);
    const sellerId = req.user!.id;

    const medicine = await prisma.medicine.create({
      data: {
        ...validatedData,
        sellerId,
        expiryDate: new Date(validatedData.expiryDate)
      },
      include: {
        category: true
      }
    });

    res.status(201).json(
      ApiResponse.success('Medicine added successfully', medicine)
    );
  } catch (error) {
    next(error);
  }
};

export const updateMedicine = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const sellerId = req.user!.id;
    const validatedData = medicineSchema.parse(req.body);

    const existingMedicine = await prisma.medicine.findFirst({
      where: { id, sellerId }
    });

    if (!existingMedicine) {
      return res.status(404).json(
        ApiResponse.error('Medicine not found or unauthorized')
      );
    }

    const medicine = await prisma.medicine.update({
      where: { id },
      data: {
        ...validatedData,
        expiryDate: new Date(validatedData.expiryDate)
      },
      include: {
        category: true
      }
    });

    res.json(
      ApiResponse.success('Medicine updated successfully', medicine)
    );
  } catch (error) {
    next(error);
  }
};

export const deleteMedicine = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const sellerId = req.user!.id;

    const existingMedicine = await prisma.medicine.findFirst({
      where: { id, sellerId }
    });

    if (!existingMedicine) {
      return res.status(404).json(
        ApiResponse.error('Medicine not found or unauthorized')
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

export const getSellerMedicines = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.id;

    const medicines = await prisma.medicine.findMany({
      where: { sellerId },
      include: {
        category: true,
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

export const getSellerOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.id;

    const orders = await prisma.order.findMany({
      where: { sellerId },
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

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const sellerId = req.user!.id;
    const validatedData = updateOrderStatusSchema.parse(req.body);

    const order = await prisma.order.findFirst({
      where: { id, sellerId }
    });

    if (!order) {
      return res.status(404).json(
        ApiResponse.error('Order not found or unauthorized')
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: validatedData.status }
    });

    res.json(
      ApiResponse.success('Order status updated successfully', updatedOrder)
    );
  } catch (error) {
    next(error);
  }
};