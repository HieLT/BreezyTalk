import { TimestampedDocument } from './base.types';
import { IUser } from './user.types';

export interface IConversation extends TimestampedDocument {
  userId : IUser;  
  conversationId : IConversation;
}

export interface UserConversationResponse {
  _id: string;
  userId: IUser;
  conversationId: IConversation;
  createdAt: Date;
  updatedAt: Date;
}
