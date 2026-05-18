import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  Package,
  FolderTree,
  TrendingUp,
  Download,
  Eye,
  Upload,
  FileBarChart,
  Layers
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statsData = [
  { icon: Package, label: 'Total Parts', value: '2,847', change: '+12%', color: 'text-cyan-500' },
  { icon: FolderTree, label: 'Categories', value: '48', change: '+3', color: 'text-blue-500' },
  { icon: TrendingUp, label: 'Recently Added', value: '127', change: 'This month', color: 'text-green-500' },
  { icon: Download, label: 'Downloads', value: '15.2K', change: '+24%', color: 'text-purple-500' },
];

const chartData = [
  { name: 'Jan', downloads: 1200, parts: 40 },
  { name: 'Feb', downloads: 1900, parts: 65 },
  { name: 'Mar', downloads: 1600, parts: 52 },
  { name: 'Apr', downloads: 2400, parts: 89 },
  { name: 'May', downloads: 3200, parts: 127 },
];

const recentActivity = [
  { part: 'Precision Bearing Assembly', action: 'Downloaded', time: '2 min ago', user: 'M. Chen' },
  { part: 'Hydraulic Cylinder Rod', action: 'Viewed', time: '15 min ago', user: 'A. Smith' },
  { part: 'Motor Mount Bracket', action: 'Added to favorites', time: '1 hour ago', user: 'J. Park' },
  { part: 'Industrial Gear Drive', action: 'Downloaded', time: '2 hours ago', user: 'R. Johnson' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <main className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Dashboard</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Welcome back to your engineering workspace</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => navigate('/catalog')}>
                <Eye className="w-3.5 h-3.5" />
                Browse Catalog
              </Button>
              <Button size="sm">
                <Upload className="w-3.5 h-3.5" />
                Upload Part
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {statsData.map((stat, index) => (
              <Card key={index} className="gap-0 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-xl font-semibold tracking-tight">{stat.value}</p>
                      <p className={`text-xs ${stat.color}`}>{stat.change}</p>
                    </div>
                    <div className={`p-2 rounded-md bg-card border border-border ${stat.color}`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <Card className="gap-0 border border-border/50">
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Catalog Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} width={36} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="downloads"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={{ fill: '#06b6d4', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="gap-0 border border-border/50">
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-medium">
                  <Package className="w-4 h-4 text-primary" />
                  Parts Added by Month
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} width={36} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="parts" fill="#06b6d4" radius={[4, 4, 0, 0]} />
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
            </CardContent>
          </Card>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Card className="gap-0 border border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => navigate('/catalog')}>
              <CardContent className="p-4 text-center space-y-2">
                <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-medium tracking-tight">Browse Catalog</h3>
                <p className="text-xs text-muted-foreground">Explore all parts</p>
              </CardContent>
            </Card>

            <Card className="gap-0 border border-blue-500/20 bg-gradient-to-br from-card to-blue-500/5 hover:shadow-md transition-all duration-300 cursor-pointer">
              <CardContent className="p-4 text-center space-y-2">
                <div className="w-9 h-9 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
                  <Upload className="w-4 h-4 text-blue-500" />
                </div>
                <h3 className="text-sm font-medium tracking-tight">Upload Part</h3>
                <p className="text-xs text-muted-foreground">Add new component</p>
              </CardContent>
            </Card>

            <Card className="gap-0 border border-purple-500/20 bg-gradient-to-br from-card to-purple-500/5 hover:shadow-md transition-all duration-300 cursor-pointer">
              <CardContent className="p-4 text-center space-y-2">
                <div className="w-9 h-9 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto">
                  <Layers className="w-4 h-4 text-purple-500" />
                </div>
                <h3 className="text-sm font-medium tracking-tight">Open AR Viewer</h3>
                <p className="text-xs text-muted-foreground">Visualize in 3D</p>
              </CardContent>
            </Card>

            <Card className="gap-0 border border-green-500/20 bg-gradient-to-br from-card to-green-500/5 hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => navigate('/export')}>
              <CardContent className="p-4 text-center space-y-2">
                <div className="w-9 h-9 rounded-md bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                  <FileBarChart className="w-4 h-4 text-green-500" />
                </div>
                <h3 className="text-sm font-medium tracking-tight">Export Catalog</h3>
                <p className="text-xs text-muted-foreground">Generate PDF</p>
              </CardContent>
            </Card>
          </div>
    </main>
  );
}
