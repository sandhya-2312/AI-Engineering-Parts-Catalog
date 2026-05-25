import { SETTINGS_STORAGE_KEY } from './profile';

export type CatalogViewMode = 'grid' | 'list' | 'table';
export type UnitSystem = 'metric' | 'imperial';

export type CatalogSettings = {
  itemsPerPage: string;
  unitSystem: UnitSystem;
  defaultView: CatalogViewMode;
  showThumbnails: boolean;
  showPartNumbers: boolean;
  enableARPreview: boolean;
};

export const DEFAULT_CATALOG_SETTINGS: CatalogSettings = {
  itemsPerPage: '10',
  unitSystem: 'metric',
  defaultView: 'grid',
  showThumbnails: true,
  showPartNumbers: true,
  enableARPreview: true,
};

export const CATALOG_SETTINGS_UPDATED_EVENT = 'engineerx.catalog-settings-updated';

export function notifyCatalogSettingsUpdated() {
  window.dispatchEvent(new CustomEvent(CATALOG_SETTINGS_UPDATED_EVENT));
}

export function readStoredCatalogSettings(): Partial<CatalogSettings> | null {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { catalog?: Partial<CatalogSettings> };
    return parsed.catalog ?? null;
  } catch {
    return null;
  }
}

export function mergeCatalogSettings(
  stored: Partial<CatalogSettings> | null | undefined,
): CatalogSettings {
  return { ...DEFAULT_CATALOG_SETTINGS, ...(stored ?? {}) };
}

export function getCatalogSettings(): CatalogSettings {
  return mergeCatalogSettings(readStoredCatalogSettings());
}

export function parseItemsPerPage(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
}
