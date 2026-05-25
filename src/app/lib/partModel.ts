import { getStoredToken } from './api/client';
import { partsApi } from './api/parts';
import type { ApiPartFile } from './api/types';
import type { PartModelFormat } from './threeModel';
import { resolveApiFileUrl } from './resolveFileUrl';

export interface PartModelAsset {
  url: string;
  format: PartModelFormat;
  fileId: string;
  fileName: string;
}

export function isGlbPartFile(file: ApiPartFile) {
  return /\.glb$/i.test(file.originalName) || file.mimeType === 'model/gltf-binary';
}

export function isStlPartFile(file: ApiPartFile) {
  return (
    /\.stl$/i.test(file.originalName)
    || file.mimeType === 'model/stl'
    || file.mimeType === 'application/sla'
  );
}

export function isImagePartFile(file: ApiPartFile) {
  return (
    file.mimeType?.startsWith('image/')
    || /\.(png|jpe?g|gif|webp|svg)$/i.test(file.originalName)
  );
}

export function isStepPartFile(file: ApiPartFile) {
  return /\.(step|stp)$/i.test(file.originalName);
}

export function isPdfPartFile(file: ApiPartFile) {
  return /\.pdf$/i.test(file.originalName) || file.mimeType === 'application/pdf';
}

export function findPartFile(
  files: ApiPartFile[],
  matcher: (file: ApiPartFile) => boolean,
) {
  return files.find(matcher);
}

export function pickPartModelFile(files: ApiPartFile[]): ApiPartFile | undefined {
  return files.find(isGlbPartFile) ?? files.find(isStlPartFile);
}

export function partModelFormat(file: ApiPartFile): PartModelFormat {
  return isGlbPartFile(file) ? 'glb' : 'stl';
}

/** Download a protected part file and return an object URL for Three.js loaders. */
export async function fetchPartFileBlobUrl(fileId: string) {
  const token = getStoredToken();
  const response = await fetch(resolveApiFileUrl(`/files/${fileId}/download`), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) throw new Error('Failed to load 3D model');
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/** Load GLB or STL for a part (prefers GLB). */
export async function loadPartModelAsset(partId: string): Promise<PartModelAsset | null> {
  const files = await partsApi.listFiles(partId);
  const modelFile = pickPartModelFile(files);
  if (!modelFile) return null;

  const url = await fetchPartFileBlobUrl(modelFile.id);
  return {
    url,
    format: partModelFormat(modelFile),
    fileId: modelFile.id,
    fileName: modelFile.originalName,
  };
}
