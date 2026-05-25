import { useCallback, useEffect, useState } from 'react';
import {
  EXPORT_DEFAULTS_UPDATED_EVENT,
  type ExportDefaultsSettings,
  getExportDefaults,
} from '../lib/exportDefaultsSettings';
import { SETTINGS_STORAGE_KEY } from '../lib/profile';

export function useExportDefaults() {
  const [settings, setSettings] = useState<ExportDefaultsSettings>(getExportDefaults);

  const refresh = useCallback(() => {
    setSettings(getExportDefaults());
  }, []);

  useEffect(() => {
    const onUpdated = () => refresh();
    window.addEventListener(EXPORT_DEFAULTS_UPDATED_EVENT, onUpdated);
    const onStorage = (e: StorageEvent) => {
      if (e.key === SETTINGS_STORAGE_KEY) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(EXPORT_DEFAULTS_UPDATED_EVENT, onUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  return settings;
}
