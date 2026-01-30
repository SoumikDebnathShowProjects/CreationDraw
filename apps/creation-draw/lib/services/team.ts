import { User } from '@/types';
import { apiClient } from './api';

export interface TeamMember extends User {
  role?: 'admin' | 'member' | 'viewer';
  joinedAt?: string;
}

export interface InviteMemberRequest {
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

export interface UpdateMemberRoleRequest {
  userId: string;
  role: 'admin' | 'member' | 'viewer';
}

export const teamService = {
  // Get all team members (users in the system or organization)
  // Note: If /team/members doesn't exist, this will aggregate from all rooms
  getTeamMembers: async (): Promise<TeamMember[]> => {
    try {
      // Try the team members endpoint first
      const members = await apiClient.get<Array<{
        id: string;
        name: string;
        email: string;
        status: 'online' | 'offline' | 'away';
        avatar?: string;
        role?: string;
        joinedAt?: string;
      }>>('/team/members');
      
      return members.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        status: m.status,
        avatar: m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random`,
        role: m.role as 'admin' | 'member' | 'viewer' | undefined,
        joinedAt: m.joinedAt,
      }));
    } catch (error) {
      console.warn('Team members endpoint not available, trying to aggregate from rooms');
      // Fallback: Get all unique users from all rooms
      try {
        const { roomService } = await import('./rooms');
        const rooms = await roomService.loadRooms();
        const memberMap = new Map<string, TeamMember>();
        
        // Get members from all rooms
        for (const room of rooms) {
          try {
            const members = await roomService.getRoomMembers(room.id);
            members.forEach(member => {
              if (!memberMap.has(member.id)) {
                memberMap.set(member.id, {
                  ...member,
                  role: 'member' as const,
                });
              }
            });
          } catch (err) {
            // Skip rooms that fail
            continue;
          }
        }
        
        return Array.from(memberMap.values());
      } catch (fallbackError) {
        console.error('Failed to load team members:', fallbackError);
        return [];
      }
    }
  },

  // Invite a new team member
  inviteMember: async (data: InviteMemberRequest): Promise<void> => {
    await apiClient.post('/team/invite', data);
  },

  // Update member role
  updateMemberRole: async (data: UpdateMemberRoleRequest): Promise<void> => {
    await apiClient.put(`/team/members/${data.userId}/role`, { role: data.role });
  },

  // Remove member from team
  removeMember: async (userId: string): Promise<void> => {
    await apiClient.delete(`/team/members/${userId}`);
  },

  // Get member activity (if you have this endpoint)
  getMemberActivity: async (userId: string): Promise<{
    lastActive: string;
    roomsJoined: number;
    shapesCreated: number;
  }> => {
    try {
      return await apiClient.get(`/team/members/${userId}/activity`);
    } catch (error) {
      console.error('Failed to get member activity:', error);
      return {
        lastActive: new Date().toISOString(),
        roomsJoined: 0,
        shapesCreated: 0,
      };
    }
  },
};
