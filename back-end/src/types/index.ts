import { Request } from 'express';
import { Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IMessage extends Document {
  sender: IUser['_id'];
  receiver: IUser['_id'];
  content: string;
  read: boolean;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
} 