import { User } from '@/types';
import { apiClient } from './api';

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  autoSave: boolean;
  theme: 'light' | 'dark';
}

export const userService = {
  // Update user profile
  updateProfile: async (data: UpdateUserRequest): Promise<User> => {
    const user = await apiClient.put<{
      id: string;
      name: string;
      email: string;
      avatar?: string;
      status: string;
    }>('/me', data);
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : {};
        const updatedUser = { ...currentUser, ...user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        // Just save the new user data
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      status: user.status as 'online' | 'offline' | 'away',
    };
  },

  // Update avatar
  updateAvatar: async (avatarUrl: string): Promise<User> => {
    return userService.updateProfile({ avatar: avatarUrl });
  },

  // Get user preferences (stored in localStorage for now, can be moved to backend)
  getPreferences: (): UserPreferences => {
    if (typeof window === 'undefined') {
      return {
        emailNotifications: true,
        autoSave: true,
        theme: 'light',
      };
    }
    
    const prefs = localStorage.getItem('userPreferences');
    if (prefs) {
      try {
        return JSON.parse(prefs);
      } catch (error) {
        console.error('Failed to parse user preferences:', error);
        localStorage.removeItem('userPreferences');
      }
    }
    
    return {
      emailNotifications: true,
      autoSave: true,
      theme: 'light',
    };
  },

  // Save user preferences
  savePreferences: (preferences: UserPreferences): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    }
  },

  // Delete user account
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/me');
    // Clear all local data
    if (typeof window !== 'undefined') {
      localStorage.clear();
      apiClient.clearAuthToken();
    }
  },
};
