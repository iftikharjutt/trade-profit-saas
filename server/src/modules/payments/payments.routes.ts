import express, { Router } from 'express';
import { PaymentsController } from './payments.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

// Stripe webhook requires raw body
router.post('/webhook', express.raw({ type: 'application/json' }), PaymentsController.handleWebhook);

router.post('/create-checkout-session', authenticateToken, PaymentsController.createCheckoutSession);

export default router;
