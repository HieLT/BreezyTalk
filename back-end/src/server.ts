import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { connectDatabase } from './config/database';
import routes from './routes/index.route';
import SocketService from './services/socket.service';

// Load environment variables
dotenv.config();

const app: Express = express();
const httpServer = createServer(app);

// Initialize socket service
new SocketService(httpServer);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('', routes);

// Connect to MongoDB
connectDatabase()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  }); 