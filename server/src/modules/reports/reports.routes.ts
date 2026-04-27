import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requirePlan } from '../../middleware/plan.middleware';

const router = Router();

router.get('/summary', authenticateToken, ReportsController.getSummary);

// Pro-only Hook feature
router.get('/risk-assessment', authenticateToken, requirePlan('PRO'), ReportsController.getRiskAssessment);

export default router;
