import express from 'express';
import profileController from '../controllers/profile.controller';
import { authentication } from '../middleware/auth.middleware';

const profileRouter = express.Router();

profileRouter.use(authentication);

profileRouter.get('/', profileController.getProfile);

profileRouter.get('/search', profileController.searchUsers);

export default profileRouter; 