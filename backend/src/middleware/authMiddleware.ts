// backend/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken' ; 

declare global {
    namespace Express {
        interface Request {
            user?: { walletAddress: string };
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { walletAddress: string };
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};