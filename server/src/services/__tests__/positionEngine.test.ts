import { calculatePositionUpdate } from '../positionEngine';

describe('Enterprise Position Engine - Stress Tests', () => {
    test('Precision: Floating point trap (0.1 + 0.2)', () => {
        let state = { avgEntryPrice: 0.1, totalQuantity: 1, realizedPnL: 0, totalFees: 0 };
        // Adding 0.2 at 1 qty should result in 0.15 exactly
        state = calculatePositionUpdate(state, 'LONG', 'ENTRY', 0.2, 1, 0);
        expect(state.avgEntryPrice).toBe(0.15);
    });

    test('Scaling In: Multiple entries with leverage', () => {
        let state = { avgEntryPrice: 0, totalQuantity: 0, realizedPnL: 0, totalFees: 0 };
        
        state = calculatePositionUpdate(state, 'LONG', 'ENTRY', 100, 1, 5, 10);
        state = calculatePositionUpdate(state, 'LONG', 'ENTRY', 110, 1, 5, 10);
        
        expect(state.avgEntryPrice).toBe(105);
        expect(state.totalQuantity).toBe(2);
        expect(state.totalFees).toBe(10);
    });

    test('Partial Closes: Complex PnL tracking', () => {
        let state = { avgEntryPrice: 100, totalQuantity: 10, realizedPnL: 0, totalFees: 0 };
        
        // Sell 5 at 120 (Long)
        // PnL = (120 - 100) * 5 = 100
        state = calculatePositionUpdate(state, 'LONG', 'EXIT', 120, 5, 10, 1);
        expect(state.realizedPnL).toBe(100);
        expect(state.totalQuantity).toBe(5);
        
        // Sell remaining 5 at 80
        // PnL = (80 - 100) * 5 = -100
        // Total PnL = 100 + (-100) = 0
        state = calculatePositionUpdate(state, 'LONG', 'EXIT', 80, 5, 10, 1);
        expect(state.realizedPnL).toBe(0);
        expect(state.totalQuantity).toBe(0);
        expect(state.totalFees).toBe(20);
    });

    test('Edge Case: Over-exiting position should throw', () => {
        const state = { avgEntryPrice: 100, totalQuantity: 1, realizedPnL: 0, totalFees: 0 };
        expect(() => {
            calculatePositionUpdate(state, 'LONG', 'EXIT', 110, 2, 0);
        }).toThrow(/Insufficient position size/);
    });

    test('Edge Case: Zero price should throw', () => {
        const state = { avgEntryPrice: 0, totalQuantity: 0, realizedPnL: 0, totalFees: 0 };
        expect(() => {
            calculatePositionUpdate(state, 'LONG', 'ENTRY', 0, 1, 0);
        }).toThrow(/must be positive/);
    });

    test('Short Position: Leveraged profit', () => {
        let state = { avgEntryPrice: 0, totalQuantity: 0, realizedPnL: 0, totalFees: 0 };
        // Enter Short at 100
        state = calculatePositionUpdate(state, 'SHORT', 'ENTRY', 100, 1, 0, 10);
        // Exit Short at 90 (10 point drop * 1 qty * 10 leverage = 100 profit)
        state = calculatePositionUpdate(state, 'SHORT', 'EXIT', 90, 1, 0, 10);
        expect(state.realizedPnL).toBe(100);
    });
});
