import { Types } from 'mongoose';
import { TimestampedDocument } from './base.types';
import { IUser } from './user.types';
import { IConversation } from './conversation.types';

export interface IMessage extends TimestampedDocument {
  senderId: Types.ObjectId | IUser;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  conversationId: Types.ObjectId | IConversation;
  content: string; 
  seen_at: Date | null;
  deleted_at: Date | null;
}