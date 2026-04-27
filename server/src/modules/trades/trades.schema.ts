import { z } from 'zod';

export const addTradeSchema = z.object({
    body: z.object({
        asset_name: z.string().min(1, "Asset name is required"),
        asset_class: z.string().min(1, "Asset class is required"),
        position_type: z.enum(["LONG", "SHORT"]),
        entry_price: z.number().positive(),
        exit_price: z.number().positive().optional(),
        quantity: z.number().positive(),
        leverage: z.number().min(1).default(1),
        fees: z.number().min(0).default(0),
        status: z.enum(["OPEN", "CLOSED"]).default("CLOSED"),
        opened_at: z.string().datetime().optional(),
        closed_at: z.string().datetime().optional(),
    }),
});
