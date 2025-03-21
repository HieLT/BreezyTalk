import User from '../models/user.model';
import { IUser } from '../types';

interface UserData {
  email: string;
  username: string;
  password: string;
  avatar?: string;
}

class UserRepository {
  async create(userData: UserData): Promise<IUser> {
    return await User.create(userData);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id).select('-password');
  }

  async findAll(): Promise<IUser[]> {
    return await User.find().select('-password');
  }

  async update(id: string, updateData: Partial<UserData>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
  }

  async delete(id: string): Promise<IUser | null> {
    return await User.findByIdAndDelete(id);
  }

  async searchUsers(query: string): Promise<IUser[]> {
    return await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
    .select('-password')
    .limit(10);
  }
}

export default new UserRepository(); 