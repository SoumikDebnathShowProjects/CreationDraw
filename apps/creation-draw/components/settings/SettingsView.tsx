'use client';

import { useState, useEffect } from 'react';
import { User, Notification } from '@/types';
import { userService, UserPreferences } from '@/lib/services/user';

interface SettingsViewProps {
  user: User;
  onUserUpdate?: (user: User) => void;
  onNotification?: (type: Notification['type'], message: string) => void;
  onAccountDeleted?: () => void;
}

export default function SettingsView({ 
  user, 
  onUserUpdate, 
  onNotification,
  onAccountDeleted 
}: SettingsViewProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Load preferences
    const prefs = userService.getPreferences();
    setNotifications(prefs.emailNotifications);
    setAutoSave(prefs.autoSave);
    setTheme(prefs.theme);
  }, []);

  const handleSaveProfile = async () => {
    if (name === user.name && email === user.email) {
      onNotification?.('info', 'No changes to save');
      return;
    }

    try {
      setSaving(true);
      const updatedUser = await userService.updateProfile({ name, email });
      onUserUpdate?.(updatedUser);
      onNotification?.('success', 'Profile updated successfully');
    } catch (error: any) {
      onNotification?.('error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeAvatar = async () => {
    // For now, just show a message. In production, you'd upload an image
    onNotification?.('info', 'Avatar upload feature coming soon');
  };

  const handleSavePreferences = () => {
    const prefs: UserPreferences = {
      emailNotifications: notifications,
      autoSave,
      theme,
    };
    userService.savePreferences(prefs);
    onNotification?.('success', 'Preferences saved');
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      await userService.deleteAccount();
      onNotification?.('info', 'Account deleted successfully');
      onAccountDeleted?.();
    } catch (error: any) {
      onNotification?.('error', error.message || 'Failed to delete account');
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-xl font-bold mb-6">Profile Settings</h3>
        
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <img src={user.avatar} alt="Avatar" className="w-20 h-20 rounded-full" />
            <button 
              onClick={handleChangeAvatar}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Change Avatar
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving || (name === user.name && email === user.email)}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-xl font-bold mb-6">Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive updates about your rooms</p>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => {
                setNotifications(e.target.checked);
                handleSavePreferences();
              }}
              className="w-12 h-6 rounded-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto Save</p>
              <p className="text-sm text-gray-500">Automatically save your drawings</p>
            </div>
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => {
                setAutoSave(e.target.checked);
                handleSavePreferences();
              }}
              className="w-12 h-6 rounded-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-gray-500">Choose your interface theme</p>
            </div>
            <select
              value={theme}
              onChange={(e) => {
                setTheme(e.target.value as 'light' | 'dark');
                handleSavePreferences();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold mb-6 text-red-600">Danger Zone</h3>
        
        {!showDeleteConfirm ? (
          <button 
            onClick={handleDeleteAccount}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Account
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
