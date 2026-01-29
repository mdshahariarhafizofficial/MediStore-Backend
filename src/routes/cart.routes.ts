import express from 'express';
import { 
  getCartItems, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} from '../controllers/cart.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.use(authenticate, authorize('CUSTOMER'));

router.get('/', getCartItems);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeFromCart);
router.delete('/', clearCart);

export default router;