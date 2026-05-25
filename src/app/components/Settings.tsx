import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import {
  Settings as SettingsIcon,
  User,
  Package,
  Bell,
  FileBarChart,
  Shield,
  Palette,
  Save,
} from 'lucide-react';
import { cn } from './ui/utils';
import { roleLabel, useAuth } from '../context/AuthContext';
import { authApi } from '../lib/api/auth';
import { SETTINGS_STORAGE_KEY, notifyProfileUpdated } from '../lib/profile';
import {
  DEFAULT_CATALOG_SETTINGS,
  mergeCatalogSettings,
  notifyCatalogSettingsUpdated,
  type CatalogSettings as CatalogSettingsData,
} from '../lib/catalogSettings';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  mergeNotificationSettings,
  notifyNotificationSettingsUpdated,
  type NotificationSettings as NotificationSettingsData,
} from '../lib/notificationSettings';
import {
  DEFAULT_EXPORT_DEFAULTS,
  mergeExportDefaults,
  notifyExportDefaultsUpdated,
  type ExportDefaultsSettings as ExportDefaultsSettingsData,
} from '../lib/exportDefaultsSettings';
import {
  DEFAULT_APPEARANCE_SETTINGS,
  applyAppearance,
  mergeAppearanceSettings,
  notifyAppearanceSettingsUpdated,
  type AppearanceSettings as AppearanceSettingsData,
} from '../lib/appearanceSettings';
import { ProfileAvatar } from './ProfileAvatar';
import CatalogSettings from './CatalogSettings';
import NotificationSettings from './NotificationSettings';
import ExportDefaultsSettingsPanel from './ExportDefaultsSettings';
import SecuritySettings from './SecuritySettings';
import AppearanceSettingsPanel from './AppearanceSettings';

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'catalog', label: 'Catalog', icon: Package },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'export', label: 'Export Defaults', icon: FileBarChart },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
] as const;

type SectionId = (typeof settingsSections)[number]['id'];

const VALID_SECTION_IDS = new Set<SectionId>(settingsSections.map((s) => s.id));

function parseSectionId(value: string | null): SectionId {
  if (value && VALID_SECTION_IDS.has(value as SectionId)) {
    return value as SectionId;
  }
  return 'profile';
}

type SettingsData = {
  profile: {
    name: string;
    email: string;
    role: string;
    jobTitle: string;
    department: string;
    contactNo: string;
    photoUrl?: string;
  };
  catalog: CatalogSettingsData;
  notifications: NotificationSettingsData;
  exportDefaults: ExportDefaultsSettingsData;
  appearance: AppearanceSettingsData;
};

function getBaseSettings(displayName: string, email: string, role: string): SettingsData {
  return {
    profile: {
      name: displayName,
      email,
      role,
      jobTitle: '',
      department: 'Engineering',
      contactNo: '',
      photoUrl: '',
    },
    catalog: { ...DEFAULT_CATALOG_SETTINGS },
    notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
    exportDefaults: { ...DEFAULT_EXPORT_DEFAULTS },
    appearance: { ...DEFAULT_APPEARANCE_SETTINGS },
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
    catalog: mergeCatalogSettings(stored?.catalog),
    notifications: mergeNotificationSettings(stored?.notifications),
    exportDefaults: mergeExportDefaults(stored?.exportDefaults),
    appearance: mergeAppearanceSettings(stored?.appearance),
  };
}

export default function Settings() {
  const { user, refreshProfile, syncSession } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<SectionId>(() =>
    parseSectionId(searchParams.get('section')),
  );

  useEffect(() => {
    setActiveSection(parseSectionId(searchParams.get('section')));
  }, [searchParams]);
  const [saveMessage, setSaveMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
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
            contactNo: data.profile.contactNo ?? '',
            photoUrl: data.profile.photoUrl ?? '',
          },
          catalog: mergeCatalogSettings(data.catalog as Partial<CatalogSettingsData>),
          notifications: mergeNotificationSettings(
            data.notifications as Partial<NotificationSettingsData>,
          ),
          exportDefaults: mergeExportDefaults(
            data.exportDefaults as Partial<ExportDefaultsSettingsData>,
          ),
          appearance: mergeAppearanceSettings(
            data.appearance as Partial<AppearanceSettingsData>,
          ),
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
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await authApi.updateSettings({
        profile: {
          name: settings.profile.name,
          email: settings.profile.email,
          role: settings.profile.role,
          jobTitle: settings.profile.jobTitle,
          department: settings.profile.department,
          contactNo: settings.profile.contactNo,
          photoUrl: settings.profile.photoUrl ?? '',
        },
        catalog: settings.catalog,
        notifications: settings.notifications,
        exportDefaults: settings.exportDefaults,
        appearance: settings.appearance,
      });
      syncSession({ accessToken: updated.accessToken, user: updated.user });
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      setLastSavedSettings(settings);
      setSaveMessage('Settings saved successfully.');
      await refreshProfile();
      notifyProfileUpdated();
      notifyCatalogSettingsUpdated();
      notifyNotificationSettingsUpdated();
      notifyExportDefaultsUpdated();
      notifyAppearanceSettingsUpdated();
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

  const handleSecurityStatus = (message: string) => {
    setSaveMessage(message);
    window.setTimeout(() => setSaveMessage(''), 2500);
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
                          {profile.contactNo && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {profile.contactNo}
                            </p>
                          )}
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
                          <Label htmlFor="email">Login email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profile.email}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                profile: { ...prev.profile, email: e.target.value },
                              }))
                            }
                            autoComplete="email"
                          />
                          <p className="text-xs text-muted-foreground">
                            Used to sign in to the app.
                          </p>
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
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone no</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={profile.contactNo}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                profile: { ...prev.profile, contactNo: e.target.value },
                              }))
                            }
                            placeholder="Contact number"
                            autoComplete="tel"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeSection === 'catalog' && (
                  <CatalogSettings
                    value={catalog}
                    onChange={(next) =>
                      setSettings((prev) => ({
                        ...prev,
                        catalog: next,
                      }))
                    }
                  />
                )}

                {activeSection === 'notifications' && (
                  <NotificationSettings
                    value={settings.notifications}
                    onChange={(next) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: next,
                      }))
                    }
                  />
                )}

                {activeSection === 'export' && (
                  <ExportDefaultsSettingsPanel
                    value={settings.exportDefaults}
                    onChange={(next) =>
                      setSettings((prev) => ({
                        ...prev,
                        exportDefaults: next,
                      }))
                    }
                  />
                )}

                {activeSection === 'security' && (
                  <SecuritySettings onStatusMessage={handleSecurityStatus} />
                )}

                {activeSection === 'appearance' && (
                  <AppearanceSettingsPanel
                    value={settings.appearance}
                    onChange={(next) => {
                      setSettings((prev) => ({
                        ...prev,
                        appearance: next,
                      }));
                      applyAppearance(next);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
    </main>
  );
}
