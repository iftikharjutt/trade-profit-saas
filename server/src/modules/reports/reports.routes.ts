import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.get('/summary', authenticateToken, ReportsController.getSummary);

export default router;
