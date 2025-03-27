import User from '../models/user.model';
import { IUser } from '../types/user.types';

interface UserData {
  email: string;
  username: string;
  password: string;
  avatar?: string;
}

class UserRepository {
  async create(userData: UserData): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id)
      .select('-password')
      .lean();
  }

  async getAll(): Promise<IUser[]> {
    return await User.find()
      .select('-password')
      .lean();
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    .select('-password')
    .lean();
  }

  async delete(id: string): Promise<IUser | null> {
    return await User.findByIdAndDelete(id).lean();
  }

  async searchUsers(query: string): Promise<IUser[]> {
    const searchRegex = new RegExp(query, 'i');
    return await User.find({
      $or: [
        { username: searchRegex },
        { email: searchRegex }
      ]
    })
    .select('-password')
    .lean();
  }
}

export default new UserRepository(); 