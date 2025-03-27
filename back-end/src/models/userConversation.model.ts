import mongoose from 'mongoose';
import { IUserConversation } from '../types/userConversation.types';

const userConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true 
  }
}, {
  timestamps: true
});

const UserConversation = mongoose.model<IUserConversation>('UserConversation', userConversationSchema);
export default UserConversation; 