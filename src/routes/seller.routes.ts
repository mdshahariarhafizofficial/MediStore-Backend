import express from 'express';
import { 
  addMedicine, 
  updateMedicine, 
  deleteMedicine, 
  getSellerMedicines,
  getSellerOrders, 
  updateOrderStatus 
} from '../controllers/seller.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { medicineSchema, updateOrderStatusSchema } from '../utils/validation';

const router = express.Router();

router.use(authenticate, authorize('SELLER'));

// Medicine management
router.get('/medicines', getSellerMedicines);
router.post('/medicines', validate(medicineSchema), addMedicine);
router.put('/medicines/:id', validate(medicineSchema), updateMedicine);
router.delete('/medicines/:id', deleteMedicine);

// Order management
router.get('/orders', getSellerOrders);
router.patch('/orders/:id/status', validate(updateOrderStatusSchema), updateOrderStatus);

export default router;