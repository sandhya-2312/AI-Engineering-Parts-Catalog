export type UserRole = 'admin' | 'user' | 'viewer';

export type PartAvailabilityApi = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface ApiUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  jobTitle?: string;
  department?: string;
  photoUrl?: string;
  twoFactorEnabled?: boolean;
  mustChangePassword: boolean;
  isActive?: boolean;
  createdAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: ApiUser;
  mustChangePassword: boolean;
}

export interface LookupEntity {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  website?: string;
  country?: string;
}

export interface ApiPart {
  id: string;
  name: string;
  partNumber: string;
  category?: LookupEntity | null;
  material?: LookupEntity | null;
  manufacturer?: LookupEntity | null;
  categoryId?: string | null;
  materialId?: string | null;
  manufacturerId?: string | null;
  partType?: string;
  revision?: string;
  availability: PartAvailabilityApi;
  dimensions: { length: number | null; width: number | null; height: number | null };
  weight: number | null;
  description?: string;
  tags: string[];
  thumbnail?: string;
  downloads: number;
  files?: ApiPartFile[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiPartFile {
  id: string;
  partId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt?: string;
}

export interface PaginatedParts {
  data: ApiPart[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface UserSettingsPayload {
  profile: {
    name: string;
    email: string;
    role: string;
    jobTitle: string;
    department: string;
    photoUrl?: string;
  };
  catalog: Record<string, unknown>;
  notifications: Record<string, unknown>;
  exportDefaults: Record<string, unknown>;
  appearance: Record<string, unknown>;
  security?: {
    twoFactorEnabled: boolean;
  };
}

export interface UserSession {
  id: string;
  device: string;
  location: string;
  lastActiveAt: string;
  isCurrent: boolean;
}
