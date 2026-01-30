'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Settings, X, Clock, Users, Palette, AlertCircle } from 'lucide-react';
import { teamService, TeamMember, InviteMemberRequest } from '@/lib/services/team';
import { Notification } from '@/types';

interface TeamViewProps {
  onNotification?: (type: Notification['type'], message: string) => void;
}

export default function TeamView({ onNotification }: TeamViewProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityData, setActivityData] = useState<any>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member' | 'viewer'>('member');

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const members = await teamService.getTeamMembers();
      setTeamMembers(members);
    } catch (error: any) {
      console.error('Failed to load team members:', error);
      onNotification?.('error', error.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsClick = (member: TeamMember) => {
    setSelectedMember(member);
  };

  const handleInviteMember = () => {
    setShowInviteModal(true);
    setInviteEmail('');
    setInviteRole('member');
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      onNotification?.('error', 'Please enter an email address');
      return;
    }

    try {
      await teamService.inviteMember({ email: inviteEmail, role: inviteRole });
      onNotification?.('success', `Invitation sent to ${inviteEmail}`);
      setShowInviteModal(false);
      setInviteEmail('');
      // Reload team members to show new invite
      await loadTeamMembers();
    } catch (error: any) {
      onNotification?.('error', error.message || 'Failed to send invitation');
    }
  };

  const handleChangeRole = (member: TeamMember) => {
    setSelectedMember(member);
    setSelectedRole(member.role || 'member');
    setShowRoleModal(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedMember) return;

    try {
      await teamService.updateMemberRole({
        userId: selectedMember.id,
        role: selectedRole,
      });
      onNotification?.('success', `Role updated for ${selectedMember.name}`);
      setShowRoleModal(false);
      setSelectedMember(null);
      await loadTeamMembers();
    } catch (error: any) {
      onNotification?.('error', error.message || 'Failed to update role');
    }
  };

  const handleViewActivity = async (member: TeamMember) => {
    try {
      const activity = await teamService.getMemberActivity(member.id);
      setActivityData(activity);
      setSelectedMember(member);
      setShowActivityModal(true);
    } catch (error: any) {
      onNotification?.('error', error.message || 'Failed to load activity');
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    if (!confirm(`Are you sure you want to remove ${selectedMember.name} from the team?`)) {
      return;
    }

    try {
      await teamService.removeMember(selectedMember.id);
      onNotification?.('success', `${selectedMember.name} removed from team`);
      setSelectedMember(null);
      await loadTeamMembers();
    } catch (error: any) {
      onNotification?.('error', error.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <div className="text-gray-500">Loading team members...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Team Members</h3>
          <button 
            onClick={handleInviteMember}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Invite Member</span>
          </button>
        </div>

        {teamMembers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500">No team members found</p>
            <button
              onClick={handleInviteMember}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Invite Your First Member
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full" />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    member.status === 'online' ? 'bg-green-500' :
                    member.status === 'away' ? 'bg-yellow-500' :
                    'bg-gray-400'
                  }`}></div>
                </div>
                <div>
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {member.role && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    member.role === 'viewer' ? 'bg-gray-100 text-gray-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {member.role}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  member.status === 'online' ? 'bg-green-100 text-green-700' :
                  member.status === 'away' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {member.status}
                </span>
                <button 
                  onClick={() => handleSettingsClick(member)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Member settings"
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* Member Settings Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Member Settings</h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img 
                  src={selectedMember.avatar} 
                  alt={selectedMember.name} 
                  className="w-16 h-16 rounded-full" 
                />
                <div>
                  <p className="font-semibold text-lg">{selectedMember.name}</p>
                  <p className="text-sm text-gray-500">{selectedMember.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setShowRoleModal(true);
                    setSelectedRole(selectedMember.role || 'member');
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Change Role
                </button>
                <button 
                  onClick={() => handleViewActivity(selectedMember)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  View Activity
                </button>
                <button 
                  onClick={handleRemoveMember}
                  className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Remove from Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendInvite()}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member' | 'viewer')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {showRoleModal && selectedMember && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Change Role</h3>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedMember(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Change role for <span className="font-semibold">{selectedMember.name}</span>
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Role
                </label>
                <select 
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'member' | 'viewer')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedMember(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && selectedMember && activityData && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Member Activity</h3>
              <button
                onClick={() => {
                  setShowActivityModal(false);
                  setSelectedMember(null);
                  setActivityData(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img 
                  src={selectedMember.avatar} 
                  alt={selectedMember.name} 
                  className="w-16 h-16 rounded-full" 
                />
                <div>
                  <p className="font-semibold text-lg">{selectedMember.name}</p>
                  <p className="text-sm text-gray-500">{selectedMember.email}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Clock className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm font-medium">Last Active</p>
                    <p className="text-sm text-gray-500">
                      {new Date(activityData.lastActive).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm font-medium">Rooms Joined</p>
                    <p className="text-sm text-gray-500">{activityData.roomsJoined}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Palette className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm font-medium">Shapes Created</p>
                    <p className="text-sm text-gray-500">{activityData.shapesCreated}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={() => {
                  setShowActivityModal(false);
                  setSelectedMember(null);
                  setActivityData(null);
                }}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
