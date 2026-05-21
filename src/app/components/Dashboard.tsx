import { useEffect, useState } from 'react';

import {
  dashboardApi,
  type DashboardActivityItem,
  type DashboardCategoryPoint,
  type DashboardChartPoint,
  type DashboardStats,
  type RecentlyAddedByPeriod,
  type RecentlyAddedPeriod,
} from '../lib/api/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Package,
  FolderTree,
  TrendingUp,
  
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const defaultStats: DashboardStats = {
  totalParts: 0,
  categories: 0,
  recentlyAdded: 0,
  totalDownloads: 0,
};

const defaultRecentlyAddedByPeriod: RecentlyAddedByPeriod = {
  daily: 0,
  weekly: 0,
  monthly: 0,
  yearly: 0,
};

const RECENTLY_ADDED_PERIOD_OPTIONS: { value: RecentlyAddedPeriod; label: string; hint: string }[] = [
  { value: 'daily', label: 'Daily', hint: 'Added today' },
  { value: 'weekly', label: 'Weekly', hint: 'Added this week' },
  { value: 'monthly', label: 'Monthly', hint: 'Added this month' },
  { value: 'yearly', label: 'Yearly', hint: 'Added this year' },
];

export default function Dashboard() {
  
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [recentlyAddedByPeriod, setRecentlyAddedByPeriod] =
    useState<RecentlyAddedByPeriod>(defaultRecentlyAddedByPeriod);
  const [recentlyAddedPeriod, setRecentlyAddedPeriod] = useState<RecentlyAddedPeriod>('monthly');
  const [chartData, setChartData] = useState<DashboardChartPoint[]>([]);
  const [partsByCategory, setPartsByCategory] = useState<DashboardCategoryPoint[]>([]);
  const [recentActivity, setRecentActivity] = useState<DashboardActivityItem[]>([]);

  const selectedPeriodMeta = RECENTLY_ADDED_PERIOD_OPTIONS.find((o) => o.value === recentlyAddedPeriod)!;
  const recentlyAddedCount = recentlyAddedByPeriod[recentlyAddedPeriod];

  useEffect(() => {
    dashboardApi
      .summary()
      .then((data) => {
        setStats(data.stats);
        setRecentlyAddedByPeriod(data.recentlyAddedByPeriod);
        setChartData(data.chartData);
        setPartsByCategory(data.partsByCategory);
        setRecentActivity(data.recentActivity);
      })
      .catch(() => {});
  }, []);

  const statsData = [
    {
      icon: Package,
      label: 'Total Parts',
      value: stats.totalParts.toLocaleString(),
      color: 'text-cyan-500',
    },
    {
      icon: FolderTree,
      label: 'Categories',
      value: stats.categories.toLocaleString(),
      change: 'Active categories',
      color: 'text-blue-500',
    },
  ];
  const totalAddedParts = chartData.reduce((sum, point) => sum + point.parts, 0);
  const categorizedParts = partsByCategory.reduce((sum, point) => sum + point.parts, 0);

  return (
    <main className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Dashboard</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Welcome back to your engineering workspace</p>
            </div>
            
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {statsData.map((stat, index) => (
              <Card key={index} className="gap-0 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-xl font-semibold tracking-tight">{stat.value}</p>
                      {'change' in stat && stat.change ? (
                        <p className={`text-xs ${stat.color}`}>{stat.change}</p>
                      ) : null}
                    </div>
                    <div className={`p-2 rounded-md bg-card border border-border ${stat.color}`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="gap-0 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">Recently Added</p>
                      <Select
                        value={recentlyAddedPeriod}
                        onValueChange={(value) => setRecentlyAddedPeriod(value as RecentlyAddedPeriod)}
                      >
                        <SelectTrigger className="h-7 w-[5.5rem] text-[11px] px-2 border-border/60">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RECENTLY_ADDED_PERIOD_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-xs">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xl font-semibold tracking-tight">
                      {recentlyAddedCount.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-500">{selectedPeriodMeta.hint}</p>
                  </div>
                  <div className="p-2 rounded-md bg-card border border-border text-green-500 shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <Card className="gap-0 border border-border/50 bg-gradient-to-br from-card via-card to-blue-500/5 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-medium tracking-tight">
                  <FolderTree className="w-4 h-4 text-primary" />
                  Parts by Categories
                </CardTitle>
                <p className="text-[11px] text-muted-foreground">
                  {partsByCategory.length} {partsByCategory.length === 1 ? 'category' : 'categories'} · {categorizedParts.toLocaleString()} parts
                </p>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={partsByCategory} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="categoryGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" opacity={0.5} vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="var(--muted-foreground)"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={48}
                    />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      tick={{ fontSize: 11 }}
                      width={32}
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                      formatter={(value: number) => [value.toLocaleString(), 'Parts']}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        boxShadow: '0 10px 24px rgba(0, 0, 0, 0.08)',
                      }}
                      labelStyle={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}
                    />
                    <Bar dataKey="parts" fill="url(#categoryGradient)" radius={[8, 8, 2, 2]} maxBarSize={44} />
                  </BarChart>
                </ResponsiveContainer>
                {partsByCategory.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center -mt-2">No parts in categories yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="gap-0 border border-border/50 bg-gradient-to-br from-card via-card to-blue-500/5 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-medium tracking-tight">
                  <Package className="w-4 h-4 text-primary" />
                  Parts Added by Month
                </CardTitle>
                <p className="text-[11px] text-muted-foreground">New parts in view: {totalAddedParts.toLocaleString()}</p>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="partsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#0891b2" stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" opacity={0.5} vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="var(--muted-foreground)"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      tick={{ fontSize: 11 }}
                      width={32}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(6, 182, 212, 0.08)' }}
                      formatter={(value: number) => [value.toLocaleString(), 'Parts']}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        boxShadow: '0 10px 24px rgba(0, 0, 0, 0.08)',
                      }}
                      labelStyle={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}
                    />
                    <Bar dataKey="parts" fill="url(#partsGradient)" radius={[8, 8, 2, 2]} maxBarSize={44} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="gap-0 border border-border/50">
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-1">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent/5 transition-colors">
                    <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-sm shrink-0">
                      🔩
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{activity.part}</p>
                      <p className="text-[11px] text-muted-foreground">{activity.action} by {activity.user}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground shrink-0">{activity.time}</p>
                  </div>
                ))}
              </div>
              {recentActivity.length === 0 && (
                <p className="text-xs text-muted-foreground px-2 py-2">No recent activity yet.</p>
              )}
            </CardContent>
          </Card>

          
          
    </main>
  );
}
