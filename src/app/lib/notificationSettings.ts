import { SETTINGS_STORAGE_KEY } from './profile';

export type NotificationSettings = {
  newParts: boolean;
  exportComplete: boolean;
  catalogUpdates: boolean;
  weeklyDigest: boolean;
  teamActivity: boolean;
  emailAlerts: boolean;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  newParts: true,
  exportComplete: true,
  catalogUpdates: false,
  weeklyDigest: true,
  teamActivity: false,
  emailAlerts: true,
};

export const NOTIFICATION_SETTINGS_UPDATED_EVENT = 'engineerx.notification-settings-updated';

export function notifyNotificationSettingsUpdated() {
  window.dispatchEvent(new CustomEvent(NOTIFICATION_SETTINGS_UPDATED_EVENT));
}

export function readStoredNotificationSettings(): Partial<NotificationSettings> | null {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { notifications?: Partial<NotificationSettings> };
    return parsed.notifications ?? null;
  } catch {
    return null;
  }
}

export function mergeNotificationSettings(
  stored: Partial<NotificationSettings> | null | undefined,
): NotificationSettings {
  return { ...DEFAULT_NOTIFICATION_SETTINGS, ...(stored ?? {}) };
}

export function getNotificationSettings(): NotificationSettings {
  return mergeNotificationSettings(readStoredNotificationSettings());
}
