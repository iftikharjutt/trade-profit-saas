import { prisma } from '../db/prisma';
import { calculatePnL } from './profitEngine';

export class TradeService {
    /**
     * Aggregates trade history for a specific asset to handle partial closes and scaling.
     * This is the "Position" logic real traders use.
     */
    static async processTrade(userId: number, tradeData: any) {
        // Enforce SaaS Limits (Basic check, could be moved to middleware but good for service integrity)
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.subscription_tier === 'FREE') {
            const count = await prisma.trade.count({ where: { user_id: userId } });
            if (count >= 50) {
                throw new Error('Free plan limit reached (50 trades). Please upgrade.');
            }
        }

        let pnl_net = null;
        let pnl_percent = null;

        if (tradeData.status === 'CLOSED' && tradeData.exit_price) {
            const result = calculatePnL({
                type: tradeData.position_type,
                entryPrice: tradeData.entry_price,
                exitPrice: tradeData.exit_price,
                quantity: tradeData.quantity,
                leverage: tradeData.leverage || 1,
                fees: tradeData.fees || 0,
                stopLoss: tradeData.stop_loss
            });
            pnl_net = result.netPnL;
            pnl_percent = result.roi;
        }

        return await prisma.trade.create({
            data: {
                ...tradeData,
                user_id: userId,
                pnl_net,
                pnl_percent,
                opened_at: tradeData.opened_at ? new Date(tradeData.opened_at) : new Date(),
                closed_at: tradeData.closed_at ? new Date(tradeData.closed_at) : (tradeData.status === 'CLOSED' ? new Date() : null),
            }
        });
    }

    static async getAnalytics(userId: number) {
        const trades = await prisma.trade.findMany({
            where: { user_id: userId, status: 'CLOSED' },
            orderBy: { closed_at: 'asc' }
        });

        if (trades.length === 0) return null;

        const totalNetProfit = trades.reduce((sum, t) => sum + (t.pnl_net || 0), 0);
        const wins = trades.filter(t => (t.pnl_net || 0) > 0);
        const losses = trades.filter(t => (t.pnl_net || 0) <= 0);
        
        const winRate = (wins.length / trades.length) * 100;
        const profitFactor = Math.abs(
            wins.reduce((sum, t) => sum + (t.pnl_net || 0), 0) / 
            (losses.reduce((sum, t) => sum + (t.pnl_net || 0), 0) || 1)
        );

        // Trade Expectancy: (Win Rate * Avg Win) - (Loss Rate * Avg Loss)
        const avgWin = wins.reduce((sum, t) => sum + (t.pnl_net || 0), 0) / (wins.length || 1);
        const avgLoss = Math.abs(losses.reduce((sum, t) => sum + (t.pnl_net || 0), 0) / (losses.length || 1));
        const expectancy = (winRate/100 * avgWin) - ((1 - winRate/100) * avgLoss);

        return {
            totalNetProfit: parseFloat(totalNetProfit.toFixed(2)),
            winRate: parseFloat(winRate.toFixed(2)),
            profitFactor: parseFloat(profitFactor.toFixed(2)),
            expectancy: parseFloat(expectancy.toFixed(2)),
            totalTrades: trades.length
        };
    }
}
