import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/base.types';

const JWT_SECRET = process.env.JWT_SECRET as string;
export const verifyToken = async (token: string): Promise<{ userId: string } | null> => {
  try {
    if (!token) {
      return null;
    }

    const cleanToken = token.replace('Bearer ', '');
    const decoded = jwt.verify(cleanToken, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

// REST API middleware
export const authentication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization');
    const decoded = await verifyToken(token || '');
    
    if (!decoded) {
      res.status(401).json({ message: 'No authentication token, access denied' });
      return;
    }

    req.user = { userId: decoded.userId };
    if (!decoded.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    next();
  } catch (error) {
    console.error('REST authentication error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// WebSocket authentication
export const wsAuthentication = async (token: string): Promise<{ userId: string } | null> => {
  try {
    const decoded = await verifyToken(token);
    if (!decoded) {
      throw new Error('Invalid token');
    }
    return decoded;
  } catch (error) {
    console.error('WebSocket authentication error:', error);
    return null;
  }
}; 