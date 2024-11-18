import express from 'express';
import { getSales, createSale } from '../controllers/sales.js';

const router = express.Router();

router.get('/', getSales);
router.post('/', createSale);

export default router;