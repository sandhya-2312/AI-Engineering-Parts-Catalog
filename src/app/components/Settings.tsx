import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Settings as SettingsIcon,
  User,
  Package,
  Bell,
  FileBarChart,
  Shield,
  Palette,
  Save,
  Camera,
} from 'lucide-react';
import { cn } from './ui/utils';

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'catalog', label: 'Catalog', icon: Package },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'export', label: 'Export Defaults', icon: FileBarChart },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
] as const;

type SectionId = (typeof settingsSections)[number]['id'];

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="space-y-0.5 min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState<SectionId>('profile');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: 'John Engineer',
    email: 'john.engineer@engineerx.com',
    role: 'Senior Engineer',
    department: 'Mechanical Design',
  });

  const [catalog, setCatalog] = useState({
    itemsPerPage: '10',
    unitSystem: 'metric',
    defaultView: 'grid',
    showThumbnails: true,
    showPartNumbers: true,
    enableARPreview: true,
  });

  const [notifications, setNotifications] = useState({
    newParts: true,
    exportComplete: true,
    catalogUpdates: false,
    weeklyDigest: true,
    teamActivity: false,
    emailAlerts: true,
  });

  const [exportDefaults, setExportDefaults] = useState({
    includeImages: true,
    includeSpecs: true,
    includeDrawings: false,
    includePricing: false,
    paperSize: 'a4',
    orientation: 'portrait',
  });

  const [appearance, setAppearance] = useState({
    theme: 'dark',
    compactMode: false,
    showAnimations: true,
    accentColor: 'cyan',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <SettingsIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl tracking-tight">Settings</h2>
                  <p className="text-muted-foreground">
                    Manage your account and catalog preferences
                  </p>
                </div>
              </div>
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                {saved ? 'Saved!' : 'Save Changes'}
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <nav className="lg:w-56 shrink-0">
                <Card className="border border-border/50 p-2">
                  <div className="space-y-1">
                    {settingsSections.map((section) => {
                      const Icon = section.icon;
                      const isActive = activeSection === section.id;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                            isActive
                              ? 'bg-primary/10 text-foreground border border-primary/20'
                              : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                          )}
                        >
                          <Icon className={cn('w-4 h-4', isActive && 'text-primary')} />
                          {section.label}
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </nav>

              <div className="flex-1 min-w-0">
                {activeSection === 'profile' && (
                  <Card className="border border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Profile
                      </CardTitle>
                      <CardDescription>
                        Your personal information and workspace identity
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                            <User className="w-10 h-10 text-primary" />
                          </div>
                          <button className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-foreground border-2 border-background hover:bg-primary/90 transition-colors">
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div>
                          <p className="font-medium">{profile.name}</p>
                          <p className="text-sm text-muted-foreground">{profile.role}</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Change Photo
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={profile.name}
                            onChange={(e) =>
                              setProfile({ ...profile, name: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profile.email}
                            onChange={(e) =>
                              setProfile({ ...profile, email: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Job Title</Label>
                          <Input
                            id="role"
                            value={profile.role}
                            onChange={(e) =>
                              setProfile({ ...profile, role: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            value={profile.department}
                            onChange={(e) =>
                              setProfile({ ...profile, department: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeSection === 'catalog' && (
                  <Card className="border border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        Catalog Preferences
                      </CardTitle>
                      <CardDescription>
                        Customize how parts are displayed and browsed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y divide-border">
                        <SettingRow
                          label="Items per page"
                          description="Number of parts shown in catalog list view"
                        >
                          <Select
                            value={catalog.itemsPerPage}
                            onValueChange={(v) =>
                              setCatalog({ ...catalog, itemsPerPage: v })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="25">25</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                          </Select>
                        </SettingRow>

                        <SettingRow
                          label="Unit system"
                          description="Default measurement units for specifications"
                        >
                          <Select
                            value={catalog.unitSystem}
                            onValueChange={(v) =>
                              setCatalog({ ...catalog, unitSystem: v })
                            }
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="metric">Metric (mm)</SelectItem>
                              <SelectItem value="imperial">Imperial (in)</SelectItem>
                            </SelectContent>
                          </Select>
                        </SettingRow>

                        <SettingRow
                          label="Default view"
                          description="Layout when opening the parts catalog"
                        >
                          <Select
                            value={catalog.defaultView}
                            onValueChange={(v) =>
                              setCatalog({ ...catalog, defaultView: v })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="grid">Grid</SelectItem>
                              <SelectItem value="list">List</SelectItem>
                              <SelectItem value="table">Table</SelectItem>
                            </SelectContent>
                          </Select>
                        </SettingRow>

                        <SettingRow
                          label="Show thumbnails"
                          description="Display part preview images in catalog"
                        >
                          <Switch
                            checked={catalog.showThumbnails}
                            onCheckedChange={(v) =>
                              setCatalog({ ...catalog, showThumbnails: v })
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Show part numbers"
                          description="Display part numbers alongside names"
                        >
                          <Switch
                            checked={catalog.showPartNumbers}
                            onCheckedChange={(v) =>
                              setCatalog({ ...catalog, showPartNumbers: v })
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="AR preview"
                          description="Enable 3D AR viewer for compatible parts"
                        >
                          <Switch
                            checked={catalog.enableARPreview}
                            onCheckedChange={(v) =>
                              setCatalog({ ...catalog, enableARPreview: v })
                            }
                          />
                        </SettingRow>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeSection === 'notifications' && (
                  <Card className="border border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-primary" />
                        Notifications
                      </CardTitle>
                      <CardDescription>
                        Choose what updates you receive about the catalog
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y divide-border">
                        <SettingRow
                          label="New parts added"
                          description="When new components are uploaded to the catalog"
                        >
                          <Switch
                            checked={notifications.newParts}
                            onCheckedChange={(v) =>
                              setNotifications({ ...notifications, newParts: v })
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Export complete"
                          description="When PDF catalog exports finish generating"
                        >
                          <Switch
                            checked={notifications.exportComplete}
                            onCheckedChange={(v) =>
                              setNotifications({ ...notifications, exportComplete: v })
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Catalog updates"
                          description="Changes to existing part specifications"
                        >
                          <Switch
                            checked={notifications.catalogUpdates}
                            onCheckedChange={(v) =>
                              setNotifications({ ...notifications, catalogUpdates: v })
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Weekly digest"
                          description="Summary of catalog activity and popular parts"
                        >
                          <Switch
                            checked={notifications.weeklyDigest}
                            onCheckedChange={(v) =>
                              setNotifications({ ...notifications, weeklyDigest: v })
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Team activity"
                          description="When colleagues download or favorite parts"
                        >
                          <Switch
                            checked={notifications.teamActivity}
                            onCheckedChange={(v) =>
                              setNotifications({ ...notifications, teamActivity: v })
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Email alerts"
                          description="Receive notifications via email"
                        >
                          <Switch
                            checked={notifications.emailAlerts}
                            onCheckedChange={(v) =>
                              setNotifications({ ...notifications, emailAlerts: v })
                            }
                          />
                        </SettingRow>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeSection === 'export' && (
                  <Card className="border border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileBarChart className="w-5 h-5 text-primary" />
                        Export Defaults
                      </CardTitle>
                      <CardDescription>
                        Pre-selected options when generating catalog PDFs
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y divide-border">
                        <SettingRow
                          label="Include part images"
                          description="Add thumbnail images to exported catalogs"
                        >
                          <Switch
                            checked={exportDefaults.includeImages}
                            onCheckedChange={(v) =>
                              setExportDefaults({ ...exportDefaults, includeImages: v })
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Include specifications"
                          description="Technical specs and dimensions"
                        >
                          <Switch
                            checked={exportDefaults.includeSpecs}
                            onCheckedChange={(v) =>
                              setExportDefaults({ ...exportDefaults, includeSpecs: v })
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Include engineering drawings"
                          description="CAD drawings and schematics"
                        >
                          <Switch
                            checked={exportDefaults.includeDrawings}
                            onCheckedChange={(v) =>
                              setExportDefaults({ ...exportDefaults, includeDrawings: v })
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Include pricing"
                          description="Cost and supplier pricing data"
                        >
                          <Switch
                            checked={exportDefaults.includePricing}
                            onCheckedChange={(v) =>
                              setExportDefaults({ ...exportDefaults, includePricing: v })
                            }
                          />
                        </SettingRow>

                        <SettingRow label="Paper size" description="Default PDF page format">
                          <Select
                            value={exportDefaults.paperSize}
                            onValueChange={(v) =>
                              setExportDefaults({ ...exportDefaults, paperSize: v })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="a4">A4</SelectItem>
                              <SelectItem value="letter">Letter</SelectItem>
                              <SelectItem value="a3">A3</SelectItem>
                            </SelectContent>
                          </Select>
                        </SettingRow>

                        <SettingRow label="Orientation" description="Page layout direction">
                          <Select
                            value={exportDefaults.orientation}
                            onValueChange={(v) =>
                              setExportDefaults({ ...exportDefaults, orientation: v })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="portrait">Portrait</SelectItem>
                              <SelectItem value="landscape">Landscape</SelectItem>
                            </SelectContent>
                          </Select>
                        </SettingRow>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeSection === 'security' && (
                  <Card className="border border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Security
                      </CardTitle>
                      <CardDescription>
                        Password and account security settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Change Password</h4>
                        <div className="grid gap-4 max-w-md">
                          <div className="space-y-2">
                            <Label htmlFor="current-password">Current password</Label>
                            <Input id="current-password" type="password" placeholder="••••••••" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-password">New password</Label>
                            <Input id="new-password" type="password" placeholder="••••••••" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm new password</Label>
                            <Input id="confirm-password" type="password" placeholder="••••••••" />
                          </div>
                          <Button variant="outline" size="sm" className="w-fit">
                            Update Password
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      <div className="divide-y divide-border">
                        <SettingRow
                          label="Two-factor authentication"
                          description="Add an extra layer of security to your account"
                        >
                          <Button variant="outline" size="sm">
                            Enable 2FA
                          </Button>
                        </SettingRow>

                        <SettingRow
                          label="Active sessions"
                          description="Manage devices signed into your account"
                        >
                          <Button variant="outline" size="sm">
                            View Sessions
                          </Button>
                        </SettingRow>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeSection === 'appearance' && (
                  <Card className="border border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-primary" />
                        Appearance
                      </CardTitle>
                      <CardDescription>
                        Customize the look and feel of EngineerX
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y divide-border">
                        <SettingRow label="Theme" description="Interface color scheme">
                          <Select
                            value={appearance.theme}
                            onValueChange={(v) =>
                              setAppearance({ ...appearance, theme: v })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                        </SettingRow>

                        <SettingRow
                          label="Accent color"
                          description="Primary highlight color across the app"
                        >
                          <Select
                            value={appearance.accentColor}
                            onValueChange={(v) =>
                              setAppearance({ ...appearance, accentColor: v })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cyan">Cyan</SelectItem>
                              <SelectItem value="blue">Blue</SelectItem>
                              <SelectItem value="green">Green</SelectItem>
                              <SelectItem value="purple">Purple</SelectItem>
                            </SelectContent>
                          </Select>
                        </SettingRow>

                        <SettingRow
                          label="Compact mode"
                          description="Reduce spacing for denser information display"
                        >
                          <Switch
                            checked={appearance.compactMode}
                            onCheckedChange={(v) =>
                              setAppearance({ ...appearance, compactMode: v })
                            }
                          />
                        </SettingRow>

                        <SettingRow
                          label="Animations"
                          description="Enable smooth transitions and micro-interactions"
                        >
                          <Switch
                            checked={appearance.showAnimations}
                            onCheckedChange={(v) =>
                              setAppearance({ ...appearance, showAnimations: v })
                            }
                          />
                        </SettingRow>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
    </main>
  );
}
