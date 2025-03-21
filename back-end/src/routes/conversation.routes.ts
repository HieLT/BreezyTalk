import express from 'express';
import { auth } from '../middleware/auth.middleware';
import conversationController from '../controllers/conversation.controller';

const router = express.Router();

// Get all conversations for the authenticated user
router.get('/', auth, conversationController.getConversations);

// Get conversation with a specific user
router.get('/:userId', auth, conversationController.getConversation);

export default router; 