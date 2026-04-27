import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma';
import { calculatePnL } from '../../services/profitEngine';
import { sendSuccess, sendError } from '../../utils/response';

export class TradesController {
    static async getTrades(req: any, res: Response, next: NextFunction) {
        try {
            const { page = 1, limit = 20, status } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const where: any = { user_id: req.user.id };
            if (status) where.status = status;

            const [trades, total] = await Promise.all([
                prisma.trade.findMany({
                    where,
                    orderBy: { opened_at: 'desc' },
                    skip,
                    take: Number(limit),
                }),
                prisma.trade.count({ where })
            ]);

            return sendSuccess(res, {
                trades,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async addTrade(req: any, res: Response, next: NextFunction) {
        try {
            const data = req.body;
            const userId = req.user.id;

            let pnl_net = null;
            let pnl_percent = null;

            if (data.status === 'CLOSED' && data.exit_price) {
                const result = calculatePnL({
                    type: data.position_type,
                    entryPrice: data.entry_price,
                    exitPrice: data.exit_price,
                    quantity: data.quantity,
                    leverage: data.leverage || 1,
                    fees: data.fees || 0
                });
                pnl_net = result.netPnL;
                pnl_percent = result.roi;
            }

            const trade = await prisma.trade.create({
                data: {
                    ...data,
                    user_id: userId,
                    pnl_net,
                    pnl_percent,
                    opened_at: data.opened_at ? new Date(data.opened_at) : new Date(),
                    closed_at: data.closed_at ? new Date(data.closed_at) : (data.status === 'CLOSED' ? new Date() : null),
                }
            });
            
            return sendSuccess(res, trade, 201);
        } catch (error) {
            next(error);
        }
    }

    static async deleteTrade(req: any, res: Response, next: NextFunction) {
        try {
            const tradeId = parseInt(req.params.id);
            const trade = await prisma.trade.findUnique({ where: { id: tradeId } });

            if (!trade || trade.user_id !== req.user.id) {
                return sendError(res, 'Trade not found or unauthorized', 404);
            }

            await prisma.trade.delete({ where: { id: tradeId } });
            return sendSuccess(res, { message: "Trade deleted" });
        } catch (error) {
            next(error);
        }
    }
}
