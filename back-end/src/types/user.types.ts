import { TimestampedDocument } from './base.types';

export interface IUser extends TimestampedDocument {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface UserResponse {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
} 