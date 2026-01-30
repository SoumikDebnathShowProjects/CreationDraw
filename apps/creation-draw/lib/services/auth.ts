import { User } from '@/types';
import { apiClient } from './api';

interface SignInResponse {
  token: string;
  user: User;
}

interface SignUpResponse {
  token: string;
  user: User;
}

export const authService = {
  signIn: async (email: string, password: string): Promise<User> => {
    const response = await apiClient.post<SignInResponse>('/auth/signin', {
      email,
      password,
    });
    
    apiClient.setAuthToken(response.token);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response.user;
  },

  signUp: async (name: string, email: string, password: string): Promise<User> => {
    const response = await apiClient.post<SignUpResponse>('/auth/signup', {
      name,
      email,
      password,
    });
    
    apiClient.setAuthToken(response.token);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response.user;
  },

  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      localStorage.removeItem('user');
      return null;
    }
  },

  getMe: async (): Promise<User> => {
    const user = await apiClient.get<{ id: string; name: string; email: string }>('/me');
    
    // Get full user from localStorage or return minimal
    const fullUser = authService.getCurrentUser();
    if (fullUser && fullUser.id === user.id) {
      return { ...fullUser, ...user };
    }
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: 'online',
    } as User;
  },

  signOut: (): void => {
    apiClient.clearAuthToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  },
};
