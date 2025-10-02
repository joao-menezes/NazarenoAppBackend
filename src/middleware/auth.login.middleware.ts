import {Request,Response, NextFunction} from "express";
import jwt from 'jsonwebtoken';
import HttpCodes from "http-status-codes";
import dotenv from 'dotenv';
import {SharedErrors} from "../shared/errors/shared-errors";
import logger from "../shared/utils/logger";

dotenv.config();

interface TokenPayload {
    userId: string;
    username: string;
    age: number;
    role: string;
}

const secret = String(process.env.JWT_SECRET);
export const AuthLoginMiddleware = (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1];

        if (!token) {
            res.status(HttpCodes.UNAUTHORIZED).send(SharedErrors.AccessDenied)
            return;
        }

        const decoded = jwt.verify(token, secret) as TokenPayload;

        req.user = decoded;
        req.userId = decoded.userId;

        next();
    }catch (error) {
        logger.info(`Error in token: ${error} - ${__filename}`);
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(HttpCodes.UNAUTHORIZED).json({ message: SharedErrors.InvalidToken });
        } else if (error instanceof jwt.TokenExpiredError) {
            res.status(HttpCodes.UNAUTHORIZED).json({ message: 'Token expirado' });
        } else {
            res.status(HttpCodes.BAD_REQUEST).json({ message: 'Erro no processamento do token' });
        }
    }
}