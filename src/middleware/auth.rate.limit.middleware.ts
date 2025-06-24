import rateLimit from "express-rate-limit";
import HttpCodes from 'http-status-codes';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 200,
    message: { error: 'Too many attempts, try again later.' },
    statusCode: HttpCodes.TOO_MANY_REQUESTS,
});