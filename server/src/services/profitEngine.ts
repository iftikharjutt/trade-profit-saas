export interface TradeInput {
    type: 'LONG' | 'SHORT';
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    leverage: number;
    fees: number;
    stopLoss?: number;
}

export interface TradeResult {
    grossPnL: number;
    netPnL: number;
    roi: number; // Percentage
    rMultiple?: number; // Risk-to-reward ratio achieved
}

/**
 * SaaS Core: Profit Engine Service (Fintech Grade)
 * Authoritative source for all trading math including leverage, fees, and risk metrics.
 */
export const calculatePnL = (input: TradeInput): TradeResult => {
    const { type, entryPrice, exitPrice, quantity, leverage, fees, stopLoss } = input;

    if (entryPrice <= 0 || quantity <= 0 || leverage <= 0) {
        return { grossPnL: 0, netPnL: 0, roi: 0 };
    }

    // Standard PnL Calculation
    // Long: (Exit - Entry) * Quantity
    // Short: (Entry - Exit) * Quantity
    let priceDiff = type === 'LONG' ? (exitPrice - entryPrice) : (entryPrice - exitPrice);
    
    // Leverage impact on Profit/Loss
    const grossPnL = priceDiff * quantity * leverage;
    
    // Net PnL after deducting absolute fees
    const netPnL = grossPnL - fees;

    // ROI = (Net PnL / Initial Margin) * 100
    // Margin = (EntryPrice * Quantity)
    const margin = (entryPrice * quantity);
    const roi = margin > 0 ? (netPnL / margin) * 100 : 0;

    // Risk Calculation (R-Multiple)
    let rMultiple = undefined;
    if (stopLoss && stopLoss !== entryPrice) {
        const riskPerUnit = Math.abs(entryPrice - stopLoss);
        const totalRisk = riskPerUnit * quantity * leverage;
        rMultiple = totalRisk > 0 ? netPnL / totalRisk : 0;
    }

    return {
        grossPnL: parseFloat(grossPnL.toFixed(4)),
        netPnL: parseFloat(netPnL.toFixed(4)),
        roi: parseFloat(roi.toFixed(2)),
        rMultiple: rMultiple !== undefined ? parseFloat(rMultiple.toFixed(2)) : undefined
    };
};

/**
 * Hook Feature: Risk Scoring System
 * Calculates a score from 0-100 based on risk management quality.
 */
export const calculateRiskScore = (trade: any, userEquity: number): number => {
    let score = 100;
    
    // 1. Risk per trade (Ideal is < 2% of total equity)
    if (trade.entry_price && trade.stop_loss && trade.quantity) {
        const riskAmount = Math.abs(trade.entry_price - trade.stop_loss) * trade.quantity * (trade.leverage || 1);
        const riskPercent = (riskAmount / userEquity) * 100;
        
        if (riskPercent > 5) score -= 40;
        else if (riskPercent > 2) score -= 20;
    } else {
        // No stop loss is a massive risk
        score -= 50;
    }

    // 2. Leverage check
    if (trade.leverage > 20) score -= 20;
    else if (trade.leverage > 10) score -= 10;

    return Math.max(0, score);
};

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

/**
 * AI Insights Mock (Phase 8)
 * In a real production app, this would call an LLM with the trade history.
 */
export const getAIInsights = (trades: any[]) => {
    const winRate = trades.filter(t => t.pnl_net > 0).length / trades.length;
    
    if (winRate < 0.4) {
        return "Risk of over-trading or poor entry selection detected. Consider tightening stop losses.";
    } else if (winRate > 0.6) {
        return "Strong performance. Strategy shows high consistency. Consider scaling position size slightly.";
    }
    return "Balanced performance. Maintain current risk management parameters.";
};
