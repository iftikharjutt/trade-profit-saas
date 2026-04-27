import { Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma';
import { calculateEquityCurve, calculateDrawdown, calculateRiskScore } from '../../services/profitEngine';
import { TradeService } from '../../services/tradeService';
import { sendSuccess } from '../../utils/response';

export class ReportsController {
    static async getSummary(req: any, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;
            const stats = await TradeService.getAnalytics(userId);
            
            if (!stats) {
                return sendSuccess(res, {
                    summary: { totalNetProfit: 0, winRate: 0, profitFactor: 0, expectancy: 0, totalTrades: 0 },
                    equityCurve: []
                });
            }

            const trades = await prisma.trade.findMany({ 
                where: { user_id: userId, status: 'CLOSED' },
                orderBy: { closed_at: 'asc' }
            });

            const equityCurve = calculateEquityCurve(trades);
            const maxDrawdown = calculateDrawdown(equityCurve);

            return sendSuccess(res, {
                summary: { ...stats, maxDrawdown: parseFloat(maxDrawdown.toFixed(2)) },
                equityCurve
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Hook Feature: Get Risk Assessment
     */
    static async getRiskAssessment(req: any, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;
            const recentTrades = await prisma.trade.findMany({
                where: { user_id: userId },
                take: 10,
                orderBy: { created_at: 'desc' }
            });

            const stats = await TradeService.getAnalytics(userId);
            const userEquity = (stats?.totalNetProfit || 0) + 10000; // Assume 10k base for demo if not tracked

            const assessments = recentTrades.map(t => ({
                asset: t.asset_name,
                score: calculateRiskScore(t, userEquity),
                pnl: t.pnl_net
            }));

            return sendSuccess(res, {
                averageRiskScore: assessments.reduce((a, b) => a + b.score, 0) / (assessments.length || 1),
                assessments
            });
        } catch (error) {
            next(error);
        }
    }
}
