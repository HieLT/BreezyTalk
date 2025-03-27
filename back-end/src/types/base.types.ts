import { Document } from 'mongoose';
import { Request } from 'express';

export interface TimestampedDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
} 