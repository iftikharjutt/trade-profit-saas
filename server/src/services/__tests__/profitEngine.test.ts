import { calculatePnL, calculateEquityCurve, calculateDrawdown } from '../profitEngine';

describe('Profit Engine - calculatePnL', () => {
    test('LONG trade profit with leverage and fees', () => {
        const input = {
            type: 'LONG' as const,
            entryPrice: 100,
            exitPrice: 110,
            quantity: 1,
            leverage: 10,
            fees: 5
        };
        const result = calculatePnL(input);
        // (110 - 100) * 1 * 10 = 100 gross
        // 100 - 5 = 95 net
        // Margin = 100 * 1 = 100
        // ROI = (95 / 100) * 100 = 95%
        expect(result.grossPnL).toBe(100);
        expect(result.netPnL).toBe(95);
        expect(result.roi).toBe(95);
    });

    test('SHORT trade profit with leverage and fees', () => {
        const input = {
            type: 'SHORT' as const,
            entryPrice: 100,
            exitPrice: 90,
            quantity: 2,
            leverage: 5,
            fees: 10
        };
        const result = calculatePnL(input);
        // (100 - 90) * 2 * 5 = 100 gross
        // 100 - 10 = 90 net
        // Margin = 100 * 2 = 200
        // ROI = (90 / 200) * 100 = 45%
        expect(result.grossPnL).toBe(100);
        expect(result.netPnL).toBe(90);
        expect(result.roi).toBe(45);
    });
});

describe('Analytics Helpers', () => {
    test('calculateEquityCurve should accumulate profit', () => {
        const trades = [
            { pnl_net: 100, closed_at: '2026-01-01' },
            { pnl_net: -50, closed_at: '2026-01-02' },
            { pnl_net: 200, closed_at: '2026-01-03' },
        ];
        const curve = calculateEquityCurve(trades);
        expect(curve[0].balance).toBe(100);
        expect(curve[1].balance).toBe(50);
        expect(curve[2].balance).toBe(250);
    });

    test('calculateDrawdown should find max dip from peak', () => {
        const curve = [
            { balance: 100 },
            { balance: 200 },
            { balance: 150 }, // dip 50
            { balance: 300 },
            { balance: 200 }, // dip 100 (max)
            { balance: 250 },
        ];
        const drawdown = calculateDrawdown(curve);
        expect(drawdown).toBe(100);
    });
});
