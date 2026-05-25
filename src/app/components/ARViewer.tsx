import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Button } from './ui/button';
import {
  X,
  RotateCw,
  Maximize2,
  Minimize2,
  Move,
  Info,
  AlertCircle,
} from 'lucide-react';
import type { Part } from '../lib/mockData';
import { catalogApi } from '../lib/api/catalog';
import { mapApiPartToPart } from '../lib/mapPart';
import { loadPartModelAsset, type PartModelAsset } from '../lib/partModel';
import ArModelScene from './ArModelScene';

interface ArViewerLocationState {
  part?: Part;
}

export default function ARViewer() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ArViewerLocationState | null;
  const queryPartId = new URLSearchParams(location.search).get('partId');

  const [part, setPart] = useState<Part | null>(state?.part ?? null);
  const [modelAsset, setModelAsset] = useState<PartModelAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isPlaced, setIsPlaced] = useState(false);
  const [placeRequestId, setPlaceRequestId] = useState(0);
  const [arMode, setArMode] = useState<'ar' | 'preview'>('preview');
  const [arSessionActive, setArSessionActive] = useState(false);
  const [modelScale, setModelScale] = useState(1);
  const [modelRotation, setModelRotation] = useState(0);

  useEffect(() => {
    let active = true;
    let previousUrl: string | null = null;

    const init = async () => {
      setLoading(true);
      setLoadError('');
      setIsPlaced(false);
      setPlaceRequestId(0);
      setModelScale(1);
      setModelRotation(0);

      try {
        let resolvedPart = state?.part ?? null;
        if (!resolvedPart && queryPartId) {
          try {
            const apiPart = await catalogApi.getPart(queryPartId);
            resolvedPart = mapApiPartToPart(apiPart);
          } catch {
            resolvedPart = null;
          }
        }

        if (!active) return;
        if (!resolvedPart) {
          setPart(null);
          setModelAsset(null);
          setLoadError('No part selected. Open a part and choose View in AR.');
          return;
        }

        setPart(resolvedPart);
        const asset = await loadPartModelAsset(resolvedPart.id);
        if (!active) return;

        if (previousUrl) URL.revokeObjectURL(previousUrl);
        if (!asset) {
          setModelAsset(null);
          setLoadError('This part has no GLB or STL file for AR preview.');
        } else {
          previousUrl = asset.url;
          setModelAsset(asset);
        }
      } catch {
        if (active) setLoadError('Failed to load the 3D model.');
      } finally {
        if (active) setLoading(false);
      }
    };

    init();

    return () => {
      active = false;
      if (previousUrl) URL.revokeObjectURL(previousUrl);
    };
  }, [state?.part, queryPartId]);

  const handlePlace = () => {
    if (!modelAsset) return;
    setPlaceRequestId((id) => id + 1);
  };

  const dimensionsLabel = part
    ? `${part.dimensions.length} × ${part.dimensions.width} × ${part.dimensions.height} mm`
    : '—';

  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden">
      {modelAsset && (
        <ArModelScene
          modelUrl={modelAsset.url}
          format={modelAsset.format}
          placed={isPlaced}
          placeRequestId={placeRequestId}
          onPlaced={() => setIsPlaced(true)}
          scale={modelScale}
          rotationY={modelRotation}
          onModeChange={setArMode}
          onSessionChange={setArSessionActive}
          orbitEnabled={isPlaced && arMode === 'preview' && !arSessionActive}
        />
      )}

      <div className="relative z-10 h-screen flex flex-col pointer-events-none">
        <div className="p-4 flex items-center justify-between bg-card/80 backdrop-blur-md border-b border-border pointer-events-auto">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="tracking-tight shrink-0">AR Viewer</h2>
            <span className="text-sm text-muted-foreground truncate">
              {part?.name ?? 'Part preview'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/catalog')}
            className="p-2 rounded-lg hover:bg-accent/10 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
              <p className="text-sm text-muted-foreground">Loading AR model…</p>
            </div>
          )}

          {!loading && loadError && (
            <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-auto">
              <div className="max-w-md text-center space-y-4 p-6 rounded-xl bg-card/90 border border-border shadow-lg">
                <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
                <p className="text-sm text-muted-foreground">{loadError}</p>
                <Button onClick={() => navigate('/catalog')}>Back to Catalog</Button>
              </div>
            </div>
          )}

          {!loading && !loadError && modelAsset && !arSessionActive && !isPlaced && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center space-y-6 max-w-md px-4 pointer-events-auto">
                <>
                    <div className="relative">
                      <div className="w-32 h-32 mx-auto rounded-full border-4 border-primary/30 border-dashed flex items-center justify-center animate-pulse">
                        <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/50 flex items-center justify-center">
                          <Move className="w-12 h-12 text-primary" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 bg-card/90 backdrop-blur-md p-4 rounded-lg border border-border shadow-lg">
                      <h3 className="text-2xl tracking-tight">Surface Detection</h3>
                      <p className="text-sm text-muted-foreground">
                        {arMode === 'ar'
                          ? 'Start AR, point at a flat surface, then tap the screen to place the model.'
                          : 'Preview mode: place the model on the virtual floor, then rotate and scale.'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Model: {modelAsset.fileName} ({modelAsset.format.toUpperCase()})
                      </p>
                    </div>

                    <Button onClick={handlePlace} size="lg">
                      {arMode === 'ar' ? 'Start AR & Place' : 'Tap to Place Object'}
                    </Button>
                </>
              </div>
            </div>
          )}

          {isPlaced && arMode === 'preview' && !arSessionActive && (
            <div className="absolute top-20 left-4 right-4 pointer-events-none">
              <div className="max-w-sm p-3 rounded-lg bg-card/85 backdrop-blur-md border border-border shadow-lg">
                <p className="text-sm text-foreground font-medium">{part?.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dimensionsLabel} · {part?.weight ?? 0} kg
                </p>
                <p className="text-xs text-primary mt-2">
                  Drag to orbit the model · Buttons below scale and rotate
                </p>
              </div>
            </div>
          )}

          {isPlaced && modelAsset && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-auto">
              <button
                type="button"
                title="Rotate"
                onClick={() => setModelRotation((r) => r + Math.PI / 6)}
                className="p-4 rounded-full bg-card/80 backdrop-blur-md border border-border hover:bg-accent/10 transition-colors shadow-lg"
              >
                <RotateCw className="w-6 h-6 text-primary" />
              </button>
              <button
                type="button"
                title="Scale up"
                onClick={() => setModelScale((s) => Math.min(s * 1.15, 3))}
                className="p-4 rounded-full bg-card/80 backdrop-blur-md border border-border hover:bg-accent/10 transition-colors shadow-lg"
              >
                <Maximize2 className="w-6 h-6 text-primary" />
              </button>
              <button
                type="button"
                title="Scale down"
                onClick={() => setModelScale((s) => Math.max(s / 1.15, 0.3))}
                className="p-4 rounded-full bg-card/80 backdrop-blur-md border border-border hover:bg-accent/10 transition-colors shadow-lg"
              >
                <Minimize2 className="w-6 h-6 text-primary" />
              </button>
            </div>
          )}

          {arSessionActive && !isPlaced && (
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-card/90 border border-primary/30 text-xs text-muted-foreground pointer-events-none shadow-lg">
              Point at a flat surface, then tap the screen to place the part
            </div>
          )}

          <div className="absolute top-4 left-4 right-4 space-y-3 pointer-events-auto">
            {!isPlaced && !loadError && modelAsset && !arSessionActive && (
              <div className="p-3 rounded-lg bg-card/80 backdrop-blur-md border border-primary/30 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Info className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">AR Instructions</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {arMode === 'ar'
                        ? 'Use a phone or tablet with AR support (HTTPS). Point the camera at a flat surface and move slowly.'
                        : 'WebXR AR is unavailable here — using 3D preview placement on a virtual surface.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
