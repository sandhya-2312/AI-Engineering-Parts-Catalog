import { Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type {
  AccentColor,
  AppearanceSettings as AppearanceSettingsData,
} from '../lib/appearanceSettings';

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

type AppearanceSettingsProps = {
  value: AppearanceSettingsData;
  onChange: (appearance: AppearanceSettingsData) => void;
};

export default function AppearanceSettings({ value, onChange }: AppearanceSettingsProps) {
  const update = (patch: Partial<AppearanceSettingsData>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <Card className="border border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Appearance
        </CardTitle>
        <CardDescription>Customize the look and feel of EngineerX</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          <SettingRow label="Theme" description="Interface color scheme">
            <span className="text-sm text-foreground w-32 text-right">Light</span>
          </SettingRow>

          <SettingRow
            label="Accent color"
            description="Primary highlight color across the app"
          >
            <Select
              value={value.accentColor}
              onValueChange={(v) => update({ accentColor: v as AccentColor })}
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
              checked={value.compactMode}
              onCheckedChange={(v) => update({ compactMode: v })}
            />
          </SettingRow>

          <SettingRow
            label="Animations"
            description="Enable smooth transitions and micro-interactions"
          >
            <Switch
              checked={value.showAnimations}
              onCheckedChange={(v) => update({ showAnimations: v })}
            />
          </SettingRow>
        </div>
      </CardContent>
    </Card>
  );
}
