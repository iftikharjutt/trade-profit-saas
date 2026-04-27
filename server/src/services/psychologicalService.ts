import { prisma } from '../db/prisma';

export class PsychologicalService {
    static async analyzeBehavior(userId: number) {
        const closedPositions = await prisma.position.findMany({
            where: { user_id: userId, status: 'CLOSED' },
            orderBy: { closed_at: 'desc' },
            take: 20
        });

        if (closedPositions.length < 5) return null;

        // 1. Streak Tracking
        let currentStreak = 0;
        let streakType: 'WIN' | 'LOSS' | 'NONE' = 'NONE';
        
        for (let i = 0; i < closedPositions.length; i++) {
            const p = closedPositions[i];
            const isWin = p.realized_pnl > 0;
            
            if (i === 0) {
                streakType = isWin ? 'WIN' : 'LOSS';
                currentStreak = 1;
            } else {
                if ((isWin && streakType === 'WIN') || (!isWin && streakType === 'LOSS')) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }

        // 2. Behavioral Patterns: Chasing Losses
        // Pattern: After a loss, the next trade has higher leverage or higher quantity.
        let chasingLossesCount = 0;
        for (let i = 0; i < closedPositions.length - 1; i++) {
            const current = closedPositions[i];
            const previous = closedPositions[i+1];
            
            if (previous.realized_pnl < 0 && (current.leverage > previous.leverage || current.total_quantity > previous.total_quantity)) {
                chasingLossesCount++;
            }
        }

        // 3. Confidence Score (0-100)
        // High score = disciplined trading. Low score = erratic behavior.
        let confidenceScore = 100;
        if (chasingLossesCount > 2) confidenceScore -= 30;
        if (streakType === 'LOSS' && currentStreak > 3) confidenceScore -= 20;
        
        // Consistency check: Variance in trade size
        const quantities = closedPositions.map(p => p.total_quantity);
        const avgQty = quantities.reduce((a, b) => a + b, 0) / quantities.length;
        const variance = quantities.reduce((a, b) => a + Math.pow(b - avgQty, 2), 0) / quantities.length;
        if (variance > avgQty * 2) confidenceScore -= 15;

        return {
            streak: { type: streakType, count: currentStreak },
            behavior: {
                chasingLosses: chasingLossesCount > 1,
                disciplineScore: Math.max(0, confidenceScore)
            },
            insights: this.generateInsights(streakType, currentStreak, confidenceScore)
        };
    }

    private static generateInsights(streakType: string, streakCount: number, score: number) {
        if (streakType === 'LOSS' && streakCount >= 3) {
            return "You are on a significant loss streak. High risk of 'Revenge Trading'. Recommend 24h market break.";
        }
        if (score < 50) {
            return "Inconsistent trade sizing detected. Your performance is becoming erratic. Stick to your baseline quantity.";
        }
        if (streakType === 'WIN' && streakCount >= 3) {
            return "Solid winning streak. Maintain discipline—don't let overconfidence increase your risk profile.";
        }
        return "Trading behavior is stable. Maintain current risk parameters.";
    }
}
