'use client';

import { Home, Users, Settings, LogOut, Palette, Star } from 'lucide-react';
import { User, Room } from '@/types';

interface SidebarProps {
  sidebarOpen: boolean;
  user: User;
  rooms: Room[];
  view: 'rooms' | 'canvas' | 'settings' | 'team';
  onViewChange: (view: 'rooms' | 'canvas' | 'settings' | 'team') => void;
  onJoinRoom: (room: Room) => void;
  onSignOut: () => void;
}

export default function Sidebar({
  sidebarOpen,
  user,
  rooms,
  view,
  onViewChange,
  onJoinRoom,
  onSignOut,
}: SidebarProps) {
  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col shadow-2xl`}>
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Palette className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">DrawBoard</h1>
            <p className="text-xs text-gray-400">Pro</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
          <img src={user?.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <button
          onClick={() => onViewChange('rooms')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
            view === 'rooms' ? 'bg-blue-600 shadow-lg' : 'hover:bg-gray-800'
          }`}
        >
          <Home size={20} />
          <span>Rooms</span>
        </button>
        <button
          onClick={() => onViewChange('team')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
            view === 'team' ? 'bg-blue-600 shadow-lg' : 'hover:bg-gray-800'
          }`}
        >
          <Users size={20} />
          <span>Team</span>
        </button>
        <button
          onClick={() => onViewChange('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
            view === 'settings' ? 'bg-blue-600 shadow-lg' : 'hover:bg-gray-800'
          }`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>

        <div className="my-4 border-t border-gray-800"></div>

        <div className="px-4 mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Favorites</p>
        </div>
        {rooms.filter(r => r.isFavorite).map(room => (
          <button
            key={room.id}
            onClick={() => onJoinRoom(room)}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg mb-1 hover:bg-gray-800 transition-colors text-left"
          >
            <Star size={16} className="text-yellow-500" fill="currentColor" />
            <span className="text-sm truncate">{room.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-red-400"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
