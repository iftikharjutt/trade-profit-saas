import { Router } from 'express';
import { PortfoliosController } from './portfolios.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createPortfolioSchema } from './portfolios.schema';

const router = Router();

router.use(authenticateToken);

router.get('/', PortfoliosController.getPortfolios);
router.post('/', validate(createPortfolioSchema), PortfoliosController.createPortfolio);
router.delete('/:id', PortfoliosController.deletePortfolio);

export default router;
