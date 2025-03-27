import { Types } from 'mongoose';
import Message from '../models/message.model';
import { IMessage } from '../types/message.types';

class MessageRepository {
  async create(data: Partial<IMessage>): Promise<IMessage> {
    const savedMessage = await Message.create({
      senderId: data.senderId,
      conversationId: data.conversationId,
      content: data.content
    });
    
    const populatedMessage = await savedMessage.populate('senderId', 'username avatar');
    
    return populatedMessage;
  }

  async findById(id: string): Promise<IMessage | null> {
    return await Message.findById(id)
      .populate('senderId', 'username avatar')
      .lean();
  }

  async getConversationMessages(conversationId: string): Promise<IMessage[]> {
    return await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'username')
      .lean();
  }

  async markAsSeen(conversationId: string, senderId: string, seen_at: Date): Promise<void> {
    await Message.updateMany(
      { 
        conversationId: new Types.ObjectId(conversationId),
        senderId: new Types.ObjectId(senderId),
        seen_at: null
      },
      { seen_at }
    );
  }

  async deleteMessage(messageId: string): Promise<IMessage | null> {
    const now = new Date();
    await Message.updateOne(
      { _id: new Types.ObjectId(messageId) },
      { deleted_at: now }
    );
    return await Message.findById(messageId)
      .populate('senderId', 'username avatar')
      .lean<IMessage>();
  }

  async getUserMessages(userId: string): Promise<IMessage[]> {
    return await Message.find({
      senderId: new Types.ObjectId(userId),
      deleted_at: null
    })
      .sort({ createdAt: -1 })
      .populate('senderId', 'username avatar')
      .lean();
  }
}

export default new MessageRepository(); 