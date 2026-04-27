import Decimal from 'decimal.js';

/**
 * Enterprise Position Engine: Quantitative-grade math for trading systems.
 * Uses Decimal.js to prevent floating point errors critical in financial apps.
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
    // Basic validation
    if (price <= 0 || quantity <= 0) {
        throw new Error("Price and quantity must be positive non-zero values.");
    }

    const currentAvg = new Decimal(currentState.avgEntryPrice);
    const currentQty = new Decimal(currentState.totalQuantity);
    const execPrice = new Decimal(price);
    const execQty = new Decimal(quantity);
    const execFees = new Decimal(fees);
    const currentPnL = new Decimal(currentState.realizedPnL);
    const currentFees = new Decimal(currentState.totalFees);
    const lev = new Decimal(leverage);

    let nextAvg = currentAvg;
    let nextQty = currentQty;
    let nextPnL = currentPnL;
    let nextFees = currentFees.plus(execFees);

    if (executionType === 'ENTRY') {
        // Scaling In: Weighted Average Entry Price
        // newAvg = (oldAvg * oldQty + newPrice * newQty) / (oldQty + newQty)
        const totalValue = currentAvg.times(currentQty).plus(execPrice.times(execQty));
        nextQty = currentQty.plus(execQty);
        nextAvg = totalValue.dividedBy(nextQty);
    } else {
        // Scaling Out: Realized PnL calculation
        if (execQty.gt(currentQty)) {
            throw new Error(`Insufficient position size. Current: ${currentQty.toString()}, Requested: ${execQty.toString()}`);
        }

        // PnL = (Exit - Entry) * Qty * Leverage (for Long)
        // PnL = (Entry - Exit) * Qty * Leverage (for Short)
        let priceDiff;
        if (side === 'LONG') {
            priceDiff = execPrice.minus(currentAvg);
        } else {
            priceDiff = currentAvg.minus(execPrice);
        }

        const realized = priceDiff.times(execQty).times(lev);
        nextPnL = currentPnL.plus(realized);
        nextQty = currentQty.minus(execQty);

        if (nextQty.isZero()) {
            // Position closed exactly
            nextQty = new Decimal(0);
        }
    }

    return {
        avgEntryPrice: nextAvg.toDecimalPlaces(8).toNumber(),
        totalQuantity: nextQty.toDecimalPlaces(8).toNumber(),
        realizedPnL: nextPnL.toDecimalPlaces(4).toNumber(),
        totalFees: nextFees.toDecimalPlaces(4).toNumber()
    };
};

export const calculateROI = (realizedPnL: number, avgEntryPrice: number, quantity: number): number => {
    const pnl = new Decimal(realizedPnL);
    const cost = new Decimal(avgEntryPrice).times(new Decimal(quantity));
    
    if (cost.isZero()) return 0;
    
    return pnl.dividedBy(cost).times(100).toDecimalPlaces(2).toNumber();
};
