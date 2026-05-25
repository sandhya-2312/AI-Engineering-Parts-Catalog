import type { DashboardActivityItem } from './api/dashboard';
import type { NotificationSettings } from './notificationSettings';

export type NotificationCategory = keyof NotificationSettings;

export type AppNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  time: string;
};

const READ_STORAGE_KEY = 'engineerx.notifications.read.v1';

export function categorizeActivity(action: string): NotificationCategory {
  const normalized = action.toLowerCase();
  if (normalized.includes('add') || normalized.includes('upload') || normalized.includes('new')) {
    return 'newParts';
  }
  if (normalized.includes('export') || normalized.includes('pdf')) {
    return 'exportComplete';
  }
  if (
    normalized.includes('update') ||
    normalized.includes('change') ||
    normalized.includes('edit') ||
    normalized.includes('modif')
  ) {
    return 'catalogUpdates';
  }
  if (normalized.includes('download') || normalized.includes('favor')) {
    return 'teamActivity';
  }
  return 'teamActivity';
}

export function activityToNotification(item: DashboardActivityItem): AppNotification {
  const category = categorizeActivity(item.action);
  return {
    id: [item.part, item.action, item.time, item.user].join('|'),
    category,
    title: item.part,
    message: `${item.action} by ${item.user}`,
    time: item.time,
  };
}

export function mapActivityToNotifications(items: DashboardActivityItem[]): AppNotification[] {
  return items.map(activityToNotification);
}

export function filterNotificationsBySettings(
  items: AppNotification[],
  settings: NotificationSettings,
): AppNotification[] {
  return items.filter((item) => settings[item.category]);
}

function readReadIds(): string[] {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { readIds?: string[] };
    return Array.isArray(parsed.readIds) ? parsed.readIds : [];
  } catch {
    return [];
  }
}

function writeReadIds(readIds: string[]) {
  localStorage.setItem(READ_STORAGE_KEY, JSON.stringify({ readIds }));
}

export function getReadNotificationIds(): Set<string> {
  return new Set(readReadIds());
}

export function markNotificationRead(id: string) {
  const ids = readReadIds();
  if (!ids.includes(id)) {
    writeReadIds([...ids, id]);
  }
}

export function markAllNotificationsRead(ids: string[]) {
  const existing = new Set(readReadIds());
  for (const id of ids) existing.add(id);
  writeReadIds([...existing]);
}

export const NOTIFICATIONS_UPDATED_EVENT = 'engineerx.notifications-updated';

export function notifyNotificationsUpdated() {
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT));
}
