import { Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma';
import { PositionService } from '../../services/positionService';
import { PsychologicalService } from '../../services/psychologicalService';
import { sendSuccess } from '../../utils/response';

export class ReportsController {
    static async getSummary(req: any, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;
            const stats = await PositionService.getDashboardStats(userId);
            const psychology = await PsychologicalService.analyzeBehavior(userId);

            return sendSuccess(res, {
                summary: stats,
                psychology: psychology || { 
                    streak: { type: 'NONE', count: 0 },
                    behavior: { disciplineScore: 100, chasingLosses: false },
                    insights: "Start trading to see psychological insights."
                }
            });
        } catch (error) {
            next(error);
        }
    }
}
