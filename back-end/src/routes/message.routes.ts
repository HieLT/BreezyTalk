import express from 'express';
import { auth } from '../middleware/auth.middleware';
import messageController from '../controllers/message.controller';

const router = express.Router();

router.use(auth);

router.post('/', messageController.sendMessage);

router.get('/:userId', messageController.getConversation);

router.delete('/:messageId', messageController.deleteMessage);

export default router; 