import express from 'express';
import { register, login, getCurrentUser } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../utils/validation';
import { updateProfile } from '../controllers/auth.controller';
import { updateUserSchema } from '../utils/validation';


const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, validate(updateUserSchema), updateProfile);

export default router;