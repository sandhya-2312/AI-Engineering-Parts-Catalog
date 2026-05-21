import { authApi } from './api/auth';

export const SETTINGS_STORAGE_KEY = 'engineerx.settings.v1';
export const PROFILE_UPDATED_EVENT = 'engineerx.profile-updated';

export type ProfileDisplay = {
  name: string;
  jobTitle: string;
  photoUrl: string;
};

export function readStoredProfile(): Partial<ProfileDisplay> | null {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { profile?: Partial<ProfileDisplay> };
    return parsed.profile ?? null;
  } catch {
    return null;
  }
}

export function notifyProfileUpdated() {
  window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT));
}

export async function updateProfilePhoto(photoUrl: string) {
  const result = await authApi.updatePhoto(photoUrl.trim());
  notifyProfileUpdated();
  return result;
}

export async function uploadProfilePhotoFile(file: File) {
  const result = await authApi.uploadPhotoFile(file);
  notifyProfileUpdated();
  return result;
}

/** Resolve stored photo path for use in img src (supports API paths and external URLs). */
export function resolvePhotoSrc(photoUrl: string): string {
  if (!photoUrl) return '';
  if (
    photoUrl.startsWith('http://') ||
    photoUrl.startsWith('https://') ||
    photoUrl.startsWith('data:') ||
    photoUrl.startsWith('/api/')
  ) {
    return photoUrl;
  }
  return photoUrl;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function validateProfilePhotoFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Choose a PNG, JPG, WebP, or GIF image.';
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return 'Image must be 5 MB or smaller.';
  }
  return null;
}
