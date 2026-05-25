import { useCallback, useEffect, useState } from 'react';
import {
  NOTIFICATION_SETTINGS_UPDATED_EVENT,
  type NotificationSettings,
  getNotificationSettings,
} from '../lib/notificationSettings';
import { SETTINGS_STORAGE_KEY } from '../lib/profile';

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings);

  const refresh = useCallback(() => {
    setSettings(getNotificationSettings());
  }, []);

  useEffect(() => {
    const onUpdated = () => refresh();
    window.addEventListener(NOTIFICATION_SETTINGS_UPDATED_EVENT, onUpdated);
    const onStorage = (e: StorageEvent) => {
      if (e.key === SETTINGS_STORAGE_KEY) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(NOTIFICATION_SETTINGS_UPDATED_EVENT, onUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  return settings;
}
