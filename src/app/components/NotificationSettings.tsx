import { Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import type { NotificationSettings as NotificationSettingsData } from '../lib/notificationSettings';

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

type NotificationSettingsProps = {
  value: NotificationSettingsData;
  onChange: (notifications: NotificationSettingsData) => void;
};

export default function NotificationSettings({ value, onChange }: NotificationSettingsProps) {
  const update = (patch: Partial<NotificationSettingsData>) => {
    onChange({ ...value, ...patch });
  };

  return (
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
              checked={value.newParts}
              onCheckedChange={(v) => update({ newParts: v })}
            />
          </SettingRow>

          <SettingRow
            label="Export complete"
            description="When PDF catalog exports finish generating"
          >
            <Switch
              checked={value.exportComplete}
              onCheckedChange={(v) => update({ exportComplete: v })}
            />
          </SettingRow>

          <SettingRow
            label="Catalog updates"
            description="Changes to existing part specifications"
          >
            <Switch
              checked={value.catalogUpdates}
              onCheckedChange={(v) => update({ catalogUpdates: v })}
            />
          </SettingRow>

          <SettingRow
            label="Weekly digest"
            description="Summary of catalog activity and popular parts"
          >
            <Switch
              checked={value.weeklyDigest}
              onCheckedChange={(v) => update({ weeklyDigest: v })}
            />
          </SettingRow>

          <SettingRow
            label="Team activity"
            description="When colleagues download or favorite parts"
          >
            <Switch
              checked={value.teamActivity}
              onCheckedChange={(v) => update({ teamActivity: v })}
            />
          </SettingRow>

          <SettingRow
            label="Email alerts"
            description="Receive notifications via email"
          >
            <Switch
              checked={value.emailAlerts}
              onCheckedChange={(v) => update({ emailAlerts: v })}
            />
          </SettingRow>
        </div>
      </CardContent>
    </Card>
  );
}
