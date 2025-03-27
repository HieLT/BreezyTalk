import { Router } from 'express';
import authRoutes from './auth.routes';
import conversationRoutes from './conversation.routes';
import profileRoutes from './profile.routes';

const router = Router();

// Health check route
router.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

// API routes
router.use('/auth', authRoutes);
router.use('/conversations', conversationRoutes);
router.use('/profile', profileRoutes);

export default router;