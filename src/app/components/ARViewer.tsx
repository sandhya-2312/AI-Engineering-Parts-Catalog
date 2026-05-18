import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import {
  X,
  RotateCw,
  Maximize2,
  Minimize2,
  Move,
  Info
} from 'lucide-react';

export default function ARViewer() {
  const navigate = useNavigate();
  const [isPlaced, setIsPlaced] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background to-primary/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--engineering-glow),transparent_50%)] opacity-30" />

      <div className="relative z-10 h-screen flex flex-col">
        <div className="p-4 flex items-center justify-between bg-card/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="tracking-tight">AR Viewer</h2>
            <span className="text-sm text-muted-foreground">Precision Bearing Assembly</span>
          </div>
          <button
            onClick={() => navigate('/catalog')}
            className="p-2 rounded-lg hover:bg-accent/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md px-4">
              {!isPlaced ? (
                <>
                  <div className="relative">
                    <div className="w-32 h-32 mx-auto rounded-full border-4 border-primary/30 border-dashed flex items-center justify-center animate-pulse">
                      <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/50 flex items-center justify-center">
                        <Move className="w-12 h-12 text-primary" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl tracking-tight">Surface Detection</h3>
                    <p className="text-sm text-muted-foreground">
                      Move your device to detect a flat surface, then tap to place the 3D object
                    </p>
                  </div>

                  <Button onClick={() => setIsPlaced(true)} size="lg">
                    Tap to Place Object
                  </Button>
                </>
              ) : (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent rounded-lg" />
                    <div className="relative p-8 rounded-lg border border-primary/30 bg-card/50 backdrop-blur-sm">
                      <div className="text-9xl animate-pulse">🔩</div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-2 bg-black/20 rounded-full blur-sm" />
                    </div>

                    <div className="absolute -top-2 -right-2 p-2 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm">
                      <Info className="w-4 h-4 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-3 bg-card/80 backdrop-blur-md p-4 rounded-lg border border-border">
                    <p className="text-sm text-foreground">Precision Bearing Assembly</p>
                    <p className="text-xs text-muted-foreground">
                      Dimensions: 50 × 50 × 20 mm | Weight: 0.45 kg
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {isPlaced && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
              <button className="p-4 rounded-full bg-card/80 backdrop-blur-md border border-border hover:bg-accent/10 transition-colors shadow-lg">
                <RotateCw className="w-6 h-6 text-primary" />
              </button>
              <button className="p-4 rounded-full bg-card/80 backdrop-blur-md border border-border hover:bg-accent/10 transition-colors shadow-lg">
                <Maximize2 className="w-6 h-6 text-primary" />
              </button>
              <button className="p-4 rounded-full bg-card/80 backdrop-blur-md border border-border hover:bg-accent/10 transition-colors shadow-lg">
                <Minimize2 className="w-6 h-6 text-primary" />
              </button>
            </div>
          )}

          <div className="absolute top-4 left-4 right-4 space-y-3">
            {!isPlaced && (
              <div className="p-3 rounded-lg bg-card/80 backdrop-blur-md border border-primary/30 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Info className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">AR Instructions</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Point your camera at a flat surface and move slowly until the surface is detected
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
