import { apiFetch, apiUpload, downloadAuthenticatedFile } from './client';
import type { ApiPart, ApiPartFile, LookupEntity, PaginatedParts } from './types';
import type { PartsQueryParams } from './parts';

export interface CatalogFilters {
  categories: LookupEntity[];
  materials: LookupEntity[];
  manufacturers: LookupEntity[];
  partTypes: string[];
}

export interface CatalogPageResponse extends PaginatedParts {
  filters: CatalogFilters;
}

function buildQuery(params: PartsQueryParams = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

/** Catalog page API — base path /api/catalog */
export const catalogApi = {
  /** GET /catalog — filters + parts (single bootstrap request) */
  page(params: PartsQueryParams = {}) {
    return apiFetch<CatalogPageResponse>(`/catalog${buildQuery(params)}`);
  },

  /** GET /catalog/filters — dropdown options */
  filters() {
    return apiFetch<CatalogFilters>('/catalog/filters');
  },

  /** GET /catalog/part-types */
  partTypes() {
    return apiFetch<string[]>('/catalog/part-types');
  },

  /** GET /catalog/parts — paginated list with search & filters */
  listParts(params: PartsQueryParams = {}) {
    return apiFetch<PaginatedParts>(`/catalog/parts${buildQuery(params)}`);
  },

  getPart(id: string) {
    return apiFetch<ApiPart>(`/catalog/parts/${id}`);
  },

  createPart(body: Record<string, unknown>) {
    return apiFetch<ApiPart>('/catalog/parts', { method: 'POST', json: body });
  },

  /** POST /catalog/parts/add — Add Part button */
  addPart(body: Record<string, unknown>) {
    return apiFetch<ApiPart>('/catalog/parts/add', { method: 'POST', json: body });
  },

  /** POST /catalog/parts/add-with-files — Add Part + image/CAD files */
  addPartWithFiles(
    body: Record<string, string | undefined>,
    files: {
      partImage?: File | null;
      glbFile?: File | null;
      stlFile?: File | null;
      stepFile?: File | null;
    },
  ) {
    const form = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && value !== '') form.append(key, value);
    });
    if (files.partImage) form.append('partImage', files.partImage);
    if (files.glbFile) form.append('glbFile', files.glbFile);
    if (files.stlFile) form.append('stlFile', files.stlFile);
    if (files.stepFile) form.append('stepFile', files.stepFile);
    return apiUpload<ApiPart>('/catalog/parts/add-with-files', form);
  },

  updatePart(id: string, body: Record<string, unknown>) {
    return apiFetch<ApiPart>(`/catalog/parts/${id}`, { method: 'PATCH', json: body });
  },

  /** Edit row by visible part number (catalog table) */
  updatePartByPartNumber(partNumber: string, body: Record<string, unknown>) {
    const encoded = encodeURIComponent(partNumber);
    return apiFetch<ApiPart>(`/catalog/parts/by-part-number/${encoded}`, {
      method: 'PATCH',
      json: body,
    });
  },

  deletePart(id: string) {
    return apiFetch<{ message: string }>(`/catalog/parts/${id}`, { method: 'DELETE' });
  },

  /** Delete row by visible part number (catalog table) */
  deletePartByPartNumber(partNumber: string) {
    const encoded = encodeURIComponent(partNumber);
    return apiFetch<{ message: string }>(`/catalog/parts/by-part-number/${encoded}`, {
      method: 'DELETE',
    });
  },

  listFiles(partId: string) {
    return apiFetch<ApiPartFile[]>(`/catalog/parts/${partId}/files`);
  },

  uploadFile(partId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    return apiUpload<ApiPartFile>(`/catalog/parts/${partId}/files`, form);
  },

  trackDownload(partId: string) {
    return apiFetch<{ downloads: number }>(`/catalog/parts/${partId}/download`, {
      method: 'POST',
    });
  },

  downloadFile(fileId: string, filename: string) {
    return downloadAuthenticatedFile(`/files/${fileId}/download`, filename);
  },

  // Legacy lookup endpoints (still available)
  categories: () => apiFetch<LookupEntity[]>('/categories'),
  materials: () => apiFetch<LookupEntity[]>('/materials'),
  manufacturers: () => apiFetch<LookupEntity[]>('/manufacturers'),
  createCategory: (body: { name: string; description?: string }) =>
    apiFetch<LookupEntity>('/categories', { method: 'POST', json: body }),
  createMaterial: (body: { name: string; description?: string }) =>
    apiFetch<LookupEntity>('/materials', { method: 'POST', json: body }),
  createManufacturer: (body: { name: string; website?: string; country?: string }) =>
    apiFetch<LookupEntity>('/manufacturers', { method: 'POST', json: body }),
};
