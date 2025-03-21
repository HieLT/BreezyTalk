import express from 'express';
import { auth } from '../middleware/auth.middleware';
import authController from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

export default router; 