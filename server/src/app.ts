import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './modules/auth/auth.routes';
import tradeRoutes from './modules/trades/trades.routes';
import reportRoutes from './modules/reports/reports.routes';
import portfolioRoutes from './modules/portfolios/portfolios.routes';
import paymentRoutes from './modules/payments/payments.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();

// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: false // Better for dev/some integrations
}));
app.use(cors());

// Webhook route must be before express.json() for raw body access
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/payments', paymentRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(errorHandler);

export default app;
