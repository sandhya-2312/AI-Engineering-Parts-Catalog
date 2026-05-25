import { SETTINGS_STORAGE_KEY } from './profile';

export type ThemeMode = 'light';
export type AccentColor = 'cyan' | 'blue' | 'green' | 'purple';

export type AppearanceSettings = {
  theme: ThemeMode;
  compactMode: boolean;
  showAnimations: boolean;
  accentColor: AccentColor;
};

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  theme: 'light',
  compactMode: false,
  showAnimations: true,
  accentColor: 'blue',
};

const ACCENT_PRIMARY: Record<AccentColor, string> = {
  cyan: '#06b6d4',
  blue: '#2178b8',
  green: '#16a34a',
  purple: '#7c3aed',
};

export const APPEARANCE_SETTINGS_UPDATED_EVENT = 'engineerx.appearance-settings-updated';

export function notifyAppearanceSettingsUpdated() {
  window.dispatchEvent(new CustomEvent(APPEARANCE_SETTINGS_UPDATED_EVENT));
}

export function readStoredAppearanceSettings(): Partial<AppearanceSettings> | null {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { appearance?: Partial<AppearanceSettings> };
    return parsed.appearance ?? null;
  } catch {
    return null;
  }
}

export function mergeAppearanceSettings(
  stored: Partial<AppearanceSettings> | null | undefined,
): AppearanceSettings {
  return {
    ...DEFAULT_APPEARANCE_SETTINGS,
    ...(stored ?? {}),
    theme: 'light',
  };
}

export function getAppearanceSettings(): AppearanceSettings {
  return mergeAppearanceSettings(readStoredAppearanceSettings());
}

export function applyAppearance(settings: AppearanceSettings) {
  const root = document.documentElement;
  const primary = ACCENT_PRIMARY[settings.accentColor] ?? ACCENT_PRIMARY.blue;

  root.classList.remove('dark');
  root.dataset.theme = 'light';
  root.dataset.accent = settings.accentColor;
  root.style.setProperty('--primary', primary);
  root.style.setProperty('--ring', primary);
  root.style.setProperty('--sidebar-primary', primary);
  root.style.setProperty('--sidebar-ring', primary);
  root.style.setProperty('--sidebar-item-active', primary);

  root.classList.toggle('compact-mode', settings.compactMode);
  root.classList.toggle('reduce-motion', !settings.showAnimations);
}
