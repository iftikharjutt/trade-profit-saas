export interface TradeInput {
    type: 'LONG' | 'SHORT';
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    leverage: number;
    fees: number;
}

export interface TradeResult {
    grossPnL: number;
    netPnL: number;
    roi: number; // Percentage
}

/**
 * SaaS Core: Profit Engine Service (Fintech Grade)
 * Authoritative source for all trading math including leverage and fees.
 */
export const calculatePnL = (input: TradeInput): TradeResult => {
    const { type, entryPrice, exitPrice, quantity, leverage, fees } = input;

    if (entryPrice <= 0 || quantity <= 0 || leverage <= 0) {
        return { grossPnL: 0, netPnL: 0, roi: 0 };
    }

    // Standard PnL Calculation
    // Long: (Exit - Entry) * Quantity
    // Short: (Entry - Exit) * Quantity
    let priceDiff = type === 'LONG' ? (exitPrice - entryPrice) : (entryPrice - exitPrice);
    
    // Leverage impact on Profit/Loss
    // The "notional value" is (Price * Quantity)
    // The "margin" used is (Price * Quantity) / Leverage
    const grossPnL = priceDiff * quantity * leverage;
    
    // Net PnL after deducting absolute fees
    const netPnL = grossPnL - fees;

    // ROI = (Net PnL / Margin) * 100
    // Margin = (EntryPrice * Quantity) / Leverage (simplified, actual margin might vary by exchange)
    const margin = (entryPrice * quantity);
    const roi = margin > 0 ? (netPnL / margin) * 100 : 0;

    return {
        grossPnL: parseFloat(grossPnL.toFixed(4)),
        netPnL: parseFloat(netPnL.toFixed(4)),
        roi: parseFloat(roi.toFixed(2))
    };
};

// For summary analytics
export const calculateEquityCurve = (trades: any[]) => {
    let cumulativePnL = 0;
    return trades
        .sort((a, b) => new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime())
        .map(trade => {
            cumulativePnL += trade.pnl_net || 0;
            return {
                date: trade.closed_at,
                balance: cumulativePnL
            };
        });
};

export const calculateDrawdown = (equityCurve: { balance: number }[]) => {
    let peak = -Infinity;
    let maxDrawdown = 0;

    for (const point of equityCurve) {
        if (point.balance > peak) {
            peak = point.balance;
        }
        const drawdown = peak - point.balance;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    }

    return maxDrawdown;
};
