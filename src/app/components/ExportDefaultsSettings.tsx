import { FileBarChart } from 'lucide-react';
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
  ExportDefaultsSettings as ExportDefaultsSettingsData,
  PageOrientation,
  PaperSize,
} from '../lib/exportDefaultsSettings';

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

type ExportDefaultsSettingsProps = {
  value: ExportDefaultsSettingsData;
  onChange: (exportDefaults: ExportDefaultsSettingsData) => void;
};

export default function ExportDefaultsSettings({
  value,
  onChange,
}: ExportDefaultsSettingsProps) {
  const update = (patch: Partial<ExportDefaultsSettingsData>) => {
    onChange({ ...value, ...patch });
  };

  return (
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
              checked={value.includeImages}
              onCheckedChange={(v) => update({ includeImages: v })}
            />
          </SettingRow>

          <SettingRow
            label="Include specifications"
            description="Technical specs and dimensions"
          >
            <Switch
              checked={value.includeSpecs}
              onCheckedChange={(v) => update({ includeSpecs: v })}
            />
          </SettingRow>

          <SettingRow
            label="Include engineering drawings"
            description="CAD drawings and schematics"
          >
            <Switch
              checked={value.includeDrawings}
              onCheckedChange={(v) => update({ includeDrawings: v })}
            />
          </SettingRow>

          <SettingRow
            label="Include pricing"
            description="Cost and supplier pricing data"
          >
            <Switch
              checked={value.includePricing}
              onCheckedChange={(v) => update({ includePricing: v })}
            />
          </SettingRow>

          <SettingRow label="Paper size" description="Default PDF page format">
            <Select
              value={value.paperSize}
              onValueChange={(v) => update({ paperSize: v as PaperSize })}
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
              value={value.orientation}
              onValueChange={(v) => update({ orientation: v as PageOrientation })}
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
  );
}
