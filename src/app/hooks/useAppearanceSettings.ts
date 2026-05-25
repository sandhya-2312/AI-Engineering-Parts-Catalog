import { useCallback, useEffect, useState } from 'react';
import {
  APPEARANCE_SETTINGS_UPDATED_EVENT,
  applyAppearance,
  type AppearanceSettings,
  getAppearanceSettings,
} from '../lib/appearanceSettings';
import { SETTINGS_STORAGE_KEY } from '../lib/profile';

export function useAppearanceSettings() {
  const [settings, setSettings] = useState<AppearanceSettings>(getAppearanceSettings);

  const refresh = useCallback(() => {
    const next = getAppearanceSettings();
    setSettings(next);
    applyAppearance(next);
  }, []);

  useEffect(() => {
    applyAppearance(settings);
  }, [settings]);

  useEffect(() => {
    const onUpdated = () => refresh();
    window.addEventListener(APPEARANCE_SETTINGS_UPDATED_EVENT, onUpdated);
    const onStorage = (e: StorageEvent) => {
      if (e.key === SETTINGS_STORAGE_KEY) refresh();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(APPEARANCE_SETTINGS_UPDATED_EVENT, onUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  return settings;
}
