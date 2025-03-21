import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import messageRepository from '../repositories/message.repository';
import userRepository from '../repositories/user.repository';

class ConversationController {
  async getConversations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Get all messages where user is either sender or receiver
      const messages = await messageRepository.getUserConversations(userId);

      // Group messages by conversation partner
      const conversationsMap = new Map();
      
      for (const message of messages) {
        const partnerId = message.sender._id.toString() === userId 
          ? message.receiver._id.toString()
          : message.sender._id.toString();
        
        if (!conversationsMap.has(partnerId)) {
          const partner = message.sender._id.toString() === userId 
            ? message.receiver 
            : message.sender;
          
          conversationsMap.set(partnerId, {
            profile: {
              id: partner._id,
              username: partner.username,
              avatar: partner.avatar
            },
            lastMessage: message,
            unreadCount: message.sender._id.toString() !== userId && !message.read ? 1 : 0
          });
        } else {
          const conv = conversationsMap.get(partnerId);
          if (message.createdAt > conv.lastMessage.createdAt) {
            conv.lastMessage = message;
          }
          if (message.sender._id.toString() !== userId && !message.read) {
            conv.unreadCount++;
          }
        }
      }

      const conversations = Array.from(conversationsMap.values());
      conversations.sort((a, b) => 
        new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
      );

      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching conversations', error: (error as Error).message });
    }
  }

  async getConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const partnerId = req.params.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const messages = await messageRepository.getConversation(userId, partnerId);
      
      // Mark messages as read
      await messageRepository.markAsRead(partnerId, userId);

      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching conversation', error: (error as Error).message });
    }
  }
}

export default new ConversationController(); 