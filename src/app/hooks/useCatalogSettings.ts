import { useCallback, useEffect, useState } from 'react';
import {
  CATALOG_SETTINGS_UPDATED_EVENT,
  type CatalogSettings,
  getCatalogSettings,
} from '../lib/catalogSettings';
import { SETTINGS_STORAGE_KEY } from '../lib/profile';

export function useCatalogSettings() {
  const [settings, setSettings] = useState<CatalogSettings>(getCatalogSettings);

  const refresh = useCallback(() => {
    setSettings(getCatalogSettings());
  }, []);

  useEffect(() => {
    const onUpdated = () => refresh();
    window.addEventListener(CATALOG_SETTINGS_UPDATED_EVENT, onUpdated);
    const onStorage = (e: StorageEvent) => {
      if (e.key === SETTINGS_STORAGE_KEY) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CATALOG_SETTINGS_UPDATED_EVENT, onUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  return settings;
}
