import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../middleware/auth.middleware';
import messageRepository from '../repositories/message.repository';

interface SocketData {
  userId: string;
}

interface ServerToClientEvents {
  receive_message: (data: { senderId: string; message: string }) => void;
}

interface ClientToServerEvents {
  send_message: (data: { receiverId: string; message: string }) => void;
}

interface InterServerEvents {
  ping: () => void;
}

export class SocketService {
  private io: SocketServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
      }
    });

    this.initializeMiddleware();
    this.initializeHandlers();
  }

  private initializeMiddleware(): void {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const decoded = await verifyToken(token);
        socket.data.userId = decoded.userId;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });
  }

  private initializeHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.data.userId);

      // Join a personal room for private messages
      socket.join(socket.data.userId);

      socket.on('send_message', async (data) => {
        try {
          const { receiverId, message } = data;
          
          // Save message to database
          const newMessage = await messageRepository.create({
            sender: socket.data.userId,
            receiver: receiverId,
            content: message
          });

          // Emit to receiver's room
          this.io.to(receiverId).emit('receive_message', {
            senderId: socket.data.userId,
            message
          });
        } catch (error) {
          console.error('Error handling message:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.data.userId);
      });
    });
  }

  // Public method to get io instance if needed elsewhere
  public getIO(): SocketServer {
    return this.io;
  }
}

export default SocketService; 