import { Room, Shape, User } from '@/types';
import { apiClient } from './api';

interface CreateRoomResponse {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  isPublic: boolean;
  createdBy: string;
  isFavorite: boolean;
}

export const roomService = {
  loadRooms: async (): Promise<Room[]> => {
    try {
      const rooms = await apiClient.get<Room[]>('/rooms');
      return rooms;
    } catch (error) {
      console.error('Failed to load rooms:', error);
      return [];
    }
  },

  createRoom: async (
    name: string,
    description: string,
    isPublic: boolean
  ): Promise<Room> => {
    const room = await apiClient.post<CreateRoomResponse>('/rooms', {
      name,
      description,
      isPublic,
    });
    
    return {
      id: room.id,
      name: room.name,
      description: room.description,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      memberCount: room.memberCount,
      isPublic: room.isPublic,
      createdBy: room.createdBy,
      isFavorite: room.isFavorite,
    };
  },

  getRoom: async (roomId: string): Promise<Room> => {
    const room = await apiClient.get<{
      id: string;
      name: string;
      description: string;
      createdAt: string;
      updatedAt: string;
      memberCount: number;
      isPublic: boolean;
      createdBy: string;
    }>(`/rooms/${roomId}`);
    
    return {
      id: room.id,
      name: room.name,
      description: room.description,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      memberCount: room.memberCount,
      isPublic: room.isPublic,
      createdBy: room.createdBy,
      isFavorite: false,
    };
  },

  joinRoom: async (roomId: string): Promise<void> => {
    await apiClient.post(`/rooms/${roomId}/join`);
  },

  getRoomMembers: async (roomId: string): Promise<User[]> => {
    const members = await apiClient.get<Array<{
      id: string;
      email: string;
      name: string;
      avatar: string | null;
      status: 'online' | 'offline' | 'away';
    }>>(`/rooms/${roomId}/members`);
    
    return members.map(m => ({
      id: m.id,
      email: m.email,
      name: m.name,
      avatar: m.avatar || undefined,
      status: m.status,
    }));
  },

  getRoomShapes: async (roomId: string): Promise<Shape[]> => {
    const shapes = await apiClient.get<any[]>(`/rooms/${roomId}/shapes`);
    
    // Convert backend shapes (with createdAt) to frontend shapes (with timestamp)
    return shapes.map(shape => {
      // Ensure points/startPoint/endPoint are parsed if they're strings
      let points = shape.points;
      let startPoint = shape.startPoint;
      let endPoint = shape.endPoint;
      
      // Parse JSON fields if they're strings (Prisma might return as JSON)
      if (typeof points === 'string') {
        try {
          points = JSON.parse(points);
        } catch {
          points = null;
        }
      }
      if (typeof startPoint === 'string') {
        try {
          startPoint = JSON.parse(startPoint);
        } catch {
          startPoint = null;
        }
      }
      if (typeof endPoint === 'string') {
        try {
          endPoint = JSON.parse(endPoint);
        } catch {
          endPoint = null;
        }
      }
      
      return {
        id: shape.id,
        type: shape.type,
        points: points || undefined,
        startPoint: startPoint || undefined,
        endPoint: endPoint || undefined,
        text: shape.text || undefined,
        color: shape.color,
        width: shape.width,
        fill: shape.fill || undefined,
        userId: shape.userId,
        timestamp: new Date(shape.createdAt).getTime(), // Convert ISO string to timestamp
      };
    });
  },

  createShape: async (roomId: string, shape: Omit<Shape, 'id' | 'timestamp'>): Promise<string> => {
    const response = await apiClient.post<{ success: boolean; shapeId: string }>(
      `/rooms/${roomId}/shapes`,
      {
        type: shape.type,
        points: shape.points,
        startPoint: shape.startPoint,
        endPoint: shape.endPoint,
        text: shape.text,
        color: shape.color,
        width: shape.width,
        fill: shape.fill,
      }
    );
    
    return response.shapeId;
  },

  toggleFavorite: (roomId: string, rooms: Room[]): Room[] => {
    // This is frontend-only state since backend doesn't store favorites
    const updatedRooms = rooms.map(r => 
      r.id === roomId ? { ...r, isFavorite: !r.isFavorite } : r
    );
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('favorites', JSON.stringify(
        updatedRooms.filter(r => r.isFavorite).map(r => r.id)
      ));
    }
    
    return updatedRooms;
  },

  loadFavorites: (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      const favoritesStr = localStorage.getItem('favorites');
      return favoritesStr ? JSON.parse(favoritesStr) : [];
    } catch (error) {
      console.error('Failed to parse favorites from localStorage:', error);
      localStorage.removeItem('favorites');
      return [];
    }
  },

  applyFavorites: (rooms: Room[]): Room[] => {
    const favoriteIds = roomService.loadFavorites();
    return rooms.map(room => ({
      ...room,
      isFavorite: favoriteIds.includes(room.id),
    }));
  },
  updateShape: async (
  roomId: string,
  shapeId: string,
  shape: Partial<Omit<Shape, 'id' | 'timestamp'>>
): Promise<Shape> => {
  const updated = await apiClient.put<{
    success: boolean;
    shape: any;
  }>(`/rooms/${roomId}/shapes/${shapeId}`, {
    type: shape.type,
    points: shape.points,
    startPoint: shape.startPoint,
    endPoint: shape.endPoint,
    text: shape.text,
    color: shape.color,
    width: shape.width,
    fill: shape.fill,
  });

  const s = updated.shape;

  return {
    id: s.id,
    type: s.type,
    points: s.points || undefined,
    startPoint: s.startPoint || undefined,
    endPoint: s.endPoint || undefined,
    text: s.text || undefined,
    color: s.color,
    width: s.width,
    fill: s.fill || undefined,
    userId: s.userId,
    timestamp: new Date(s.updatedAt ?? s.createdAt).getTime(),
  };
},

};
