import { Types } from 'mongoose';
import { TimestampedDocument } from './base.types';
import { IUser } from './user.types';

export interface IConversation extends TimestampedDocument {
  participants: IUser[];  
  conclusion: string;
}

export interface ConversationResponse {
  _id: string;
  participants: IUser[];  
  conclusion: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: {
    content: string;
    createdAt: Date;
  };
}
