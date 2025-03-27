import { Types } from 'mongoose';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import { IConversation, ConversationResponse } from '../types/conversation.types';
import { IMessage } from '../types/message.types';

class ConversationRepository {
  async create(participants: string[]): Promise<IConversation> {
    const conversation = new Conversation({
      participants: participants.map(id => ({
        userId: new Types.ObjectId(id)
      })),
      conclusion: ''
    });
    return await conversation.save();
  }

  async findById(id: string): Promise<IConversation | null> {
    return await Conversation.findById(id)
      .populate('participants.userId', 'username email')
      .lean();
  }

  async findByParticipants(participantIds: string[]): Promise<IConversation | null> {
    const participantObjectIds = participantIds.map(id => new Types.ObjectId(id));
    const conversation = await Conversation.findOne({
      $and: [

        { 'participants.userId': { $all: participantObjectIds } },
        // Make sure there are no additional participants
        { 'participants.userId': { $size: participantObjectIds.length } }
      ]
    })
    .populate('participants.userId', 'username email')
    .lean<IConversation>();

    return conversation;
  }

  async getUserConversations(userId: string): Promise<ConversationResponse[]> {
    const userObjectId = new Types.ObjectId(userId);
    
    let query: any = {
      'participants': userObjectId
    };

    const conversations = await Conversation.find(query)
      .populate('participants.userId', 'username email')
      .lean();

    // Get the last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await Message.findOne({
          conversationId: conversation._id,
          deleted_at: null
        })
        .sort({ createdAt: -1 })
        .lean();

        return {
          _id: conversation._id.toString(),
          participants: conversation.participants,
          participants_number: conversation.participants.length,
          conclusion: conversation.conclusion,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt
          } : undefined
        };
      })
    );

    return conversationsWithLastMessage;
  }
  async getParticipants(conversationId: string): Promise<Partial<IConversation>['participants']> {
    const conversation = await Conversation.findById(conversationId)
    .lean();

    return conversation?.participants;
  }
  async getConversationMessages(conversationId: string): Promise<IMessage[]> {
    return await Message.find({ 
      conversationId: new Types.ObjectId(conversationId),
      deleted_at: null
    })
      .sort({ createdAt: 1 })
      .populate('senderId', 'username email')
      .lean<IMessage[]>();
  }
}

export default new ConversationRepository(); 