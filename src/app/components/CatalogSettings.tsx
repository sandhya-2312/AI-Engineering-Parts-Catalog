import { Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type { CatalogSettings as CatalogSettingsData } from '../lib/catalogSettings';

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

type CatalogSettingsProps = {
  value: CatalogSettingsData;
  onChange: (catalog: CatalogSettingsData) => void;
};

export default function CatalogSettings({ value, onChange }: CatalogSettingsProps) {
  const update = (patch: Partial<CatalogSettingsData>) => {
    onChange({ ...value, ...patch });
  };

  return (
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
              value={value.itemsPerPage}
              onValueChange={(v) => update({ itemsPerPage: v })}
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
              value={value.unitSystem}
              onValueChange={(v) => update({ unitSystem: v as CatalogSettingsData['unitSystem'] })}
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
              value={value.defaultView}
              onValueChange={(v) => update({ defaultView: v as CatalogSettingsData['defaultView'] })}
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
              checked={value.showThumbnails}
              onCheckedChange={(v) => update({ showThumbnails: v })}
            />
          </SettingRow>

          <SettingRow
            label="Show part numbers"
            description="Display part numbers alongside names"
          >
            <Switch
              checked={value.showPartNumbers}
              onCheckedChange={(v) => update({ showPartNumbers: v })}
            />
          </SettingRow>

          <SettingRow
            label="AR preview"
            description="Enable 3D AR viewer for compatible parts"
          >
            <Switch
              checked={value.enableARPreview}
              onCheckedChange={(v) => update({ enableARPreview: v })}
            />
          </SettingRow>
        </div>
      </CardContent>
    </Card>
  );
}
