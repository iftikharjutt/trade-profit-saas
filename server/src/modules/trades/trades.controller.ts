import { Response, NextFunction } from 'express';
import { TradeService } from '../../services/tradeService';
import { sendSuccess, sendError } from '../../utils/response';
import { prisma } from '../../db/prisma';

export class TradesController {
    static async getTrades(req: any, res: Response, next: NextFunction) {
        try {
            const { page = 1, limit = 20, status, portfolio_id } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const where: any = { user_id: req.user.id };
            if (status) where.status = status;
            if (portfolio_id) where.portfolio_id = Number(portfolio_id);

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
            const trade = await TradeService.processTrade(req.user.id, req.body);
            return sendSuccess(res, trade, 201);
        } catch (error: any) {
            if (error.message.includes('limit reached')) {
                return sendError(res, error.message, 403);
            }
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
