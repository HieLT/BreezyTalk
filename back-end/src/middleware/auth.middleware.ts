import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';
const JWT_SECRET = process.env.JWT_SECRET as string;

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('JWT_SECRET',JWT_SECRET);
    
    if (!token) {
      res.status(401).json({ message: 'No authentication token, access denied' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    console.log('decoded',decoded);
    
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    console.log('error',error);
    
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 