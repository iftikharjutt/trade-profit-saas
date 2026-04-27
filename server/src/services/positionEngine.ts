/**
 * Position Engine: The core math for production-grade trading analytics.
 * Handles scaling in, partial closes, and complex PnL tracking.
 */

export interface PositionState {
    avgEntryPrice: number;
    totalQuantity: number;
    realizedPnL: number;
    totalFees: number;
}

export const calculatePositionUpdate = (
    currentState: PositionState,
    side: 'LONG' | 'SHORT',
    executionType: 'ENTRY' | 'EXIT',
    price: number,
    quantity: number,
    fees: number,
    leverage: number = 1
): PositionState => {
    let { avgEntryPrice, totalQuantity, realizedPnL, totalFees } = currentState;
    totalFees += fees;

    if (executionType === 'ENTRY') {
        // Scaling In: Weighted Average Entry Price
        const newTotalQuantity = totalQuantity + quantity;
        avgEntryPrice = ((avgEntryPrice * totalQuantity) + (price * quantity)) / newTotalQuantity;
        totalQuantity = newTotalQuantity;
    } else {
        // Scaling Out: Realized PnL calculation
        // PnL = (Exit - Entry) * Qty * Leverage (for Long)
        // PnL = (Entry - Exit) * Qty * Leverage (for Short)
        const priceDiff = side === 'LONG' ? (price - avgEntryPrice) : (avgEntryPrice - price);
        const pnl = priceDiff * quantity * leverage;
        
        realizedPnL += pnl;
        totalQuantity -= quantity;

        // If fully closed, entry price remains for history or reset
        if (totalQuantity <= 0) {
            totalQuantity = 0;
            // Note: We keep avgEntryPrice for the record of the closed position
        }
    }

    return {
        avgEntryPrice: parseFloat(avgEntryPrice.toFixed(8)),
        totalQuantity: parseFloat(totalQuantity.toFixed(8)),
        realizedPnL: parseFloat(realizedPnL.toFixed(4)),
        totalFees: parseFloat(totalFees.toFixed(4))
    };
};

export const calculateROI = (realizedPnL: number, avgEntryPrice: number, quantity: number): number => {
    const costBasis = avgEntryPrice * quantity;
    if (costBasis === 0) return 0;
    return (realizedPnL / costBasis) * 100;
};
