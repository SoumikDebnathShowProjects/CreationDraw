'use client';

import { Notification } from '@/types';

interface NotificationToastProps {
  notifications: Notification[];
}

export default function NotificationToast({ notifications }: NotificationToastProps) {
  return (
    <div className="fixed top-20 right-6 z-50 space-y-2">
      {notifications.slice(0, 3).map(notif => (
        <div
          key={notif.id}
          className={`p-4 rounded-lg shadow-lg max-w-sm animate-slide-in ${
            notif.type === 'success' ? 'bg-green-500' :
            notif.type === 'error' ? 'bg-red-500' :
            notif.type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
          } text-white`}
        >
          <p className="text-sm font-medium">{notif.message}</p>
        </div>
      ))}
    </div>
  );
}
