import { Router } from 'express';
import { generateSuggestions } from '../controllers/ai.controller';

const router = Router();

router.post('/suggest', generateSuggestions);

export default router;
