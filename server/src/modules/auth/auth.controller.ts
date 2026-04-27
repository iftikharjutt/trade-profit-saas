import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../db/prisma';
import { sendSuccess, sendError } from '../../utils/response';

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email, password } = req.body;

            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return sendError(res, 'Email already in use', 400);
            }

            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password_hash
                }
            });

            return sendSuccess(res, { id: user.id, name: user.name, email: user.email }, 201);
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return sendError(res, 'Invalid credentials', 401);
            }

            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return sendError(res, 'Invalid credentials', 401);
            }

            const secret = process.env.JWT_SECRET || 'fallback_secret';
            const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1d' });

            return sendSuccess(res, {
                token,
                user: { id: user.id, name: user.name, email: user.email }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getMe(req: any, res: Response, next: NextFunction) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: { id: true, name: true, email: true, created_at: true }
            });

            if (!user) {
                return sendError(res, 'User not found', 404);
            }

            return sendSuccess(res, user);
        } catch (error) {
            next(error);
        }
    }
}
