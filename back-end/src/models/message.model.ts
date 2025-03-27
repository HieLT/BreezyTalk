import mongoose from 'mongoose';
import { IMessage } from '../types/message.types';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    mutable: false
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'file'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  seen_at: {
    type: Date,
    default: null
  },
  deleted_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const Message = mongoose.model<IMessage>('Message', messageSchema);
export default Message; 