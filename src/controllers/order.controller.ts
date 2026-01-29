import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { orderSchema } from '../utils/validation';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = orderSchema.parse(req.body);
    const userId = req.user!.id;

    let totalAmount = 0;
    const orderItems = [];

    for (const item of validatedData.items) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: item.medicineId }
      });

      if (!medicine) {
        return res.status(404).json(
          ApiResponse.error(`Medicine ${item.medicineId} not found`)
        );
      }

      if (medicine.stock < item.quantity) {
        return res.status(400).json(
          ApiResponse.error(`Not enough stock for ${medicine.name}`)
        );
      }

      totalAmount += medicine.price * item.quantity;
      orderItems.push({
        medicineId: medicine.id,
        quantity: item.quantity,
        price: medicine.price
      });

      await prisma.medicine.update({
        where: { id: medicine.id },
        data: { stock: medicine.stock - item.quantity }
      });
    }

    const order = await prisma.order.create({
      data: {
        customerId: userId,
        sellerId: (await prisma.user.findFirst({
          where: { role: 'SELLER' }
        }))?.id || userId,
        totalAmount,
        shippingAddress: validatedData.shippingAddress,
        phone: validatedData.phone,
        status: 'PLACED',
        items: {
          create: orderItems
        }
      },
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

    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    res.status(201).json(
      ApiResponse.success('Order created successfully', order)
    );
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let orders;
    if (role === 'CUSTOMER') {
      orders = await prisma.order.findMany({
        where: { customerId: userId },
        include: {
          items: {
            include: {
              medicine: true
            }
          },
          seller: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (role === 'SELLER') {
      orders = await prisma.order.findMany({
        where: { sellerId: userId },
        include: {
          items: {
            include: {
              medicine: true
            }
          },
          customer: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      orders = await prisma.order.findMany({
        include: {
          items: {
            include: {
              medicine: true
            }
          },
          customer: {
            select: {
              name: true
            }
          },
          seller: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json(
      ApiResponse.success('Orders retrieved successfully', orders)
    );
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    const where: any = { id };

    if (role === 'CUSTOMER') {
      where.customerId = userId;
    } else if (role === 'SELLER') {
      where.sellerId = userId;
    }

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: {
          include: {
            medicine: true
          }
        },
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        seller: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json(
        ApiResponse.error('Order not found')
      );
    }

    res.json(
      ApiResponse.success('Order retrieved successfully', order)
    );
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { medicineId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user!.id;

    const order = await prisma.order.findFirst({
      where: {
        customerId: userId,
        items: {
          some: {
            medicineId
          }
        },
        status: 'DELIVERED'
      }
    });

    if (!order) {
      return res.status(403).json(
        ApiResponse.error('You can only review medicines you have purchased and received')
      );
    }

    const review = await prisma.review.upsert({
      where: {
        medicineId_customerId: {
          medicineId,
          customerId: userId
        }
      },
      update: {
        rating,
        comment
      },
      create: {
        medicineId,
        customerId: userId,
        rating,
        comment
      },
      include: {
        customer: {
          select: {
            name: true
          }
        }
      }
    });

    res.json(
      ApiResponse.success('Review added successfully', review)
    );
  } catch (error) {
    next(error);
  }
};