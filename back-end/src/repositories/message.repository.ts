import Message from '../models/message.model';
import { IMessage } from '../types';

interface MessageData {
  sender: string;
  receiver: string;
  content: string;
}

class MessageRepository {
  async create(messageData: MessageData): Promise<IMessage> {
    return await Message.create(messageData);
  }

  async findById(id: string): Promise<IMessage | null> {
    return await Message.findById(id).populate('sender receiver', 'username avatar');
  }

  async getConversation(userId1: string, userId2: string): Promise<IMessage[]> {
    return await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender receiver', 'username avatar');
  }

  async markAsRead(senderId: string, receiverId: string): Promise<any> {
    return await Message.updateMany(
      { sender: senderId, receiver: receiverId, read: false },
      { read: true }
    );
  }

  async delete(id: string): Promise<IMessage | null> {
    return await Message.findByIdAndDelete(id);
  }

  async getUserConversations(userId: string): Promise<IMessage[]> {
    return await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('sender receiver', 'username avatar')
    .exec();
  }
}

export default new MessageRepository(); 