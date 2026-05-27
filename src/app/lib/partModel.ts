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

export interface PartModelLoadResult {
  asset: PartModelAsset | null;
  error?: string;
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

export function isPartFileAvailable(file: ApiPartFile) {
  return file.available !== false;
}

export function pickPartModelFile(files: ApiPartFile[]): ApiPartFile | undefined {
  const available = files.filter(isPartFileAvailable);
  return available.find(isGlbPartFile) ?? available.find(isStlPartFile);
}

export function partModelFormat(file: ApiPartFile): PartModelFormat {
  return isGlbPartFile(file) ? 'glb' : 'stl';
}

export function thumbnailFileId(thumbnail: string): string | null {
  const match = thumbnail.match(/^\/files\/([^/]+)\/download$/);
  return match?.[1] ?? null;
}

/** Download a protected part file and return an object URL for Three.js loaders. */
export async function fetchPartFileBlobUrl(fileId: string) {
  const token = getStoredToken();
  const response = await fetch(resolveApiFileUrl(`/files/${fileId}/download`), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (response.status === 404) {
    throw new Error('FILE_NOT_ON_SERVER');
  }
  if (!response.ok) throw new Error('Failed to load file');
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/** Load GLB or STL for a part (prefers GLB). Skips files missing on the server. */
export async function loadPartModelAsset(partId: string): Promise<PartModelLoadResult> {
  const files = await partsApi.listFiles(partId);
  const modelFiles = files.filter(
    (file) => (isGlbPartFile(file) || isStlPartFile(file)) && isPartFileAvailable(file),
  );

  if (modelFiles.length === 0) {
    const hasStale = files.some(
      (file) =>
        (isGlbPartFile(file) || isStlPartFile(file)) && file.available === false,
    );
    if (hasStale) {
      return {
        asset: null,
        error:
          '3D file metadata exists but the file is missing on the server. Edit this part and re-upload the GLB or STL.',
      };
    }
    return { asset: null, error: 'No GLB or STL file attached to this part.' };
  }

  for (const modelFile of modelFiles) {
    try {
      const url = await fetchPartFileBlobUrl(modelFile.id);
      return {
        asset: {
          url,
          format: partModelFormat(modelFile),
          fileId: modelFile.id,
          fileName: modelFile.originalName,
        },
      };
    } catch (error) {
      if ((error as Error).message !== 'FILE_NOT_ON_SERVER') throw error;
    }
  }

  return {
    asset: null,
    error:
      'Could not load the 3D file. Edit this part and re-upload the GLB or STL.',
  };
}
