import { Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma';
import { sendSuccess, sendError } from '../../utils/response';

export class PortfoliosController {
    static async getPortfolios(req: any, res: Response, next: NextFunction) {
        try {
            const portfolios = await prisma.portfolio.findMany({
                where: { user_id: req.user.id },
                include: { _count: { select: { trades: true } } }
            });
            return sendSuccess(res, portfolios);
        } catch (error) {
            next(error);
        }
    }

    static async createPortfolio(req: any, res: Response, next: NextFunction) {
        try {
            const { name, description, currency } = req.body;
            const portfolio = await prisma.portfolio.create({
                data: {
                    name,
                    description,
                    currency,
                    user_id: req.user.id
                }
            });
            return sendSuccess(res, portfolio, 201);
        } catch (error) {
            next(error);
        }
    }

    static async deletePortfolio(req: any, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id);
            const portfolio = await prisma.portfolio.findUnique({ where: { id } });

            if (!portfolio || portfolio.user_id !== req.user.id) {
                return sendError(res, 'Portfolio not found', 404);
            }

            await prisma.portfolio.delete({ where: { id } });
            return sendSuccess(res, { message: "Portfolio deleted" });
        } catch (error) {
            next(error);
        }
    }
}
