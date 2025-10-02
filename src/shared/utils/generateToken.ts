import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {TokenPayload} from "../../interface/TokenPayload.interface";

dotenv.config();

const secret = String(process.env.JWT_SECRET);

/**
 * @param userData - O payload do usuário a ser incluído no payload do token.
 * @returns O token JWT gerado.
 */
export const generateToken = (userData: TokenPayload): string => {
    if (!secret) {
        throw new Error('JWT_SECRET não está definido no arquivo .env');
    }

    const payload = {
        userId: userData.userId,
        username: userData.username,
        age: userData.age,
        role: userData.role,
    };

    return jwt.sign(payload, secret, {
        expiresIn: '1h',
    });
};
