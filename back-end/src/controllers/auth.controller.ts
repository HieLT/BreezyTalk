import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import userRepository from '../repositories/user.repository';
import { AuthRequest } from '../types/base.types';

const JWT_SECRET=  process.env.JWT_SECRET as string;
const JWT_EXPIRE = '1h';
  
const JWT_OPTIONS: SignOptions = {
  expiresIn:JWT_EXPIRE
};

class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, username, password } = req.body;

      if(!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
      }
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      const user = await userRepository.create({
        email,
        username,
        password
      });

      const token = jwt.sign(
        { userId: user._id },
        JWT_SECRET,
        JWT_OPTIONS
      );

      res.status(201).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          avatar: user.avatar
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', error: (error as Error).message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await userRepository.findByEmail(email);
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign(
        { userId: user._id },
        JWT_SECRET,
        JWT_OPTIONS
      );

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          avatar: user.avatar
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error: (error as Error).message });
    }
  }

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

export default new AuthController(); 