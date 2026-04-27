import { Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma';
import { PositionService } from '../../services/positionService';
import { sendSuccess, sendError } from '../../utils/response';

export class TradesController {
    static async getTrades(req: any, res: Response, next: NextFunction) {
        try {
            const { page = 1, limit = 20, status } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const where: any = { user_id: req.user.id };
            if (status) where.status = status;

            const [positions, total] = await Promise.all([
                prisma.position.findMany({
                    where,
                    orderBy: { opened_at: 'desc' },
                    include: { executions: true },
                    skip,
                    take: Number(limit),
                }),
                prisma.position.count({ where })
            ]);

            return sendSuccess(res, {
                trades: positions,
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

    static async addExecution(req: any, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;
            const data = req.body;

            // Enforce SaaS Limits
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user?.subscription_tier === 'FREE') {
                const count = await prisma.position.count({ where: { user_id: userId } });
                if (count >= 50) {
                    return sendError(res, 'Free plan limit reached (50 trades). Please upgrade.', 403);
                }
            }

            const position = await PositionService.addExecution(userId, {
                positionId: data.position_id,
                assetSymbol: data.asset_symbol,
                side: data.side,
                type: data.type,
                price: data.price,
                quantity: data.quantity,
                fees: data.fees || 0,
                leverage: data.leverage,
                portfolioId: data.portfolio_id
            });

            return sendSuccess(res, position, 201);
        } catch (error: any) {
            return sendError(res, error.message, 400);
        }
    }

    static async deletePosition(req: any, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id);
            const position = await prisma.position.findUnique({ where: { id } });

            if (!position || position.user_id !== req.user.id) {
                return sendError(res, 'Position not found', 404);
            }

            await prisma.position.delete({ where: { id } });
            return sendSuccess(res, { message: "Position deleted" });
        } catch (error) {
            next(error);
        }
    }
}
