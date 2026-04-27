import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
    user?: { id: number };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return sendError(res, 'Access denied. No token provided.', 401);
    }

    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const decoded = jwt.verify(token, secret) as { id: number };
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        return sendError(res, 'Invalid token.', 403);
    }
};
