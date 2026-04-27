import { z } from 'zod';

export const addExecutionSchema = z.object({
    body: z.object({
        position_id: z.number().int().optional(),
        asset_symbol: z.string().min(1, "Asset symbol is required"),
        side: z.enum(["LONG", "SHORT"]),
        type: z.enum(["ENTRY", "EXIT"]),
        price: z.number().positive(),
        quantity: z.number().positive(),
        fees: z.number().min(0).default(0),
        leverage: z.number().min(1).default(1),
        portfolio_id: z.number().int().optional(),
    }),
});
