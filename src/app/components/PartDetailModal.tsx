import { useEffect, useRef, useState } from 'react';
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
  Maximize,
  Pencil,
  Upload,
} from 'lucide-react';
import type { ApiPartFile } from '../lib/api/types';
import {
  findPartFile,
  isGlbPartFile,
  isImagePartFile,
  isPdfPartFile,
  isStepPartFile,
  isStlPartFile,
} from '../lib/partModel';
import { Part } from '../lib/mockData';
import { getStoredToken } from '../lib/api/client';
import { Input } from './ui/input';
import { catalogApi } from '../lib/api/catalog';
import { partsApi } from '../lib/api/parts';
import { isApiError } from '../context/AuthContext';
import type { LookupEntity } from '../lib/api/types';
import { availabilityToApi, mapApiPartToPart } from '../lib/mapPart';
import { useCatalogSettings } from '../hooks/useCatalogSettings';
import PartModelViewer, { type PartModelViewerControls } from './PartModelViewer';
import { loadPartModelAsset, type PartModelAsset } from '../lib/partModel';
import { resolveApiFileUrl } from '../lib/resolveFileUrl';

interface PartDetailModalProps {
  part: Part;
  onClose: () => void;
  onPartUpdated?: () => void;
}

const MANUAL_OPTION = '__manual__';

function isLikelyImageThumbnail(value: string) {
  return /^(https?:|data:image\/|blob:|\/|\.\/)/i.test(value)
    || /\.(png|jpe?g|gif|webp|svg)$/i.test(value);
}

function resolveThumbnailUrl(value: string) {
  if (/^(https?:|data:image\/|blob:)/i.test(value)) return value;
  return resolveApiFileUrl(value);
}

export default function PartDetailModal({ part, onClose, onPartUpdated }: PartDetailModalProps) {
  const navigate = useNavigate();
  const catalogPrefs = useCatalogSettings();
  const [imageFailed, setImageFailed] = useState(false);
  const [resolvedImageSrc, setResolvedImageSrc] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [categories, setCategories] = useState<LookupEntity[]>([]);
  const [materials, setMaterials] = useState<LookupEntity[]>([]);
  const [manufacturers, setManufacturers] = useState<LookupEntity[]>([]);
  const [name, setName] = useState(part.name);
  const [partNumber, setPartNumber] = useState(part.partNumber);
  const [description, setDescription] = useState(part.description);
  const [lengthMm, setLengthMm] = useState(String(part.dimensions.length || 0));
  const [widthMm, setWidthMm] = useState(String(part.dimensions.width || 0));
  const [heightMm, setHeightMm] = useState(String(part.dimensions.height || 0));
  const [weightKg, setWeightKg] = useState(String(part.weight || 0));
  const [availability, setAvailability] = useState<Part['availability']>(part.availability);
  const [categoryId, setCategoryId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [manufacturerId, setManufacturerId] = useState('');
  const [manualCategory, setManualCategory] = useState('');
  const [manualMaterial, setManualMaterial] = useState('');
  const [manualManufacturer, setManualManufacturer] = useState('');
  const [relatedParts, setRelatedParts] = useState<Part[]>([]);
  const [modelAsset, setModelAsset] = useState<PartModelAsset | null>(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [existingFiles, setExistingFiles] = useState<ApiPartFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [partImage, setPartImage] = useState<File | null>(null);
  const [glbFile, setGlbFile] = useState<File | null>(null);
  const [stlFile, setStlFile] = useState<File | null>(null);
  const [stepFile, setStepFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const viewerControlsRef = useRef<PartModelViewerControls | null>(null);
  const canRenderImage = isLikelyImageThumbnail(part.thumbnail) && !imageFailed;
  const isProtectedApiFile = part.thumbnail.startsWith('/files/');

  useEffect(() => {
    if (!canRenderImage) {
      setResolvedImageSrc(null);
      return;
    }

    let objectUrl: string | null = null;
    let isActive = true;

    const loadImage = async () => {
      if (isProtectedApiFile) {
        try {
          const token = getStoredToken();
          const response = await fetch(resolveThumbnailUrl(part.thumbnail), {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (!response.ok) throw new Error('Failed to load thumbnail');
          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);
          if (isActive) setResolvedImageSrc(objectUrl);
        } catch {
          if (isActive) setImageFailed(true);
        }
        return;
      }

      if (isActive) setResolvedImageSrc(resolveThumbnailUrl(part.thumbnail));
    };

    setImageFailed(false);
    loadImage();

    return () => {
      isActive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [part.thumbnail, canRenderImage, isProtectedApiFile]);

  useEffect(() => {
    let isActive = true;
    viewerControlsRef.current = null;
    setModelAsset(null);
    setModelLoading(true);

    loadPartModelAsset(part.id)
      .then((asset) => {
        if (isActive) setModelAsset(asset);
      })
      .catch(() => {
        if (isActive) setModelAsset(null);
      })
      .finally(() => {
        if (isActive) setModelLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [part.id]);

  useEffect(() => {
    return () => {
      if (modelAsset?.url) URL.revokeObjectURL(modelAsset.url);
    };
  }, [modelAsset?.url]);

  useEffect(() => {
    viewerControlsRef.current = null;
  }, [modelAsset?.url]);

  useEffect(() => {
    catalogApi
      .filters()
      .then((filters) => {
        const nextCategories = filters.categories.filter((item) => item.id !== '');
        const nextMaterials = filters.materials.filter((item) => item.id !== '');
        const nextManufacturers = filters.manufacturers.filter((item) => item.id !== '');
        setCategories(nextCategories);
        setMaterials(nextMaterials);
        setManufacturers(nextManufacturers);

        const existingCategory = nextCategories.find((item) => item.name === part.category);
        const existingMaterial = nextMaterials.find((item) => item.name === part.material);
        const existingManufacturer = nextManufacturers.find((item) => item.name === part.manufacturer);

        setCategoryId(existingCategory?.id ?? (part.category && part.category !== '—' ? MANUAL_OPTION : ''));
        setMaterialId(existingMaterial?.id ?? (part.material && part.material !== '—' ? MANUAL_OPTION : ''));
        setManufacturerId(
          existingManufacturer?.id ?? (part.manufacturer && part.manufacturer !== '—' ? MANUAL_OPTION : ''),
        );

        setManualCategory(existingCategory ? '' : part.category === '—' ? '' : part.category);
        setManualMaterial(existingMaterial ? '' : part.material === '—' ? '' : part.material);
        setManualManufacturer(existingManufacturer ? '' : part.manufacturer === '—' ? '' : part.manufacturer);
      })
      .catch(() => {});
  }, [part.category, part.material, part.manufacturer]);

  useEffect(() => {
    const searchSeed = part.category !== '—' ? part.category : part.material !== '—' ? part.material : part.name;
    catalogApi
      .listParts({ page: 1, limit: 10, search: searchSeed })
      .then((response) => {
        const mapped = response.data.map((item, index) => mapApiPartToPart(item, index));
        const filtered = mapped.filter((item) => item.id !== part.id);
        const sameCategory = filtered.filter((item) => item.category === part.category);
        const sameMaterial = filtered.filter((item) => item.material === part.material);
        const merged = [...sameCategory, ...sameMaterial, ...filtered].filter(
          (item, index, arr) => arr.findIndex((p) => p.id === item.id) === index,
        );
        setRelatedParts(merged.slice(0, 3));
      })
      .catch(() => setRelatedParts([]));
  }, [part.id, part.name, part.category, part.material]);

  useEffect(() => {
    let active = true;
    setFilesLoading(true);
    partsApi
      .listFiles(part.id)
      .then((files) => {
        if (active) setExistingFiles(files);
      })
      .catch(() => {
        if (active) setExistingFiles([]);
      })
      .finally(() => {
        if (active) setFilesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [part.id]);

  const currentImageFile = findPartFile(existingFiles, isImagePartFile);
  const currentGlbFile = findPartFile(existingFiles, isGlbPartFile);
  const currentStlFile = findPartFile(existingFiles, isStlPartFile);
  const currentStepFile = findPartFile(existingFiles, isStepPartFile);
  const currentPdfFile = findPartFile(existingFiles, isPdfPartFile);

  const resetPendingFiles = () => {
    setPartImage(null);
    setGlbFile(null);
    setStlFile(null);
    setStepFile(null);
    setPdfFile(null);
  };

  const handleCancelEdit = () => {
    resetPendingFiles();
    setIsEditing(false);
    setSaveError('');
  };

  const reloadModelPreview = async () => {
    if (modelAsset?.url) URL.revokeObjectURL(modelAsset.url);
    setModelLoading(true);
    try {
      const asset = await loadPartModelAsset(part.id);
      setModelAsset(asset);
    } catch {
      setModelAsset(null);
    } finally {
      setModelLoading(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toISOString().slice(0, 10);
  };

  const revisionHistory = [
    {
      revision: part.revision && part.revision !== '—' ? part.revision : 'Current',
      date: formatDate(part.updatedAt || part.createdAt),
      changes: 'Latest saved version',
    },
    ...(part.createdAt && part.updatedAt && part.createdAt !== part.updatedAt
      ? [{ revision: 'Initial', date: formatDate(part.createdAt), changes: 'Initial release' }]
      : []),
  ];

  const handleSave = async () => {
    setSaveError('');
    setIsSaving(true);
    try {
      let nextCategoryId = categoryId || null;
      let nextMaterialId = materialId || null;
      let nextManufacturerId = manufacturerId || null;

      if (categoryId === MANUAL_OPTION) {
        const value = manualCategory.trim();
        if (!value) throw new Error('Category is required.');
        const existing = categories.find((item) => item.name.toLowerCase() === value.toLowerCase());
        nextCategoryId = existing?.id ?? (await catalogApi.createCategory({ name: value })).id;
      }

      if (materialId === MANUAL_OPTION) {
        const value = manualMaterial.trim();
        if (!value) throw new Error('Material is required.');
        const existing = materials.find((item) => item.name.toLowerCase() === value.toLowerCase());
        nextMaterialId = existing?.id ?? (await catalogApi.createMaterial({ name: value })).id;
      }

      if (manufacturerId === MANUAL_OPTION) {
        const value = manualManufacturer.trim();
        if (!value) {
          nextManufacturerId = null;
        } else {
          const existing = manufacturers.find((item) => item.name.toLowerCase() === value.toLowerCase());
          nextManufacturerId = existing?.id ?? (await catalogApi.createManufacturer({ name: value })).id;
        }
      }

      await partsApi.update(part.partNumber, {
        name: name.trim(),
        partNumber: partNumber.trim(),
        categoryId: nextCategoryId,
        materialId: nextMaterialId,
        manufacturerId: nextManufacturerId,
        lengthMm: Number.isNaN(Number(lengthMm)) ? 0 : Number(lengthMm),
        widthMm: Number.isNaN(Number(widthMm)) ? 0 : Number(widthMm),
        heightMm: Number.isNaN(Number(heightMm)) ? 0 : Number(heightMm),
        weightKg: Number.isNaN(Number(weightKg)) ? 0 : Number(weightKg),
        availability: availabilityToApi(availability),
        description: description.trim() || undefined,
      });

      const pendingFiles = [partImage, glbFile, stlFile, stepFile, pdfFile].filter(Boolean) as File[];
      for (const file of pendingFiles) {
        await partsApi.uploadFile(part.id, file);
      }

      if (partImage || glbFile || stlFile) {
        await reloadModelPreview();
      }

      resetPendingFiles();
      onPartUpdated?.();
      onClose();
    } catch (error) {
      setSaveError(isApiError(error) ? error.message : (error as Error).message || 'Failed to update part.');
    } finally {
      setIsSaving(false);
    }
  };

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
            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl overflow-hidden">
              {canRenderImage && resolvedImageSrc ? (
                <img
                  src={resolvedImageSrc}
                  alt={`${part.name} thumbnail`}
                  className="w-full h-full object-cover"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <span>{part.thumbnail}</span>
              )}
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
              <div
                id="part-model-preview"
                className="aspect-square rounded-lg border border-border bg-gradient-to-br from-muted/50 to-background relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--engineering-grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--engineering-grid)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  {modelAsset ? (
                    <PartModelViewer
                      modelUrl={modelAsset.url}
                      format={modelAsset.format}
                      className="w-full h-full"
                      onReady={(controls) => {
                        viewerControlsRef.current = controls;
                      }}
                    />
                  ) : modelLoading ? (
                    <p className="text-sm text-muted-foreground">Loading 3D model…</p>
                  ) : canRenderImage && resolvedImageSrc ? (
                    <img
                      src={resolvedImageSrc}
                      alt={`${part.name} preview`}
                      className="w-full h-full object-contain"
                      onError={() => setImageFailed(true)}
                    />
                  ) : (
                    <div className="text-center px-6 space-y-2">
                      <p className="text-sm text-muted-foreground">No 3D model (GLB / STL) attached</p>
                      <div className="text-6xl">{part.thumbnail}</div>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between pointer-events-none">
                  <div className="flex gap-2 pointer-events-auto">
                    <button
                      type="button"
                      title="Reset view"
                      disabled={!modelAsset}
                      onClick={(e) => {
                        e.stopPropagation();
                        viewerControlsRef.current?.resetView();
                      }}
                      className="p-2 rounded-lg bg-card/90 backdrop-blur-sm border border-border hover:bg-accent/10 transition-colors disabled:opacity-40 shadow-sm"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Zoom in"
                      disabled={!modelAsset}
                      onClick={(e) => {
                        e.stopPropagation();
                        viewerControlsRef.current?.zoomIn();
                      }}
                      className="p-2 rounded-lg bg-card/90 backdrop-blur-sm border border-border hover:bg-accent/10 transition-colors disabled:opacity-40 shadow-sm"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Zoom out"
                      disabled={!modelAsset}
                      onClick={(e) => {
                        e.stopPropagation();
                        viewerControlsRef.current?.zoomOut();
                      }}
                      className="p-2 rounded-lg bg-card/90 backdrop-blur-sm border border-border hover:bg-accent/10 transition-colors disabled:opacity-40 shadow-sm"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    title="Full screen"
                    disabled={!modelAsset}
                    onClick={(e) => {
                      e.stopPropagation();
                      viewerControlsRef.current?.toggleFullscreen();
                    }}
                    className="p-2 rounded-lg bg-card/90 backdrop-blur-sm border border-border hover:bg-accent/10 transition-colors disabled:opacity-40 shadow-sm pointer-events-auto"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/20">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Replace files</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload only the files you want to replace. Existing files stay until you upload a new one.
                    </p>
                  </div>

                  {filesLoading ? (
                    <p className="text-xs text-muted-foreground">Loading attached files…</p>
                  ) : (
                    <div className="space-y-3">
                      <FileReuploadField
                        id="edit-part-image"
                        label="Part image"
                        currentName={currentImageFile?.originalName}
                        pendingFile={partImage}
                        accept="image/*"
                        onSelect={setPartImage}
                        onClear={() => setPartImage(null)}
                      />
                      <FileReuploadField
                        id="edit-glb"
                        label="GLB model (3D & AR)"
                        currentName={currentGlbFile?.originalName}
                        pendingFile={glbFile}
                        accept=".glb,model/gltf-binary"
                        onSelect={setGlbFile}
                        onClear={() => setGlbFile(null)}
                      />
                      <FileReuploadField
                        id="edit-stl"
                        label="STL file"
                        currentName={currentStlFile?.originalName}
                        pendingFile={stlFile}
                        accept=".stl,model/stl"
                        onSelect={setStlFile}
                        onClear={() => setStlFile(null)}
                      />
                      <FileReuploadField
                        id="edit-step"
                        label="STEP file"
                        currentName={currentStepFile?.originalName}
                        pendingFile={stepFile}
                        accept=".step,.stp"
                        onSelect={setStepFile}
                        onClear={() => setStepFile(null)}
                      />
                      <FileReuploadField
                        id="edit-pdf"
                        label="PDF datasheet"
                        currentName={currentPdfFile?.originalName}
                        pendingFile={pdfFile}
                        accept=".pdf,application/pdf"
                        onSelect={setPdfFile}
                        onClear={() => setPdfFile(null)}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {catalogPrefs.enableARPreview && (
                      <Button
                        onClick={() => {
                          navigate(`/ar-viewer?partId=${encodeURIComponent(part.id)}`, {
                            state: { part },
                          });
                          onClose();
                        }}
                        className="flex-1"
                        disabled={!modelAsset && !modelLoading}
                      >
                        <Eye className="w-4 h-4" />
                        View in AR
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className={catalogPrefs.enableARPreview ? 'flex-1' : 'w-full'}
                      onClick={() => {
                        if (currentStlFile) {
                          partsApi.downloadFile(currentStlFile.id, currentStlFile.originalName);
                        }
                      }}
                      disabled={!currentStlFile}
                    >
                      <Download className="w-4 h-4" />
                      Download STL
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (currentStepFile) partsApi.downloadFile(currentStepFile.id, currentStepFile.originalName);
                      }}
                      disabled={!currentStepFile}
                    >
                      <Download className="w-4 h-4" />
                      STEP File
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (currentPdfFile) partsApi.downloadFile(currentPdfFile.id, currentPdfFile.originalName);
                      }}
                      disabled={!currentPdfFile}
                    >
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
                </>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="tracking-tight text-foreground">Part Details</h3>
                  {!isEditing ? (
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  )}
                </div>
                {saveError && (
                  <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                    {saveError}
                  </p>
                )}
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border gap-3">
                    <span className="text-sm text-muted-foreground">Part Name</span>
                    {isEditing ? (
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-8 w-56 text-right"
                      />
                    ) : (
                      <span className="text-sm text-foreground">{part.name}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Part Number</span>
                    {isEditing ? (
                      <Input
                        value={partNumber}
                        onChange={(e) => setPartNumber(e.target.value)}
                        className="h-8 w-56 text-right"
                      />
                    ) : (
                      <span className="text-sm text-foreground">{part.partNumber}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Category</span>
                    {isEditing ? (
                      <div className="w-56 space-y-2">
                        <select
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-md border border-input bg-input-background text-sm"
                        >
                          {categories.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                          <option value={MANUAL_OPTION}>+ Add manually</option>
                        </select>
                        {categoryId === MANUAL_OPTION && (
                          <Input
                            value={manualCategory}
                            onChange={(e) => setManualCategory(e.target.value)}
                            placeholder="New category"
                            className="h-8"
                          />
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-foreground">{part.category}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Material</span>
                    {isEditing ? (
                      <div className="w-56 space-y-2">
                        <select
                          value={materialId}
                          onChange={(e) => setMaterialId(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-md border border-input bg-input-background text-sm"
                        >
                          {materials.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                          <option value={MANUAL_OPTION}>+ Add manually</option>
                        </select>
                        {materialId === MANUAL_OPTION && (
                          <Input
                            value={manualMaterial}
                            onChange={(e) => setManualMaterial(e.target.value)}
                            placeholder="New material"
                            className="h-8"
                          />
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-foreground">{part.material}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Manufacturer</span>
                    {isEditing ? (
                      <div className="w-56 space-y-2">
                        <select
                          value={manufacturerId}
                          onChange={(e) => setManufacturerId(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-md border border-input bg-input-background text-sm"
                        >
                          <option value="">None</option>
                          {manufacturers.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                          <option value={MANUAL_OPTION}>+ Add manually</option>
                        </select>
                        {manufacturerId === MANUAL_OPTION && (
                          <Input
                            value={manualManufacturer}
                            onChange={(e) => setManualManufacturer(e.target.value)}
                            placeholder="New manufacturer"
                            className="h-8"
                          />
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-foreground">{part.manufacturer}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Dimensions</span>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={lengthMm}
                          onChange={(e) => setLengthMm(e.target.value)}
                          type="number"
                          min="0"
                          step="0.01"
                          className="h-8 w-20 text-right"
                        />
                        <span className="text-xs text-muted-foreground">x</span>
                        <Input
                          value={widthMm}
                          onChange={(e) => setWidthMm(e.target.value)}
                          type="number"
                          min="0"
                          step="0.01"
                          className="h-8 w-20 text-right"
                        />
                        <span className="text-xs text-muted-foreground">x</span>
                        <Input
                          value={heightMm}
                          onChange={(e) => setHeightMm(e.target.value)}
                          type="number"
                          min="0"
                          step="0.01"
                          className="h-8 w-20 text-right"
                        />
                        <span className="text-xs text-muted-foreground">mm</span>
                      </div>
                    ) : (
                      <span className="text-sm text-foreground">
                        {part.dimensions.length} × {part.dimensions.width} × {part.dimensions.height} mm
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Weight</span>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={weightKg}
                          onChange={(e) => setWeightKg(e.target.value)}
                          type="number"
                          min="0"
                          step="0.01"
                          className="h-8 w-24 text-right"
                        />
                        <span className="text-xs text-muted-foreground">kg</span>
                      </div>
                    ) : (
                      <span className="text-sm text-foreground">{part.weight} kg</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Availability</span>
                    {isEditing ? (
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value as Part['availability'])}
                        className="px-3 py-1.5 rounded-md border border-input bg-input-background text-sm"
                      >
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>
                    ) : (
                      <Badge variant={getAvailabilityVariant(part.availability)}>
                        {part.availability}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Downloads</span>
                    <span className="text-sm text-foreground">{part.downloads.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="tracking-tight text-foreground">Description</h3>
                {isEditing ? (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 rounded-md border border-input bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">{part.description}</p>
                )}
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
                  {relatedParts.map((relatedPart) => (
                    <div key={relatedPart.id} className="p-3 rounded-lg bg-muted/20 border border-border hover:border-primary/30 transition-colors cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-foreground">{relatedPart.name}</span>
                        <span className="text-xs text-muted-foreground">{relatedPart.partNumber}</span>
                      </div>
                    </div>
                  ))}
                  {relatedParts.length === 0 && (
                    <p className="text-xs text-muted-foreground">No related parts found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FileReuploadFieldProps {
  id: string;
  label: string;
  currentName?: string;
  pendingFile: File | null;
  accept: string;
  onSelect: (file: File | null) => void;
  onClear: () => void;
}

function FileReuploadField({
  id,
  label,
  currentName,
  pendingFile,
  accept,
  onSelect,
  onClear,
}: FileReuploadFieldProps) {
  const displayName = pendingFile?.name ?? currentName ?? 'No file attached';

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
      </label>
      <p className="text-xs text-muted-foreground truncate" title={displayName}>
        Current: {displayName}
        {pendingFile && (
          <span className="text-primary ml-1">→ will replace on save</span>
        )}
      </p>
      <div className="flex items-center gap-2">
        <label
          htmlFor={id}
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-background text-sm"
        >
          <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground truncate">
            {pendingFile ? pendingFile.name : 'Choose file to upload'}
          </span>
          <input
            id={id}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
          />
        </label>
        {pendingFile && (
          <Button type="button" variant="outline" size="sm" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
