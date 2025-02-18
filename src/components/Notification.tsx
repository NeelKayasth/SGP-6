import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

export const Notification = () => {
  const { notification, clearNotification } = useNotification();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(clearNotification, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

  if (!notification) return null;

  const { type, message } = notification;
  const isSuccess = type === 'success';

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`rounded-lg shadow-lg p-4 ${
        isSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
      } flex items-center space-x-3`}>
        {isSuccess ? (
          <CheckCircle className="h-5 w-5 text-green-400" />
        ) : (
          <XCircle className="h-5 w-5 text-red-400" />
        )}
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={clearNotification}
          className="ml-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};