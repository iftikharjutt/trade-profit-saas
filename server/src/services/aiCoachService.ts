import { prisma } from '../db/prisma';

export class AICoachService {
    /**
     * Signature Feature: AI Trade Coach
     * Analyzes a position's life cycle and provides actionable psychological & technical feedback.
     */
    static async coachPosition(positionId: number) {
        const position = await prisma.position.findUnique({
            where: { id: positionId },
            include: { executions: true }
        });

        if (!position || position.status !== 'CLOSED') {
            return "Position must be closed for a full coaching analysis.";
        }

        const realizedPnL = position.realized_pnl - position.total_fees;
        const isWin = realizedPnL > 0;
        
        // 1. Holding Time Analysis
        const durationMs = position.closed_at!.getTime() - position.opened_at.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);

        // 2. Execution Discipline
        const entryExecutions = position.executions.filter(e => e.type === 'ENTRY');
        const exitExecutions = position.executions.filter(e => e.type === 'EXIT');
        
        let feedback = "";

        if (isWin) {
            feedback = "Great trade! You captured profit effectively. ";
            if (exitExecutions.length > 1) {
                feedback += "Excellent use of 'Scaling Out' to secure gains while letting the rest run. ";
            } else {
                feedback += "Consider scaling out in the future to reduce volatility on your equity curve. ";
            }
        } else {
            feedback = "This trade resulted in a loss. Let's analyze why. ";
            if (durationHours < 0.5 && position.leverage > 10) {
                feedback += "It looks like you were stopped out quickly on high leverage. This suggests your entry was too aggressive or your stop-loss was too tight for the volatility. ";
            }
            if (entryExecutions.length > 2) {
                feedback += "You scaled into a losing position multiple times. In trading, this is often called 'averaging down' and can lead to catastrophic drawdowns. Avoid this. ";
            }
        }

        // 3. Efficiency Check
        if (position.total_fees > Math.abs(realizedPnL) * 0.2) {
            feedback += "Warning: Your trading fees are eating a significant portion of your PnL. Consider longer timeframes or lower-fee instruments.";
        }

        return feedback;
    }
}
