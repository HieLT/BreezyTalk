import { Router } from 'express';
import authRoutes from './auth.routes';
import messageRoutes from './message.routes';
import profileRouter from './profile.routes';
import conversationRoutes from './conversation.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

router.use('/auth', authRoutes);
router.use('/messages', messageRoutes);
router.use('/profile', profileRouter);
router.use('/conversations', conversationRoutes);

export default router;