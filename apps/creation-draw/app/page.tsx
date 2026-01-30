'use client';

import React, { useState, useEffect } from 'react';
import { User, Room, Notification } from '@/types';
import { authService } from '@/lib/services/auth';
import { roomService } from '@/lib/services/rooms';
import AuthScreen from '@/components/auth/AuthScreen';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import RoomsView from '@/components/rooms/RoomsView';
import CanvasView from '@/components/canvas/CanvasView';
import SettingsView from '@/components/settings/SettingsView';
import TeamView from '@/components/team/TeamView';
import NotificationToast from '@/components/notifications/NotificationToast';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'rooms' | 'canvas' | 'settings' | 'team'>('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const notificationTimeouts = React.useRef<Map<string, NodeJS.Timeout>>(new Map());

  const loadRooms = async () => {
    try {
      const loadedRooms = await roomService.loadRooms();
      const roomsWithFavorites = roomService.applyFavorites(loadedRooms);
      setRooms(roomsWithFavorites);
    } catch (error) {
      console.error('Failed to load rooms:', error);
      addNotification('error', 'Failed to load rooms');
    }
  };

  const addNotification = (type: Notification['type'], message: string) => {
    const notification: Notification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: Date.now()
    };
    setNotifications(prev => [notification, ...prev].slice(0, 10));
    
    // Clear existing timeout for this notification if it exists
    const existingTimeout = notificationTimeouts.current.get(notification.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    const timeoutId = setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      notificationTimeouts.current.delete(notification.id);
    }, 5000);
    
    notificationTimeouts.current.set(notification.id, timeoutId);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      notificationTimeouts.current.forEach(timeout => clearTimeout(timeout));
      notificationTimeouts.current.clear();
    };
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          // Verify token by getting current user from backend
          const me = await authService.getMe();
          setUser(me);
          setIsAuthenticated(true);
          await loadRooms();
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        authService.signOut();
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const user = await authService.signIn(email, password);
      setUser(user);
      setIsAuthenticated(true);
      await loadRooms();
      addNotification('success', 'Welcome back!');
    } catch (error: any) {
      addNotification('error', error.message || 'Failed to sign in');
    }
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    try {
      const user = await authService.signUp(name, email, password);
      setUser(user);
      setIsAuthenticated(true);
      await loadRooms();
      addNotification('success', 'Account created successfully!');
    } catch (error: any) {
      addNotification('error', error.message || 'Failed to sign up');
    }
  };

  const handleSignOut = () => {
    authService.signOut();
    setUser(null);
    setIsAuthenticated(false);
    setView('rooms');
    setCurrentRoom(null);
    setRooms([]);
    addNotification('info', 'Signed out successfully');
  };

  const handleCreateRoom = async (name: string, description: string, isPublic: boolean) => {
    if (!user) return;
    try {
      const newRoom = await roomService.createRoom(name, description, isPublic);
      const updatedRooms = [...rooms, newRoom];
      setRooms(updatedRooms);
      addNotification('success', `Room "${name}" created successfully!`);
      await handleJoinRoom(newRoom);
    } catch (error: any) {
      addNotification('error', error.message || 'Failed to create room');
    }
  };

  const handleJoinRoom = async (room: Room) => {
    try {
      await roomService.joinRoom(room.id);
      setCurrentRoom(room);
      setView('canvas');
      addNotification('info', `Joined room: ${room.name}`);
    } catch (error: any) {
      addNotification('error', error.message || 'Failed to join room');
    }
  };

  const handleBackToRooms = () => {
    setCurrentRoom(null);
    setView('rooms');
  };

  const toggleFavorite = (roomId: string) => {
    const updatedRooms = roomService.toggleFavorite(roomId, rooms);
    setRooms(updatedRooms);
  };

  const deleteRoom = (roomId: string) => {
    // Note: Backend doesn't have delete endpoint, so this is frontend-only
    const updatedRooms = rooms.filter(r => r.id !== roomId);
    setRooms(updatedRooms);
    addNotification('success', 'Room removed from list');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onSignIn={handleSignIn} onSignUp={handleSignUp} />;
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        user={user}
        rooms={rooms}
        view={view}
        onViewChange={setView}
        onJoinRoom={handleJoinRoom}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          view={view}
          currentRoomName={currentRoom?.name}
          notifications={notifications}
          showNotifications={showNotifications}
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
          onCreateRoom={handleCreateRoom}
          onBackToRooms={handleBackToRooms}
        />

        <NotificationToast notifications={notifications} />

        <div className="flex-1 overflow-auto">
          {view === 'rooms' && (
            <RoomsView 
              rooms={rooms} 
              onJoinRoom={handleJoinRoom}
              onToggleFavorite={toggleFavorite}
              onDeleteRoom={deleteRoom}
            />
          )}
          {view === 'canvas' && currentRoom && (
            <CanvasView 
              room={currentRoom} 
              userId={user.id}
              userName={user.name}
            />
          )}
          {view === 'settings' && (
            <SettingsView 
              user={user} 
              onUserUpdate={setUser}
              onNotification={addNotification}
              onAccountDeleted={handleSignOut}
            />
          )}
          {view === 'team' && <TeamView onNotification={addNotification} />}
        </div>
      </main>
    </div>
  );
}
