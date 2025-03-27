import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { wsAuthentication } from '../middleware/auth.middleware';
import messageRepository from '../repositories/message.repository';
import conversationRepository from '../repositories/conversation.repository';
import { IMessage } from '../types/message.types';
import { IConversation } from '../types/conversation.types';

interface SocketData {
  userId: string;
}

interface ServerToClientEvents {
  receive_message: (data: IMessage) => void;
  message_deleted: (data: IMessage) => void;
  message_seen: (data: { conversationId: string; senderId: string; seen_at: Date }) => void;
  receive_conversations: (data: any[]) => void;
  receive_conversation_messages: (data:{conversationId: string, messages: IMessage[]}) => void;
  received_message: (data: IMessage) => void;
  conversation_notifications: (data: IMessage) => void;
  deleted_message: (data: IMessage) => void;
  marked_seen: (data: { conversationId: string, senderId: string, seen_at: Date }) => void;

}

interface ClientToServerEvents {
  send_message: (data: IMessage) => void;
  join_conversation_room: (conversationId: string) => void;
  leave_conversation_room: (conversationId: string) => void;
  delete_message: (messageId: string, conversationId: string) => void;
  mark_message_as_seen: (data: { conversationId: string, senderId: string, seen_at: Date }) => void;
  get_conversations: () => void;
}

export class SocketService {
  private io: SocketServer<
    ClientToServerEvents,
    ServerToClientEvents,
    SocketData
  >;

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
      }
    });
    console.log(this.io);
    

    this.initializeMiddleware();
    this.initializeHandlers();
  }

  private initializeMiddleware(): void {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const decoded = await wsAuthentication(token);
        console.log(`User ${socket.data.userId} joined`);

        if (!decoded) {
          throw new Error('Authentication failed');
        }

        socket.data.userId = decoded.userId;
        next();
      } catch (err) {
        const error = err as Error;
        console.error('Socket authentication error:', error.message);
        next(new Error('Authentication error'));
      }
    });
  }

  private initializeHandlers(): void {
    this.io.on('connection', (socket) => {
      socket.on('join_conversation_room', async (conversationId: string) => {
        console.log(`User ${socket.data.userId} joining conversation: ${conversationId}`);
        socket.join(conversationId);
      
          // Fetch messages for this conversation
          const messages = await messageRepository.getConversationMessages(conversationId);
          
          // Send messages only to the user who just joined
          socket.emit('receive_conversation_messages', {
            conversationId,
            messages
          });
        }) 

      socket.on('leave_conversation_room', (conversationId: string) => {
        console.log(`User ${socket.data.userId} leaving conversation: ${conversationId}`);
        socket.leave(conversationId);
      });
      // Handle get Conversations
      socket.on('get_conversations', async () => {
        try {
          const conversations = await conversationRepository.getUserConversations(socket.data.userId);
          socket.emit('receive_conversations', conversations);
        } catch (error) {
          console.error('Error fetching conversations:', error);
        }
      });

      socket.on('send_message', async (message: IMessage) => {
        try {
          const { conversationId, content } = message;
      
          const newMessage = await messageRepository.create({
            senderId: socket.data.userId,
            conversationId: conversationId,
            content
          }); 
          
          this.io.to(conversationId.toString()).emit('received_message', newMessage);
          this.io.to(conversationId.toString()).emit('conversation_notifications', newMessage);
      
        } catch (error) {
          console.error('Error handling message:', error);
        }
      });

      socket.on('delete_message', async (messageId: string, conversationId: string) => {
        try {
          const deletedMessage = await messageRepository.deleteMessage(messageId);
          if (deletedMessage) {    
            this.io.to(conversationId.toString()).emit('deleted_message', deletedMessage);
          }
        } catch (error) {
          console.error('Error deleting message:', error);
        }
      });

      socket.on('mark_message_as_seen', async (data: { conversationId: string, senderId: string, seen_at: Date }) => {
        try {
          const { conversationId, senderId, seen_at } = data;
          await messageRepository.markAsSeen(conversationId, senderId, seen_at);
          
          this.io.to(conversationId.toString()).emit('marked_seen', {conversationId, senderId, seen_at});
     
        } catch (error) {
          console.error('Error marking message as seen:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.data.userId);
        // Socket.io automatically handles leaving all rooms on disconnect
      });
    });
  }

  // Public method to get io instance if needed elsewhere
  public getIO(): SocketServer {
    return this.io;
  }
}

export default SocketService;