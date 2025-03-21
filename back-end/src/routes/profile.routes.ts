import express from 'express';
import { auth } from '../middleware/auth.middleware';
import profileController from '../controllers/profile.controller';

const profileRouter = express.Router();

profileRouter.get('/', auth, profileController.getProfile);

profileRouter.get('/search', auth, profileController.searchUsers);

export default profileRouter; 