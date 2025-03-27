import { Request, Response } from 'express';
import { AuthRequest } from '../types/base.types';
import conversationRepository from '../repositories/conversation.repository';
import { IUser } from '../types/user.types';

class ConversationController {
  async createConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { participant_ids = [] as IUser[] } = req.body;
      const userId = req.user?.userId;
      
      if (!Array.isArray(participant_ids) || participant_ids.length < 1) {
        res.status(400).json({ 
          message: 'At least one other participant is required' 
        });
        return;
      }
      
      const uniqueParticipants = new Set([userId, ...participant_ids]);
      const sortedParticipants = Array.from(uniqueParticipants).sort();

      const existingConversation = await conversationRepository.findByParticipants(sortedParticipants);
      
      if (existingConversation) {
        res.status(200).json({ 
          message: 'Conversation already exists',
          conversation: existingConversation 
        });
        return;
      }

      // Create new conversation with sorted participants
      const conversation = await conversationRepository.create(sortedParticipants);
      res.status(201).json(conversation);

    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ 
        message: 'Error creating conversation', 
        error: (error as Error).message 
      });
    }
  }
}

export default new ConversationController(); 