import express from 'express';
import { getAllMedicines, getMedicineById, getCategories } from '../controllers/medicine.controller';

const router = express.Router();

router.get('/', getAllMedicines);
router.get('/categories', getCategories);
router.get('/:id', getMedicineById);

export default router;