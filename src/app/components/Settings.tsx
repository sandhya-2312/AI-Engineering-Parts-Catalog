import { useEffect, useMemo, useState } from 'react';
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
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from './ui/utils';
import { isApiError, roleLabel, useAuth } from '../context/AuthContext';
import { authApi } from '../lib/api/auth';
import { SETTINGS_STORAGE_KEY, notifyProfileUpdated } from '../lib/profile';
import { ProfileAvatar } from './ProfileAvatar';

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'catalog', label: 'Catalog', icon: Package },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'export', label: 'Export Defaults', icon: FileBarChart },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
] as const;

type SectionId = (typeof settingsSections)[number]['id'];

type SettingsData = {
  profile: {
    name: string;
    email: string;
    role: string;
    jobTitle: string;
    department: string;
    photoUrl?: string;
  };
  catalog: {
    itemsPerPage: string;
    unitSystem: string;
    defaultView: string;
    showThumbnails: boolean;
    showPartNumbers: boolean;
    enableARPreview: boolean;
  };
  notifications: {
    newParts: boolean;
    exportComplete: boolean;
    catalogUpdates: boolean;
    weeklyDigest: boolean;
    teamActivity: boolean;
    emailAlerts: boolean;
  };
  exportDefaults: {
    includeImages: boolean;
    includeSpecs: boolean;
    includeDrawings: boolean;
    includePricing: boolean;
    paperSize: string;
    orientation: string;
  };
  appearance: {
    theme: string;
    compactMode: boolean;
    showAnimations: boolean;
    accentColor: string;
  };
};

function getBaseSettings(displayName: string, email: string, role: string): SettingsData {
  return {
    profile: {
      name: displayName,
      email,
      role,
      jobTitle: '',
      department: 'Engineering',
      photoUrl: '',
    },
    catalog: {
      itemsPerPage: '10',
      unitSystem: 'metric',
      defaultView: 'grid',
      showThumbnails: true,
      showPartNumbers: true,
      enableARPreview: true,
    },
    notifications: {
      newParts: true,
      exportComplete: true,
      catalogUpdates: false,
      weeklyDigest: true,
      teamActivity: false,
      emailAlerts: true,
    },
    exportDefaults: {
      includeImages: true,
      includeSpecs: true,
      includeDrawings: false,
      includePricing: false,
      paperSize: 'a4',
      orientation: 'portrait',
    },
    appearance: {
      theme: 'dark',
      compactMode: false,
      showAnimations: true,
      accentColor: 'cyan',
    },
  };
}

function readStoredSettings(): Partial<SettingsData> | null {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<SettingsData>;
  } catch {
    return null;
  }
}

function mergeSettings(base: SettingsData, stored: Partial<SettingsData> | null): SettingsData {
  return {
    profile: { ...base.profile, ...(stored?.profile ?? {}) },
    catalog: { ...base.catalog, ...(stored?.catalog ?? {}) },
    notifications: { ...base.notifications, ...(stored?.notifications ?? {}) },
    exportDefaults: { ...base.exportDefaults, ...(stored?.exportDefaults ?? {}) },
    appearance: { ...base.appearance, ...(stored?.appearance ?? {}) },
  };
}

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
  const { user, changePassword, refreshProfile } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionId>('profile');
  const [saveMessage, setSaveMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const userName = user?.fullName?.trim() || user?.email || 'Engineer User';
  const userEmail = user?.email ?? '';
  const userRole = user ? roleLabel(user.role) : 'Engineer';

  const [settings, setSettings] = useState<SettingsData>(() => {
    const base = getBaseSettings(userName, userEmail, userRole);
    return mergeSettings(base, readStoredSettings());
  });
  const [lastSavedSettings, setLastSavedSettings] = useState<SettingsData>(() => settings);

  useEffect(() => {
    const base = getBaseSettings(userName, userEmail, userRole);
    const merged = mergeSettings(base, readStoredSettings());
    setSettings(merged);
    setLastSavedSettings(merged);
  }, [userName, userEmail, userRole]);

  useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      setIsLoadingSettings(true);
      try {
        const data = await authApi.getSettings();
        if (!mounted) return;
        const base = getBaseSettings(userName, userEmail, userRole);
        const merged = mergeSettings(base, {
          profile: {
            name: data.profile.name,
            email: data.profile.email,
            role: data.profile.role,
            jobTitle: data.profile.jobTitle,
            department: data.profile.department,
            photoUrl: data.profile.photoUrl ?? '',
          },
          catalog: data.catalog as SettingsData['catalog'],
          notifications: data.notifications as SettingsData['notifications'],
          exportDefaults: data.exportDefaults as SettingsData['exportDefaults'],
          appearance: data.appearance as SettingsData['appearance'],
        });
        setSettings(merged);
        setLastSavedSettings(merged);
      } catch {
        // Keep local fallback settings if endpoint unavailable.
      } finally {
        if (mounted) setIsLoadingSettings(false);
      }
    };

    loadSettings();
    return () => {
      mounted = false;
    };
  }, [userName, userEmail, userRole]);

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(lastSavedSettings),
    [settings, lastSavedSettings],
  );

  const profile = settings.profile;
  const catalog = settings.catalog;
  const notifications = settings.notifications;
  const exportDefaults = settings.exportDefaults;
  const appearance = settings.appearance;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authApi.updateSettings({
        profile: {
          name: settings.profile.name,
          email: settings.profile.email,
          role: settings.profile.role,
          jobTitle: settings.profile.jobTitle,
          department: settings.profile.department,
          photoUrl: settings.profile.photoUrl ?? '',
        },
        catalog: settings.catalog,
        notifications: settings.notifications,
        exportDefaults: settings.exportDefaults,
        appearance: settings.appearance,
      });
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      setLastSavedSettings(settings);
      setSaveMessage('Settings saved successfully.');
      await refreshProfile();
      notifyProfileUpdated();
    } catch {
      setSaveMessage('Unable to save settings right now.');
    } finally {
      setIsSaving(false);
      window.setTimeout(() => setSaveMessage(''), 2500);
    }
  };

  const handlePhotoUpdated = (photoUrl: string) => {
    setSettings((prev) => ({
      ...prev,
      profile: { ...prev.profile, photoUrl },
    }));
    setSaveMessage('Profile photo updated.');
    window.setTimeout(() => setSaveMessage(''), 2500);
  };

  const handleEnable2FA = async () => {
    setIsEnabling2FA(true);
    try {
      const result = await authApi.enableTwoFactor();
      setSaveMessage(result.message);
    } catch (error) {
      setSaveMessage(isApiError(error) ? error.message : 'Failed to enable two-factor authentication.');
    } finally {
      setIsEnabling2FA(false);
      window.setTimeout(() => setSaveMessage(''), 2500);
    }
  };

  const handleViewSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const sessions = await authApi.sessions();
      const summary = sessions
        .map((session) => `${session.isCurrent ? '[Current] ' : ''}${session.device} - ${session.lastActiveAt}`)
        .join('\n');
      window.alert(summary || 'No active sessions found.');
    } catch (error) {
      setSaveMessage(isApiError(error) ? error.message : 'Failed to load active sessions.');
      window.setTimeout(() => setSaveMessage(''), 2500);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Password updated successfully.');
    } catch (error) {
      setPasswordError(isApiError(error) ? error.message : 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
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
              <Button
                onClick={handleSave}
                className="gap-2"
                disabled={isSaving || isLoadingSettings || !hasUnsavedChanges}
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
              </Button>
            </div>
            {saveMessage && <p className="text-sm text-muted-foreground">{saveMessage}</p>}

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
                        <ProfileAvatar
                          size="lg"
                          name={profile.name}
                          photoUrl={profile.photoUrl}
                          onPhotoUpdated={handlePhotoUpdated}
                        />
                        <div>
                          <p className="font-medium">{profile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {profile.jobTitle || profile.role}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>
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
                              setSettings((prev) => ({
                                ...prev,
                                profile: { ...prev.profile, name: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={profile.email}
                            readOnly
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Job Title</Label>
                          <Input
                            id="role"
                            value={profile.jobTitle}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                profile: { ...prev.profile, jobTitle: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            value={profile.department}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                profile: { ...prev.profile, department: e.target.value },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                catalog: { ...prev.catalog, itemsPerPage: v },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                catalog: { ...prev.catalog, unitSystem: v },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                catalog: { ...prev.catalog, defaultView: v },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                catalog: { ...prev.catalog, showThumbnails: v },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                catalog: { ...prev.catalog, showPartNumbers: v },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                catalog: { ...prev.catalog, enableARPreview: v },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                notifications: { ...prev.notifications, newParts: v },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                notifications: { ...prev.notifications, exportComplete: v },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                notifications: { ...prev.notifications, catalogUpdates: v },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                notifications: { ...prev.notifications, weeklyDigest: v },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                notifications: { ...prev.notifications, teamActivity: v },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                notifications: { ...prev.notifications, emailAlerts: v },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                exportDefaults: { ...prev.exportDefaults, includeImages: v },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                exportDefaults: { ...prev.exportDefaults, includeSpecs: v },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                exportDefaults: { ...prev.exportDefaults, includeDrawings: v },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                exportDefaults: { ...prev.exportDefaults, includePricing: v },
                              }))
                            }
                          />
                        </SettingRow>

                        <SettingRow label="Paper size" description="Default PDF page format">
                          <Select
                            value={exportDefaults.paperSize}
                            onValueChange={(v) =>
                              setSettings((prev) => ({
                                ...prev,
                                exportDefaults: { ...prev.exportDefaults, paperSize: v },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                exportDefaults: { ...prev.exportDefaults, orientation: v },
                              }))
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
                      <form className="space-y-4" onSubmit={handleUpdatePassword}>
                        <h4 className="text-sm font-medium">Change Password</h4>
                        <div className="grid gap-4 max-w-md">
                          <div className="space-y-2">
                            <Label htmlFor="current-password">Current password</Label>
                            <div className="relative">
                              <Input
                                id="current-password"
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pr-10"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-password">New password</Label>
                            <div className="relative">
                              <Input
                                id="new-password"
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pr-10"
                                required
                                minLength={8}
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                              >
                                {showNewPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm new password</Label>
                            <div className="relative">
                              <Input
                                id="confirm-password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pr-10"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                          {passwordError && (
                            <p className="text-sm text-destructive">{passwordError}</p>
                          )}
                          {passwordSuccess && (
                            <p className="text-sm text-emerald-600">{passwordSuccess}</p>
                          )}
                          <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                            className="w-fit"
                            disabled={isUpdatingPassword}
                          >
                            {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                          </Button>
                        </div>
                      </form>

                      <Separator />

                      <div className="divide-y divide-border">
                        <SettingRow
                          label="Two-factor authentication"
                          description="Add an extra layer of security to your account"
                        >
                          <Button variant="outline" size="sm" onClick={handleEnable2FA} disabled={isEnabling2FA}>
                            {isEnabling2FA ? 'Enabling...' : 'Enable 2FA'}
                          </Button>
                        </SettingRow>

                        <SettingRow
                          label="Active sessions"
                          description="Manage devices signed into your account"
                        >
                          <Button variant="outline" size="sm" onClick={handleViewSessions} disabled={isLoadingSessions}>
                            {isLoadingSessions ? 'Loading...' : 'View Sessions'}
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
                              setSettings((prev) => ({
                                ...prev,
                                appearance: { ...prev.appearance, theme: v },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                appearance: { ...prev.appearance, accentColor: v },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                appearance: { ...prev.appearance, compactMode: v },
                              }))
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
                              setSettings((prev) => ({
                                ...prev,
                                appearance: { ...prev.appearance, showAnimations: v },
                              }))
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
