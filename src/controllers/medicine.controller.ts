import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiResponse } from '../utils/apiResponse';

export const getAllMedicines = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '10',
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (category) {
      where.categoryId = category as string;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { manufacturer: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              name: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy: {
          [sortBy as string]: sortOrder
        },
        skip,
        take: limitNum
      }),
      prisma.medicine.count({ where })
    ]);

    const medicinesWithRating = medicines.map(medicine => ({
      ...medicine,
      averageRating: medicine.reviews.length > 0
        ? medicine.reviews.reduce((acc, review) => acc + review.rating, 0) / medicine.reviews.length
        : 0,
      reviewCount: medicine.reviews.length
    }));

    res.json(
      ApiResponse.success('Medicines retrieved successfully', {
        medicines: medicinesWithRating,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      })
    );
  } catch (error) {
    next(error);
  }
};

export const getMedicineById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const medicine = await prisma.medicine.findUnique({
      where: { id },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviews: {
          include: {
            customer: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!medicine) {
      return res.status(404).json(
        ApiResponse.error('Medicine not found')
      );
    }

    const averageRating = medicine.reviews.length > 0
      ? medicine.reviews.reduce((acc, review) => acc + review.rating, 0) / medicine.reviews.length
      : 0;

    res.json(
      ApiResponse.success('Medicine retrieved successfully', {
        ...medicine,
        averageRating,
        reviewCount: medicine.reviews.length
      })
    );
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
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