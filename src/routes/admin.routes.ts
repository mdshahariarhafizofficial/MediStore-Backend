import express from 'express';
import { 
  getAllUsers, 
  updateUserStatus, 
  getAllOrders,
  getAllMedicines,
  deleteMedicine,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateUser,
  deleteUser,
  resetPassword,
  updateOrderStatus,
  deleteOrder
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { resetPasswordSchema, updateUserSchema, updateUserStatusSchema } from '../utils/validation';

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

// User management
router.get('/users', getAllUsers);
router.patch('/users/:id/status', validate(updateUserStatusSchema), updateUserStatus);
router.put('/users/:id', validate(updateUserSchema), updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/reset-password', validate(resetPasswordSchema), resetPassword); 

// Order management
router.get('/orders', getAllOrders);

// Medicine management
router.get('/medicines', getAllMedicines);
router.delete('/medicines/:id', deleteMedicine);

// Category management
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);
router.patch('/orders/:id/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);


export default router;