import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Validation errors
  if (err.name === 'ZodError') {
    const errors = Array.isArray(err.errors) 
      ? err.errors.map((e: any) => ({
          field: e.path?.join('.') || 'unknown',
          message: e.message || 'Validation error'
        }))
      : [];
    
    return res.status(400).json(
      ApiResponse.error('Validation failed', errors)
    );
  }

  // Database errors
  if (err.code === 'P2002') {
    return res.status(409).json(
      ApiResponse.error('A record with this value already exists')
    );
  }

  if (err.code === 'P2025') {
    return res.status(404).json(
      ApiResponse.error('Record not found')
    );
  }

  // Auth errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json(
      ApiResponse.error('Invalid or expired token')
    );
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json(ApiResponse.error(message));
};

export default errorHandler;