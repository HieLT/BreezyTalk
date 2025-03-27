import mongoose from 'mongoose';
import { IConversation } from '../types/conversation.types';

const conversationSchema = new mongoose.Schema({
  participants: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true
  },
  conclusion: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
export default Conversation; 