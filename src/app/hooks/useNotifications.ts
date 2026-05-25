import { useCallback, useEffect, useMemo, useState } from 'react';
import { dashboardApi } from '../lib/api/dashboard';
import {
  filterNotificationsBySettings,
  getReadNotificationIds,
  mapActivityToNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS_UPDATED_EVENT,
  notifyNotificationsUpdated,
  type AppNotification,
} from '../lib/notifications';
import { NOTIFICATION_SETTINGS_UPDATED_EVENT } from '../lib/notificationSettings';
import { useNotificationSettings } from './useNotificationSettings';

export function useNotifications() {
  const prefs = useNotificationSettings();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(() => getReadNotificationIds());

  const refreshReadIds = useCallback(() => {
    setReadIds(getReadNotificationIds());
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dashboardApi.summary();
      const mapped = mapActivityToNotifications(data.recentActivity);
      setItems(filterNotificationsBySettings(mapped, prefs));
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [prefs]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onPrefsUpdated = () => {
      refreshReadIds();
      load();
    };
    const onNotificationsUpdated = () => refreshReadIds();
    window.addEventListener(NOTIFICATION_SETTINGS_UPDATED_EVENT, onPrefsUpdated);
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, onNotificationsUpdated);
    return () => {
      window.removeEventListener(NOTIFICATION_SETTINGS_UPDATED_EVENT, onPrefsUpdated);
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, onNotificationsUpdated);
    };
  }, [load, refreshReadIds]);

  const unreadCount = useMemo(
    () => items.filter((item) => !readIds.has(item.id)).length,
    [items, readIds],
  );

  const markRead = useCallback((id: string) => {
    markNotificationRead(id);
    refreshReadIds();
    notifyNotificationsUpdated();
  }, [refreshReadIds]);

  const markAllRead = useCallback(() => {
    markAllNotificationsRead(items.map((item) => item.id));
    refreshReadIds();
    notifyNotificationsUpdated();
  }, [items, refreshReadIds]);

  const isRead = useCallback((id: string) => readIds.has(id), [readIds]);

  return {
    items,
    unreadCount,
    isLoading,
    isRead,
    markRead,
    markAllRead,
    reload: load,
  };
}
