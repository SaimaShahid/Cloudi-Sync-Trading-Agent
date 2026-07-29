import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { fetchNotifications, fetchUnreadCount, markAllNotificationsRead, markNotificationRead } from '@/api/notifications';
import { useSocket } from '@/context/SocketContext';
import { SOCKET_CLIENT_EVENTS, SOCKET_SERVER_EVENTS } from '@/lib/socket';
import type { NotificationItem } from '@/types';

export const NotificationBell: React.FC = () => {
  const socket = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUnreadCount()
      .then(({ unreadCount: count }) => setUnreadCount(count))
      .catch(() => setUnreadCount(0));
  }, []);

  useEffect(() => {
    if (!socket) return undefined;

    socket.emit(SOCKET_CLIENT_EVENTS.NOTIFICATION_SUBSCRIBE);

    const handleUpdate = () => {
      fetchUnreadCount()
        .then(({ unreadCount: count }) => setUnreadCount(count))
        .catch(() => undefined);
    };

    socket.on(SOCKET_SERVER_EVENTS.NOTIFICATION_UPDATE, handleUpdate);

    return () => {
      socket.emit(SOCKET_CLIENT_EVENTS.NOTIFICATION_UNSUBSCRIBE);
      socket.off(SOCKET_SERVER_EVENTS.NOTIFICATION_UPDATE, handleUpdate);
    };
  }, [socket]);

  const openPanel = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setIsLoading(true);
      fetchNotifications({ limit: 10 })
        .then(({ items: list }) => setItems(list))
        .catch(() => setItems([]))
        .finally(() => setIsLoading(false));
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, readAt: new Date().toISOString() } : item)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // no-op — non-critical UI action
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const result = await markAllNotificationsRead();
      setItems((prev) => prev.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
      setUnreadCount(result.unreadCount);
    } catch {
      // no-op — non-critical UI action
    }
  };

  return (
    <div className="relative">
      <button
        onClick={openPanel}
        className="relative p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-danger text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-surface-container-low border border-outline-variant/20 rounded-xl shadow-2xl z-50">
          <div className="flex items-center justify-between p-3 border-b border-outline-variant/10">
            <span className="text-sm font-bold text-on-surface">Notifications</span>
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-xs text-on-surface-variant">Loading…</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-xs text-on-surface-variant">No notifications yet.</div>
          ) : (
            <div className="divide-y divide-outline-variant/10">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMarkRead(item.id)}
                  className={`w-full text-left p-3 hover:bg-surface-container-high transition-colors ${
                    item.readAt ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-on-surface">{item.title}</span>
                    {!item.readAt && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">{item.message}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
