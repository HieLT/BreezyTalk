import { Request, Response } from 'express';
import userRepository from '../repositories/user.repository';
import { AuthRequest } from '../types/base.types';

class ProfileController {
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await userRepository.findById(req.user?.userId!);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching profile', error: (error as Error).message });
    }
  }

  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        res.status(400).json({ message: 'Search query is required' });
        return;
      }

      const users = await userRepository.searchUsers(query);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error searching users', error: (error as Error).message });
    }
  }
}

export default new ProfileController(); 