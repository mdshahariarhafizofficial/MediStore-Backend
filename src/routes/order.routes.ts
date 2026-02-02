import express from 'express';
import { 
  createOrder, 
  getUserOrders, 
  getOrderById,
  addReview, 
  cancelOrder
} from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { orderSchema, reviewSchema } from '../utils/validation';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(orderSchema), createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.post('/:medicineId/review', validate(reviewSchema), addReview);
router.put('/:id/cancel', cancelOrder);

export default router;