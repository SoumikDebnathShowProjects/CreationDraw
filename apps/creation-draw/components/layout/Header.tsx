'use client';

import { Menu, X, Bell } from 'lucide-react';
import { Notification } from '@/types';
import CreateRoomModal from '@/components/rooms/CreateRoomModal';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  view: 'rooms' | 'canvas' | 'settings' | 'team';
  currentRoomName?: string | null;
  notifications: Notification[];
  showNotifications: boolean;
  onToggleNotifications: () => void;
  onCreateRoom?: (name: string, description: string, isPublic: boolean) => void;
  onBackToRooms?: () => void;
}

export default function Header({
  sidebarOpen,
  onToggleSidebar,
  view,
  currentRoomName,
  notifications,
  showNotifications,
  onToggleNotifications,
  onCreateRoom,
  onBackToRooms,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {view === 'rooms' && 'Rooms'}
          {view === 'canvas' && currentRoomName}
          {view === 'settings' && 'Settings'}
          {view === 'team' && 'Team'}
        </h2>
      </div>
      
      <div className="flex items-center gap-3">
        {view === 'rooms' && onCreateRoom && (
          <CreateRoomModal onCreateRoom={onCreateRoom} />
        )}
        
        <div className="relative">
          <button
            onClick={onToggleNotifications}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                      <p className="text-sm">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {view === 'canvas' && onBackToRooms && (
          <button
            onClick={onBackToRooms}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Rooms
          </button>
        )}
      </div>
    </header>
  );
}
