import { Response } from 'express';
import messageRepository from '../repositories/message.repository';
import { AuthRequest, IMessage } from '../types';
class MessageController {
  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { receiverId, content } = req.body;
      const senderId = req.user?.userId;

      const message = await messageRepository.create({
        sender: senderId!,
        receiver: receiverId,
        content
      }) as IMessage;

      const populatedMessage = await messageRepository.findById(message._id as string);
      res.status(201).json(populatedMessage);
    } catch (error) {
      res.status(500).json({ message: 'Error sending message', error: (error as Error).message });
    }
  }

  async getConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?.userId;

      const messages = await messageRepository.getConversation(currentUserId!, userId);
      
      await messageRepository.markAsRead(userId, currentUserId!);

      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching conversation', error: (error as Error).message });
    }
  }

  async deleteMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const message = await messageRepository.findById(messageId);

      if (!message) {
        res.status(404).json({ message: 'Message not found' });
        return;
      }

      const senderId = (message as any).sender._id;
      if (senderId.toString() !== req.user?.userId) {
        res.status(403).json({ message: 'Not authorized to delete this message' });
        return;
      }

      await messageRepository.delete(messageId);
      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting message', error: (error as Error).message });
    }
  }
}

export default new MessageController(); 