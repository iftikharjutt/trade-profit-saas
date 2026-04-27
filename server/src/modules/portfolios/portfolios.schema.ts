import { z } from 'zod';

export const createPortfolioSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Portfolio name is required"),
        description: z.string().optional(),
        currency: z.string().default("USD")
    }),
});
