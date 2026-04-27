import { Router } from 'express';
import { TradesController } from './trades.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { addExecutionSchema } from './trades.schema';

const router = Router();

// Protect all trade routes
router.use(authenticateToken);

router.get('/', TradesController.getTrades);
router.post('/', validate(addExecutionSchema), TradesController.addExecution);
router.delete('/:id', TradesController.deletePosition);

export default router;
