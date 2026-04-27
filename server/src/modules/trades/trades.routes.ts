import { Router } from 'express';
import { TradesController } from './trades.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { addTradeSchema } from './trades.schema';

const router = Router();

// Protect all trade routes
router.use(authenticateToken);

router.get('/', TradesController.getTrades);
router.post('/', validate(addTradeSchema), TradesController.addTrade);
router.delete('/:id', TradesController.deleteTrade);

export default router;
