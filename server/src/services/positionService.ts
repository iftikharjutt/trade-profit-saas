import { prisma } from '../db/prisma';
import { calculatePositionUpdate } from './positionEngine';

export class PositionService {
    static async addExecution(userId: number, data: {
        positionId?: number;
        assetSymbol: string;
        side: 'LONG' | 'SHORT';
        type: 'ENTRY' | 'EXIT';
        price: number;
        quantity: number;
        fees: number;
        leverage?: number;
        portfolioId?: number;
    }) {
        return await prisma.$transaction(async (tx) => {
            let position;

            if (data.positionId) {
                position = await tx.position.findUnique({
                    where: { id: data.positionId },
                    include: { executions: true }
                });
            } else {
                // Try to find an existing open position for the same asset
                position = await tx.position.findFirst({
                    where: {
                        user_id: userId,
                        asset_symbol: data.assetSymbol,
                        status: 'OPEN'
                    },
                    include: { executions: true }
                });
            }

            // Create new position if none exists
            if (!position) {
                if (data.type === 'EXIT') throw new Error("Cannot exit a non-existent position");
                
                position = await tx.position.create({
                    data: {
                        user_id: userId,
                        asset_symbol: data.assetSymbol,
                        side: data.side,
                        leverage: data.leverage || 1,
                        portfolio_id: data.portfolioId,
                        status: 'OPEN'
                    },
                    include: { executions: true }
                });
            }

            // Calculate updated state
            const newState = calculatePositionUpdate(
                {
                    avgEntryPrice: position.avg_entry_price,
                    totalQuantity: position.total_quantity,
                    realizedPnL: position.realized_pnl,
                    totalFees: position.total_fees
                },
                position.side,
                data.type as 'ENTRY' | 'EXIT',
                data.price,
                data.quantity,
                data.fees,
                position.leverage
            );

            // Record execution
            await tx.execution.create({
                data: {
                    position_id: position.id,
                    type: data.type,
                    price: data.price,
                    quantity: data.quantity,
                    fees: data.fees
                }
            });

            // Update position
            const updatedPosition = await tx.position.update({
                where: { id: position.id },
                data: {
                    avg_entry_price: newState.avgEntryPrice,
                    total_quantity: newState.totalQuantity,
                    realized_pnl: newState.realizedPnL,
                    total_fees: newState.totalFees,
                    status: newState.totalQuantity <= 0 ? 'CLOSED' : 'OPEN',
                    closed_at: newState.totalQuantity <= 0 ? new Date() : null,
                    avg_exit_price: newState.totalQuantity <= 0 ? data.price : null
                }
            });

            return updatedPosition;
        });
    }

    static async getDashboardStats(userId: number) {
        const closedPositions = await prisma.position.findMany({
            where: { user_id: userId, status: 'CLOSED' },
            orderBy: { closed_at: 'asc' }
        });

        const totalNetProfit = closedPositions.reduce((sum, p) => sum + p.realized_pnl - p.total_fees, 0);
        const winRate = (closedPositions.filter(p => p.realized_pnl > 0).length / (closedPositions.length || 1)) * 100;
        
        // Equity Curve Calculation
        let cumulative = 0;
        const equityCurve = closedPositions.map(p => {
            cumulative += (p.realized_pnl - p.total_fees);
            return { date: p.closed_at, balance: cumulative };
        });

        return {
            totalNetProfit: parseFloat(totalNetProfit.toFixed(2)),
            winRate: parseFloat(winRate.toFixed(2)),
            totalTrades: closedPositions.length,
            equityCurve
        };
    }
}
