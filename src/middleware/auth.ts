import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { ApiResponse } from '../utils/apiResponse';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        ApiResponse.error('No token provided')
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json(
        ApiResponse.error('User not found or inactive')
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json(
      ApiResponse.error('Invalid token')
    );
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(
        ApiResponse.error('Authentication required')
      );
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        ApiResponse.error('Insufficient permissions')
      );
    }

    next();
  };
};