import { Router } from 'express';
import { authentication } from '../middleware/auth.middleware';
import conversationController from '../controllers/conversation.controller';

const conversationRouter = Router();

conversationRouter.use(authentication);

conversationRouter.post('/', conversationController.createConversation);


export default conversationRouter; 