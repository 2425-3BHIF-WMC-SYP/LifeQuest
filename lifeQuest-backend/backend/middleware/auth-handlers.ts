import jwt, {JwtPayload} from 'jsonwebtoken';
import {Request, Response,NextFunction} from 'express';
import {StatusCodes} from "http-status-codes"
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
    payload: JwtPayload;
}
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error("No bearer token available");
        }
        const decoded: string | JwtPayload = jwt.verify(token, JWT_SECRET!);
        (req as AuthRequest).payload = (decoded as JwtPayload);

        next();
    } catch (err) {
        res.status(StatusCodes.UNAUTHORIZED).send(`Please authenticate! ${err}`);
    }
};