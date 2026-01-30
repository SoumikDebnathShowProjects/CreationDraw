'use client';

import { useState } from 'react';
import { Search, Grid, List, Palette, Users, Clock, Eye, EyeOff, Star, Trash2 } from 'lucide-react';
import { Room } from '@/types';

interface RoomsViewProps {
  rooms: Room[];
  onJoinRoom: (room: Room) => void;
  onToggleFavorite: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
}

export default function RoomsView({ rooms, onJoinRoom, onToggleFavorite, onDeleteRoom }: RoomsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private' | 'favorites'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filterType === 'all' ? true :
      filterType === 'public' ? room.isPublic :
      filterType === 'private' ? !room.isPublic :
      filterType === 'favorites' ? room.isFavorite :
      true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6">
      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rooms..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg transition-all ${filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('public')}
            className={`px-4 py-2 rounded-lg transition-all ${filterType === 'public' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
          >
            Public
          </button>
          <button
            onClick={() => setFilterType('private')}
            className={`px-4 py-2 rounded-lg transition-all ${filterType === 'private' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
          >
            Private
          </button>
          <button
            onClick={() => setFilterType('favorites')}
            className={`px-4 py-2 rounded-lg transition-all ${filterType === 'favorites' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
          >
            Favorites
          </button>
        </div>
        
        <div className="flex gap-2 border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Rooms Display */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-20">
          <Palette className="mx-auto mb-4 text-gray-400" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No rooms found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
            >
              <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(room.id); }}
                    className="p-2 bg-white bg-opacity-90 rounded-lg hover:bg-opacity-100 transition-all"
                  >
                    <Star size={16} className={room.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-600'} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); if(confirm('Delete this room?')) onDeleteRoom(room.id); }}
                    className="p-2 bg-white bg-opacity-90 rounded-lg hover:bg-opacity-100 transition-all"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{room.name}</h3>
                  {room.isPublic ? (
                    <Eye size={16} className="text-green-600 flex-shrink-0 ml-2" />
                  ) : (
                    <EyeOff size={16} className="text-gray-400 flex-shrink-0 ml-2" />
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{room.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{room.memberCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{new Date(room.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => onJoinRoom(room)}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
                >
                  Join Room
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex-shrink-0"></div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{room.name}</h3>
                  {room.isPublic ? (
                    <Eye size={14} className="text-green-600 flex-shrink-0" />
                  ) : (
                    <EyeOff size={14} className="text-gray-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">{room.description}</p>
              </div>
              
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users size={14} />
                    <span>{room.memberCount}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => onToggleFavorite(room.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Star size={18} className={room.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'} />
                </button>
                
                <button
                  onClick={() => onJoinRoom(room)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
