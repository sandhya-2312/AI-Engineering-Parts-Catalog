import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  FileBarChart,
  Download,
  CheckCircle2,
  FileType,
  Calendar,
  Package
} from 'lucide-react';
import { categories } from '../lib/mockData';

export default function Export() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<Array<{name: string, size: string, date: string}>>([
    { name: 'Parts_Catalog_2024-05.pdf', size: '24.5 MB', date: '2024-05-10' },
    { name: 'Bearings_Catalog_2024-04.pdf', size: '8.2 MB', date: '2024-04-15' },
    { name: 'Full_Inventory_2024-03.pdf', size: '45.1 MB', date: '2024-03-20' },
  ]);

  const toggleCategory = (category: string) => {
    if (category === 'All Categories') {
      if (selectedCategories.length === categories.length - 1) {
        setSelectedCategories([]);
      } else {
        setSelectedCategories(categories.filter(c => c !== 'All Categories'));
      }
    } else {
      setSelectedCategories(prev =>
        prev.includes(category)
          ? prev.filter(c => c !== category)
          : [...prev, category]
      );
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedFiles(prev => [
        {
          name: `Custom_Catalog_${new Date().toISOString().split('T')[0]}.pdf`,
          size: '18.7 MB',
          date: new Date().toISOString().split('T')[0]
        },
        ...prev
      ]);
      setIsGenerating(false);
      setSelectedCategories([]);
    }, 3000);
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <FileBarChart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl tracking-tight">Export Catalog</h2>
              <p className="text-muted-foreground">Generate PDF catalogs for offline use</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle>Configure Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm text-foreground">Select Categories</h3>
                    <Badge variant="outline">
                      {selectedCategories.length} selected
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((category) => {
                      const isAllCategories = category === 'All Categories';
                      const isSelected = isAllCategories
                        ? selectedCategories.length === categories.length - 1
                        : selectedCategories.includes(category);

                      return (
                        <button
                          key={category}
                          onClick={() => toggleCategory(category)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-foreground">{category}</span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm text-foreground">Export Options</h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/5 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        id="include-images"
                        defaultChecked
                        className="w-4 h-4 rounded border-input bg-input-background text-primary focus:ring-2 focus:ring-ring"
                      />
                      <label htmlFor="include-images" className="text-sm text-foreground flex-1 cursor-pointer">
                        Include Part Images
                      </label>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/5 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        id="include-specs"
                        defaultChecked
                        className="w-4 h-4 rounded border-input bg-input-background text-primary focus:ring-2 focus:ring-ring"
                      />
                      <label htmlFor="include-specs" className="text-sm text-foreground flex-1 cursor-pointer">
                        Include Technical Specifications
                      </label>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/5 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        id="include-drawings"
                        className="w-4 h-4 rounded border-input bg-input-background text-primary focus:ring-2 focus:ring-ring"
                      />
                      <label htmlFor="include-drawings" className="text-sm text-foreground flex-1 cursor-pointer">
                        Include Engineering Drawings
                      </label>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/5 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        id="include-pricing"
                        className="w-4 h-4 rounded border-input bg-input-background text-primary focus:ring-2 focus:ring-ring"
                      />
                      <label htmlFor="include-pricing" className="text-sm text-foreground flex-1 cursor-pointer">
                        Include Pricing Information
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={selectedCategories.length === 0 || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <FileBarChart className="w-4 h-4" />
                      Generate Catalog PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Export History</CardTitle>
                  <Badge variant="outline">{generatedFiles.length} files</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generatedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-border bg-muted/20 hover:border-primary/30 transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform">
                          <FileType className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{file.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {file.size}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {file.date}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <FileBarChart className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="tracking-tight">Automated Export Scheduling</h3>
                  <p className="text-sm text-muted-foreground">
                    Set up recurring catalog exports to automatically generate and distribute PDF catalogs on a schedule. Perfect for monthly inventory updates and partner distribution.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Configure Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
    </main>
  );
}
