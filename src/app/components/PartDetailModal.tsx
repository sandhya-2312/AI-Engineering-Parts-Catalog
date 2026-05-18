import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  X,
  Download,
  Share2,
  Star,
  Eye,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize
} from 'lucide-react';
import { Part } from '../lib/mockData';

interface PartDetailModalProps {
  part: Part;
  onClose: () => void;
}

export default function PartDetailModal({ part, onClose }: PartDetailModalProps) {
  const navigate = useNavigate();

  const relatedParts = [
    { name: 'Similar Component A', id: 'P-101' },
    { name: 'Alternative Part B', id: 'P-102' },
    { name: 'Compatible Item C', id: 'P-103' },
  ];

  const revisionHistory = [
    { revision: 'Rev D', date: '2024-05-01', changes: 'Optimized dimensions' },
    { revision: 'Rev C', date: '2024-03-15', changes: 'Material update' },
    { revision: 'Rev B', date: '2024-01-20', changes: 'Minor adjustments' },
    { revision: 'Rev A', date: '2023-11-10', changes: 'Initial release' },
  ];

  const getAvailabilityVariant = (availability: string): "default" | "secondary" | "destructive" | "outline" => {
    if (availability === 'In Stock') return 'secondary';
    if (availability === 'Low Stock') return 'outline';
    return 'destructive';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-6xl max-h-[90vh] bg-card rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">
              {part.thumbnail}
            </div>
            <div>
              <h2 className="text-2xl tracking-tight">{part.name}</h2>
              <p className="text-sm text-muted-foreground">{part.partNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-2 gap-6 p-6">
            <div className="space-y-4">
              <div className="aspect-square rounded-lg border border-border bg-gradient-to-br from-muted/50 to-background relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--engineering-grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--engineering-grid)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <div className="text-9xl animate-pulse">{part.thumbnail}</div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border hover:bg-accent/10 transition-colors">
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border hover:bg-accent/10 transition-colors">
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border hover:bg-accent/10 transition-colors">
                      <ZoomOut className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="p-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border hover:bg-accent/10 transition-colors">
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => { navigate('/ar-viewer'); onClose(); }} className="flex-1">
                  <Eye className="w-4 h-4" />
                  View in AR
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4" />
                  Download STL
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                  STEP File
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                  PDF Datasheet
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                  Share Part
                </Button>
                <Button variant="outline" size="sm">
                  <Star className="w-4 h-4" />
                  Add to Favorites
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="tracking-tight text-foreground">Part Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Part Number</span>
                    <span className="text-sm text-foreground">{part.partNumber}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="text-sm text-foreground">{part.category}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Material</span>
                    <span className="text-sm text-foreground">{part.material}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Manufacturer</span>
                    <span className="text-sm text-foreground">{part.manufacturer}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Dimensions</span>
                    <span className="text-sm text-foreground">
                      {part.dimensions.length} × {part.dimensions.width} × {part.dimensions.height} mm
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Weight</span>
                    <span className="text-sm text-foreground">{part.weight} kg</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Availability</span>
                    <Badge variant={getAvailabilityVariant(part.availability)}>
                      {part.availability}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Downloads</span>
                    <span className="text-sm text-foreground">{part.downloads.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="tracking-tight text-foreground">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{part.description}</p>
              </div>

              <div className="space-y-3">
                <h3 className="tracking-tight text-foreground">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {part.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="tracking-tight text-foreground">Revision History</h3>
                <div className="space-y-2">
                  {revisionHistory.map((rev, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/20 border border-border">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm text-foreground">{rev.revision}</span>
                        <span className="text-xs text-muted-foreground">{rev.date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{rev.changes}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="tracking-tight text-foreground">Related Parts</h3>
                <div className="space-y-2">
                  {relatedParts.map((relatedPart, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/20 border border-border hover:border-primary/30 transition-colors cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-foreground">{relatedPart.name}</span>
                        <span className="text-xs text-muted-foreground">{relatedPart.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
