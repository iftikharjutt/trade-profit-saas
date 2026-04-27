import { calculatePositionUpdate } from '../positionEngine';

describe('Position Engine - Advanced PnL', () => {
    test('Scaling into a LONG position (Weighted Average)', () => {
        let state = { avgEntryPrice: 0, totalQuantity: 0, realizedPnL: 0, totalFees: 0 };
        
        // First Entry: 1 BTC at $50k
        state = calculatePositionUpdate(state, 'LONG', 'ENTRY', 50000, 1, 10);
        expect(state.avgEntryPrice).toBe(50000);
        expect(state.totalQuantity).toBe(1);

        // Second Entry: 1 BTC at $60k
        state = calculatePositionUpdate(state, 'LONG', 'ENTRY', 60000, 1, 10);
        expect(state.avgEntryPrice).toBe(55000);
        expect(state.totalQuantity).toBe(2);
    });

    test('Partial close of a LONG position', () => {
        let state = { avgEntryPrice: 55000, totalQuantity: 2, realizedPnL: 0, totalFees: 20 };
        
        // Exit: 1 BTC at $70k (Long)
        // PnL = (70000 - 55000) * 1 = $15k
        state = calculatePositionUpdate(state, 'LONG', 'EXIT', 70000, 1, 10);
        expect(state.realizedPnL).toBe(15000);
        expect(state.totalQuantity).toBe(1);
        expect(state.avgEntryPrice).toBe(55000); // Entry price stays for remaining qty
    });

    test('Leveraged SHORT position behavior', () => {
        let state = { avgEntryPrice: 0, totalQuantity: 0, realizedPnL: 0, totalFees: 0 };
        
        // Entry: 100 Units at $10 with 10x leverage
        state = calculatePositionUpdate(state, 'SHORT', 'ENTRY', 10, 100, 5, 10);
        
        // Exit: 100 Units at $9 (Profit for Short)
        // PnL = (10 - 9) * 100 * 10 = $1k profit
        state = calculatePositionUpdate(state, 'SHORT', 'EXIT', 9, 100, 5, 10);
        expect(state.realizedPnL).toBe(1000);
    });
});
