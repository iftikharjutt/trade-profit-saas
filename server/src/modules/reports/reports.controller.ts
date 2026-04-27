import { Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma';
import { calculateEquityCurve, calculateDrawdown } from '../../services/profitEngine';
import { sendSuccess } from '../../utils/response';

export class ReportsController {
    static async getSummary(req: any, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;
            const trades = await prisma.trade.findMany({ 
                where: { user_id: userId, status: 'CLOSED' },
                orderBy: { closed_at: 'asc' }
            });

            if (trades.length === 0) {
                return sendSuccess(res, {
                    summary: {
                        totalNetProfit: 0,
                        winRate: 0,
                        totalTrades: 0,
                        maxDrawdown: 0,
                        avgROI: 0
                    },
                    equityCurve: []
                });
            }

            const totalNetProfit = trades.reduce((sum, t) => sum + (t.pnl_net || 0), 0);
            const wins = trades.filter(t => (t.pnl_net || 0) > 0).length;
            const winRate = (wins / trades.length) * 100;
            const avgROI = trades.reduce((sum, t) => sum + (t.pnl_percent || 0), 0) / trades.length;

            const equityCurve = calculateEquityCurve(trades);
            const maxDrawdown = calculateDrawdown(equityCurve);

            return sendSuccess(res, {
                summary: {
                    totalNetProfit: parseFloat(totalNetProfit.toFixed(2)),
                    winRate: parseFloat(winRate.toFixed(2)),
                    totalTrades: trades.length,
                    maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
                    avgROI: parseFloat(avgROI.toFixed(2))
                },
                equityCurve
            });
        } catch (error) {
            next(error);
        }
    }
}
