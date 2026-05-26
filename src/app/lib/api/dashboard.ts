import { catalogApi } from './catalog';
import { apiFetch } from './client';
import type { ApiPart } from './types';

export type RecentlyAddedPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecentlyAddedByPeriod {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface DashboardStats {
  totalParts: number;
  categories: number;
  recentlyAdded: number;
  totalDownloads: number;
}

export interface DashboardChartPoint {
  name: string;
  downloads: number;
  parts: number;
}

export interface DashboardCategoryPoint {
  name: string;
  parts: number;
}

export interface DashboardActivityItem {
  part: string;
  action: string;
  time: string;
  user: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentlyAddedByPeriod: RecentlyAddedByPeriod;
  chartData: DashboardChartPoint[];
  partsByCategory: DashboardCategoryPoint[];
  recentActivity: DashboardActivityItem[];
}

type RawDashboardResponse = Partial<DashboardResponse> & {
  stats?: Partial<DashboardStats>;
  totalParts?: number;
  totalCategories?: number;
  categories?: number;
  activeCategories?: number;
  recentlyAdded?: number;
  recentlyAddedByPeriod?: Partial<RecentlyAddedByPeriod>;
  totalDownloads?: number;
  chartData?: Array<Partial<DashboardChartPoint>>;
  partsByCategory?: Array<Partial<DashboardCategoryPoint>>;
  recentActivity?: Array<Partial<DashboardActivityItem>>;
};

const numberOrZero = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function aggregatePartsByCategory(parts: ApiPart[]): DashboardCategoryPoint[] {
  const counts = new Map<string, number>();
  for (const part of parts) {
    const name = part.category?.name?.trim() || 'Uncategorized';
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, partsCount]) => ({ name, parts: partsCount }))
    .sort((a, b) => b.parts - a.parts);
}

const defaultRecentlyAddedByPeriod: RecentlyAddedByPeriod = {
  daily: 0,
  weekly: 0,
  monthly: 0,
  yearly: 0,
};

function normalizeRecentlyAddedByPeriod(
  raw: Partial<RecentlyAddedByPeriod> | undefined,
  monthlyFallback: number,
): RecentlyAddedByPeriod {
  const source = raw ?? {};
  return {
    daily: numberOrZero(source.daily),
    weekly: numberOrZero(source.weekly),
    monthly: numberOrZero(source.monthly ?? monthlyFallback),
    yearly: numberOrZero(source.yearly),
  };
}

function countRecentlyAddedFromParts(parts: ApiPart[]): RecentlyAddedByPeriod {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = new Date(dayStart);
  const dayOfWeek = weekStart.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  weekStart.setDate(weekStart.getDate() - daysFromMonday);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const yearStart = new Date(now.getFullYear(), 0, 1).getTime();
  const counts = { ...defaultRecentlyAddedByPeriod };

  for (const part of parts) {
    if (!part.createdAt) continue;
    const created = new Date(part.createdAt).getTime();
    if (Number.isNaN(created)) continue;
    if (created >= yearStart) counts.yearly += 1;
    if (created >= monthStart) counts.monthly += 1;
    if (created >= weekStart.getTime()) counts.weekly += 1;
    if (created >= dayStart) counts.daily += 1;
  }

  return counts;
}

function normalizeDashboardResponse(raw: RawDashboardResponse): DashboardResponse {
  const stats: Partial<DashboardStats> = raw.stats ?? {};
  const chartData = Array.isArray(raw.chartData) ? raw.chartData : [];
  const partsByCategory = Array.isArray(raw.partsByCategory) ? raw.partsByCategory : [];
  const recentActivity = Array.isArray(raw.recentActivity) ? raw.recentActivity : [];

  const recentlyAddedMonthly = numberOrZero(stats.recentlyAdded ?? raw.recentlyAdded);

  return {
    stats: {
      totalParts: numberOrZero(stats.totalParts ?? raw.totalParts),
      categories: numberOrZero(
        stats.categories ?? raw.activeCategories ?? raw.totalCategories ?? raw.categories,
      ),
      recentlyAdded: recentlyAddedMonthly,
      totalDownloads: numberOrZero(stats.totalDownloads ?? raw.totalDownloads),
    },
    recentlyAddedByPeriod: normalizeRecentlyAddedByPeriod(
      raw.recentlyAddedByPeriod,
      recentlyAddedMonthly,
    ),
    chartData: chartData.map((point) => ({
      name: typeof point.name === 'string' ? point.name : '',
      downloads: numberOrZero(point.downloads),
      parts: numberOrZero(point.parts),
    })),
    partsByCategory: partsByCategory.map((point) => ({
      name: typeof point.name === 'string' ? point.name : 'Uncategorized',
      parts: numberOrZero(point.parts),
    })),
    recentActivity: recentActivity.map((activity) => ({
      part: typeof activity.part === 'string' ? activity.part : 'Unknown part',
      action: typeof activity.action === 'string' ? activity.action : 'Updated',
      time: typeof activity.time === 'string' ? activity.time : 'just now',
      user: typeof activity.user === 'string' ? activity.user : 'System',
    })),
  };
}

export const dashboardApi = {
  async summary() {
    const data = await apiFetch<RawDashboardResponse>('/catalog/dashboard');
    const normalized = normalizeDashboardResponse(data ?? {});

    let result = normalized;
    const needsCategoryFallback = result.partsByCategory.length === 0 && result.stats.totalParts > 0;
    const needsPeriodFallback = !data?.recentlyAddedByPeriod && result.stats.totalParts > 0;

    if (needsCategoryFallback || needsPeriodFallback) {
      try {
        const { data: parts } = await catalogApi.listParts({
          page: 1,
          limit: Math.min(Math.max(result.stats.totalParts, 1), 500),
        });

        if (needsCategoryFallback) {
          const categories = aggregatePartsByCategory(parts);
          if (categories.length > 0) {
            result = { ...result, partsByCategory: categories };
          }
        }

        if (needsPeriodFallback) {
          const periods = countRecentlyAddedFromParts(parts);
          result = {
            ...result,
            recentlyAddedByPeriod: periods,
            stats: { ...result.stats, recentlyAdded: periods.monthly },
          };
        }
      } catch {
        // keep API values
      }
    }

    return result;
  },
};
