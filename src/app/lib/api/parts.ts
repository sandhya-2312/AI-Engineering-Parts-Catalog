import { catalogApi } from './catalog';
import type { ApiPart, PaginatedParts } from './types';

export interface PartsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  materialId?: string;
  manufacturerId?: string;
  partType?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/** Catalog parts client — edit/delete use part number; files/downloads use internal id (UUID) */
export const partsApi = {
  list: (params: PartsQueryParams = {}) => catalogApi.listParts(params),
  get: (id: string) => catalogApi.getPart(id),
  create: (body: Record<string, unknown>) => catalogApi.addPart(body),
  update: (partNumber: string, body: Record<string, unknown>) =>
    catalogApi.updatePartByPartNumber(partNumber, body),
  remove: (partNumber: string) => catalogApi.deletePartByPartNumber(partNumber),
  trackDownload: (id: string) => catalogApi.trackDownload(id),
  listFiles: (partId: string) => catalogApi.listFiles(partId),
  uploadFile: (partId: string, file: File) => catalogApi.uploadFile(partId, file),
  downloadFile: (fileId: string, filename: string) => catalogApi.downloadFile(fileId, filename),
};

export type { ApiPart, PaginatedParts };
