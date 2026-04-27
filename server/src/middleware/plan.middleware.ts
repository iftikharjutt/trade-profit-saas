import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { SubscriptionTier } from '@prisma/client';

export const requirePlan = (tier: SubscriptionTier) => {
    return (req: any, res: Response, next: NextFunction) => {
        const userTier = req.user?.subscription_tier;

        const tiers = ['FREE', 'PRO', 'PREMIUM'];
        const userLevel = tiers.indexOf(userTier);
        const requiredLevel = tiers.indexOf(tier);

        if (userLevel < requiredLevel) {
            return sendError(res, `This feature requires a ${tier} subscription.`, 403);
        }

        next();
    };
};
