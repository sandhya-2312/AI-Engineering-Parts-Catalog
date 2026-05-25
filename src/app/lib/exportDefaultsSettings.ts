import { SETTINGS_STORAGE_KEY } from './profile';

export type PaperSize = 'a4' | 'letter' | 'a3';
export type PageOrientation = 'portrait' | 'landscape';

export type ExportDefaultsSettings = {
  includeImages: boolean;
  includeSpecs: boolean;
  includeDrawings: boolean;
  includePricing: boolean;
  paperSize: PaperSize;
  orientation: PageOrientation;
};

export const DEFAULT_EXPORT_DEFAULTS: ExportDefaultsSettings = {
  includeImages: true,
  includeSpecs: true,
  includeDrawings: false,
  includePricing: false,
  paperSize: 'a4',
  orientation: 'portrait',
};

export const EXPORT_DEFAULTS_UPDATED_EVENT = 'engineerx.export-defaults-updated';

export function notifyExportDefaultsUpdated() {
  window.dispatchEvent(new CustomEvent(EXPORT_DEFAULTS_UPDATED_EVENT));
}

export function readStoredExportDefaults(): Partial<ExportDefaultsSettings> | null {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { exportDefaults?: Partial<ExportDefaultsSettings> };
    return parsed.exportDefaults ?? null;
  } catch {
    return null;
  }
}

export function mergeExportDefaults(
  stored: Partial<ExportDefaultsSettings> | null | undefined,
): ExportDefaultsSettings {
  return { ...DEFAULT_EXPORT_DEFAULTS, ...(stored ?? {}) };
}

export function getExportDefaults(): ExportDefaultsSettings {
  return mergeExportDefaults(readStoredExportDefaults());
}
