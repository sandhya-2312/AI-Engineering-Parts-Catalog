import { useEffect, useState } from 'react';
import PartDetailModal from './PartDetailModal';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, Filter, ChevronLeft, ChevronRight, Plus, Upload, X, Download, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Part } from '../lib/mockData';
import { useCatalogPage } from '../hooks/useCatalogPage';
import { useCatalogSettings } from '../hooks/useCatalogSettings';
import type { CatalogViewMode } from '../lib/catalogSettings';
import { useAuth, isApiError } from '../context/AuthContext';
import { catalogApi } from '../lib/api/catalog';
import { partsApi } from '../lib/api/parts';
import { getStoredToken } from '../lib/api/client';

const MANUAL_OPTION = '__manual__';

function isLikelyImageThumbnail(value: string) {
  return /^(https?:|data:image\/|blob:|\/|\.\/)/i.test(value)
    || /\.(png|jpe?g|gif|webp|svg)$/i.test(value);
}

function resolveThumbnailUrl(value: string) {
  if (/^(https?:|data:image\/|blob:)/i.test(value)) return value;
  const rawApiBase = import.meta.env.VITE_API_URL ?? '/api';
  if (value.startsWith('/files/')) {
    return `${rawApiBase}${value}`;
  }
  const apiBase = rawApiBase.endsWith('/api') ? rawApiBase.slice(0, -4) : rawApiBase;
  const normalizedPath = value.startsWith('/') ? value : `/${value}`;
  return `${apiBase}${normalizedPath}`;
}

function PartPreview({ thumbnail }: { thumbnail: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [resolvedImageSrc, setResolvedImageSrc] = useState<string | null>(null);
  const canRenderImage = isLikelyImageThumbnail(thumbnail) && !imageFailed;
  const isProtectedApiFile = thumbnail.startsWith('/files/');

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
          const response = await fetch(resolveThumbnailUrl(thumbnail), {
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

      if (isActive) setResolvedImageSrc(resolveThumbnailUrl(thumbnail));
    };

    setImageFailed(false);
    loadImage();

    return () => {
      isActive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [thumbnail, canRenderImage, isProtectedApiFile]);

  return (
    <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-base shrink-0 overflow-hidden">
      {canRenderImage && resolvedImageSrc ? (
        <img
          src={resolvedImageSrc}
          alt="Part preview"
          className="w-full h-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{thumbnail}</span>
      )}
    </div>
  );
}

export default function Catalog() {
  const { canWrite } = useAuth();
  const catalog = useCatalogPage();
  const catalogPrefs = useCatalogSettings();
  const [viewMode, setViewMode] = useState<CatalogViewMode>(catalogPrefs.defaultView);

  useEffect(() => {
    setViewMode(catalogPrefs.defaultView);
  }, [catalogPrefs.defaultView]);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTargetPartNumber, setDeleteTargetPartNumber] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [partFormMode, setPartFormMode] = useState<'add' | 'edit' | null>(null);
  /** Internal UUID — file list/upload APIs */
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  /** Original part number when edit opened — PATCH by-part-number */
  const [editingOriginalPartNumber, setEditingOriginalPartNumber] = useState<string | null>(null);
  const [newPartName, setNewPartName] = useState('');
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newPartCategoryId, setNewPartCategoryId] = useState('');
  const [newPartMaterialId, setNewPartMaterialId] = useState('');
  const [newPartManufacturerId, setNewPartManufacturerId] = useState('');
  const [newPartCategoryManual, setNewPartCategoryManual] = useState('');
  const [newPartMaterialManual, setNewPartMaterialManual] = useState('');
  const [newPartManufacturerManual, setNewPartManufacturerManual] = useState('');
  const [newPartDescription, setNewPartDescription] = useState('');
  const [partImage, setPartImage] = useState<File | null>(null);
  const [stlFile, setStlFile] = useState<File | null>(null);
  const [stepFile, setStepFile] = useState<File | null>(null);

  const resetPartForm = () => {
    setEditingPartId(null);
    setEditingOriginalPartNumber(null);
    setNewPartName('');
    setNewPartNumber('');
    setNewPartCategoryId(catalog.categories[0]?.id ?? '');
    setNewPartMaterialId(catalog.materials[0]?.id ?? '');
    setNewPartManufacturerId('');
    setNewPartCategoryManual('');
    setNewPartMaterialManual('');
    setNewPartManufacturerManual('');
    setNewPartDescription('');
    setPartImage(null);
    setStlFile(null);
    setStepFile(null);
  };

  const openAddPartForm = () => {
    resetPartForm();
    setPartFormMode('add');
  };

  const closePartForm = () => {
    setPartFormMode(null);
    resetPartForm();
  };

  const currentParts = catalog.parts;

  const uploadPartFiles = async (partId: string) => {
    const files = [partImage, stlFile, stepFile].filter(Boolean) as File[];
    for (const file of files) {
      await partsApi.uploadFile(partId, file);
    }
  };

  const handlePartFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSaving(true);

    try {
      let categoryId: string | null = newPartCategoryId || null;
      let materialId: string | null = newPartMaterialId || null;
      let manufacturerId: string | null = newPartManufacturerId || null;

      if (newPartCategoryId === MANUAL_OPTION) {
        const manualCategory = newPartCategoryManual.trim();
        if (!manualCategory) {
          setFormError('Category name is required when adding manually.');
          setIsSaving(false);
          return;
        }
        const existingCategory = catalog.categories.find(
          (item) => item.name.toLowerCase() === manualCategory.toLowerCase(),
        );
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          const createdCategory = await catalogApi.createCategory({ name: manualCategory });
          categoryId = createdCategory.id;
        }
      }

      if (newPartMaterialId === MANUAL_OPTION) {
        const manualMaterial = newPartMaterialManual.trim();
        if (!manualMaterial) {
          setFormError('Material name is required when adding manually.');
          setIsSaving(false);
          return;
        }
        const existingMaterial = catalog.materials.find(
          (item) => item.name.toLowerCase() === manualMaterial.toLowerCase(),
        );
        if (existingMaterial) {
          materialId = existingMaterial.id;
        } else {
          const createdMaterial = await catalogApi.createMaterial({ name: manualMaterial });
          materialId = createdMaterial.id;
        }
      }

      if (newPartManufacturerId === MANUAL_OPTION) {
        const manualManufacturer = newPartManufacturerManual.trim();
        if (!manualManufacturer) {
          manufacturerId = null;
        } else {
          const existingManufacturer = catalog.manufacturers.find(
            (item) => item.name.toLowerCase() === manualManufacturer.toLowerCase(),
          );
          if (existingManufacturer) {
            manufacturerId = existingManufacturer.id;
          } else {
            const createdManufacturer = await catalogApi.createManufacturer({ name: manualManufacturer });
            manufacturerId = createdManufacturer.id;
          }
        }
      }

      const body = {
        name: newPartName,
        partNumber: newPartNumber,
        categoryId,
        materialId,
        manufacturerId,
        description: newPartDescription || undefined,
      };

      if (partFormMode === 'edit' && editingPartId && editingOriginalPartNumber) {
        await partsApi.update(editingOriginalPartNumber, body);
        if (partImage || stlFile || stepFile) {
          await uploadPartFiles(editingPartId);
        }
      } else if (partImage || stlFile || stepFile) {
        await catalogApi.addPartWithFiles(
          {
            name: newPartName,
            partNumber: newPartNumber,
            categoryId: categoryId || undefined,
            materialId: materialId || undefined,
            manufacturerId: manufacturerId || undefined,
            description: newPartDescription || undefined,
          },
          { partImage, stlFile, stepFile },
        );
      } else {
        await catalogApi.addPart(body);
      }
      closePartForm();
      catalog.reload();
    } catch (err) {
      setFormError(isApiError(err) ? err.message : 'Failed to save part.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePart = async (partNumber: string) => {
    setDeleteError('');
    setDeleteTargetPartNumber(partNumber);
  };

  const confirmDeletePart = async () => {
    if (!deleteTargetPartNumber) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await partsApi.remove(deleteTargetPartNumber);
      catalog.reload();
      setDeleteTargetPartNumber(null);
    } catch (err) {
      setDeleteError(isApiError(err) ? err.message : 'Failed to delete part.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadFiles = async (partId: string) => {
    try {
      const files = await partsApi.listFiles(partId);
      if (!files.length) {
        alert('No files attached to this part.');
        return;
      }
      for (const file of files) {
        await partsApi.downloadFile(file.id, file.originalName);
      }
      await partsApi.trackDownload(partId);
      catalog.reload();
    } catch (err) {
      alert(isApiError(err) ? err.message : 'Download failed.');
    }
  };

  return (
    <>
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col p-4 gap-4">
          <Card className="border border-border/50 p-3">
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex items-center gap-2 w-full mb-1">
                <Filter className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium tracking-tight">Filters</h3>
                <div className="flex-1" />
                {canWrite && (
                  <Button size="sm" onClick={openAddPartForm}>
                    <Plus className="w-3.5 h-3.5" />
                    Add Part
                  </Button>
                )}
                
              </div>

              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or part number..."
                    value={catalog.searchQuery}
                    onChange={(e) => {
                      catalog.setSearchQuery(e.target.value);
                      catalog.setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-[160px]">
                <select
                  value={catalog.categoryId}
                  onChange={(e) => {
                    catalog.setCategoryId(e.target.value);
                    catalog.setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-md border border-input bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring h-9"
                >
                  {catalog.categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[160px]">
                <select
                  value={catalog.manufacturerId}
                  onChange={(e) => {
                    catalog.setManufacturerId(e.target.value);
                    catalog.setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-md border border-input bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring h-9"
                >
                  {catalog.manufacturerOptions.map((mfg) => (
                    <option key={mfg.id} value={mfg.id}>{mfg.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[160px]">
                <select
                  value={catalog.materialId}
                  onChange={(e) => {
                    catalog.setMaterialId(e.target.value);
                    catalog.setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-md border border-input bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring h-9"
                >
                  {catalog.materialOptions.map((mat) => (
                    <option key={mat.id} value={mat.id}>{mat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[160px]">
                <select
                  value={catalog.partType}
                  onChange={(e) => {
                    catalog.setPartType(e.target.value);
                    catalog.setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-md border border-input bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring h-9"
                >
                  {catalog.partTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={catalog.clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </Card>

          <Card className="flex-1 min-h-0 gap-0 border border-border/50 overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0 overflow-auto relative p-3">
              {catalog.isLoading && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                  Loading parts…
                </div>
              )}
              {!catalog.isLoading && catalog.error && (
                <div className="py-8 text-center text-sm text-destructive">{catalog.error}</div>
              )}
              {!catalog.isLoading && !catalog.error && currentParts.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No parts found. {canWrite ? 'Add your first part to get started.' : ''}
                </div>
              )}
              {!catalog.isLoading && !catalog.error && currentParts.length > 0 && viewMode === 'table' && (
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      {catalogPrefs.showThumbnails && (
                        <th className="sticky top-0 z-20 bg-card text-left px-3 py-2 text-[11px] font-medium text-muted-foreground border-b border-border">
                          Preview
                        </th>
                      )}
                      {catalogPrefs.showPartNumbers && (
                        <th className="sticky top-0 z-20 bg-card text-left px-3 py-2 text-[11px] font-medium text-muted-foreground border-b border-border">
                          Part Number
                        </th>
                      )}
                      <th className="sticky top-0 z-20 bg-card text-left px-3 py-2 text-[11px] font-medium text-muted-foreground border-b border-border">
                        Part Name
                      </th>
                      <th className="sticky top-0 z-20 bg-card text-left px-3 py-2 text-[11px] font-medium text-muted-foreground border-b border-border">
                        Category
                      </th>
                      <th className="sticky top-0 z-20 bg-card text-left px-3 py-2 text-[11px] font-medium text-muted-foreground border-b border-border">
                        Material
                      </th>
                      <th className="sticky top-0 z-20 bg-card text-left px-3 py-2 text-[11px] font-medium text-muted-foreground border-b border-border">
                        Download
                      </th>
                      <th className="sticky top-0 z-20 bg-card text-right px-3 py-2 text-[11px] font-medium text-muted-foreground border-b border-border">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentParts.map((part) => (
                      <tr
                        key={part.id}
                        className="border-b border-border hover:bg-accent/5 transition-colors"
                      >
                        {catalogPrefs.showThumbnails && (
                          <td className="px-3 py-1.5 align-middle">
                            <PartPreview thumbnail={part.thumbnail} />
                          </td>
                        )}
                        {catalogPrefs.showPartNumbers && (
                          <td className="px-3 py-1.5 text-xs text-foreground align-middle font-mono">
                            {part.partNumber}
                          </td>
                        )}
                        <td
                          className="px-3 py-1.5 text-xs text-primary align-middle cursor-pointer hover:underline"
                          onClick={() => setSelectedPart(part)}
                        >
                          {part.name}
                        </td>
                        <td className="px-3 py-1.5 text-xs text-muted-foreground align-middle">{part.category}</td>
                        <td className="px-3 py-1.5 text-xs text-muted-foreground align-middle">{part.material}</td>
                        <td className="px-3 py-1.5 align-middle">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFiles(part.id);
                            }}
                          >
                            <Download className="w-3 h-3" />
                            Files
                          </Button>
                        </td>
                        <td className="px-3 py-1.5 align-middle">
                          {canWrite && (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                aria-label={`Edit ${part.name}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPart(part);
                                }}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                aria-label={`Delete ${part.name}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePart(part.partNumber);
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!catalog.isLoading && !catalog.error && currentParts.length > 0 && viewMode === 'grid' && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {currentParts.map((part) => (
                    <div
                      key={part.id}
                      className="rounded-lg border border-border p-3 hover:bg-accent/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedPart(part)}
                    >
                      {catalogPrefs.showThumbnails && (
                        <div className="mb-2 flex justify-center">
                          <PartPreview thumbnail={part.thumbnail} />
                        </div>
                      )}
                      <p className="text-sm font-medium text-primary truncate">{part.name}</p>
                      {catalogPrefs.showPartNumbers && (
                        <p className="text-xs font-mono text-muted-foreground mt-0.5">{part.partNumber}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{part.category} · {part.material}</p>
                    </div>
                  ))}
                </div>
              )}
              {!catalog.isLoading && !catalog.error && currentParts.length > 0 && viewMode === 'list' && (
                <div className="divide-y divide-border">
                  {currentParts.map((part) => (
                    <div
                      key={part.id}
                      className="flex items-center gap-3 py-2 hover:bg-accent/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedPart(part)}
                    >
                      {catalogPrefs.showThumbnails && <PartPreview thumbnail={part.thumbnail} />}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-primary truncate">{part.name}</p>
                        {catalogPrefs.showPartNumbers && (
                          <p className="text-xs font-mono text-muted-foreground">{part.partNumber}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{part.category} · {part.material}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadFiles(part.id);
                        }}
                      >
                        <Download className="w-3 h-3" />
                        Files
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border px-3 py-2 flex items-center justify-between bg-muted/20 shrink-0">
              <p className="text-xs text-muted-foreground">
                {catalog.totalItems} parts · Page {catalog.currentPage} of {catalog.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => catalog.setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={catalog.currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => catalog.setCurrentPage((p) => Math.min(catalog.totalPages, p + 1))}
                  disabled={catalog.currentPage === catalog.totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          {partFormMode && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="w-full max-w-2xl max-h-[90vh] bg-card rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
                  <h2 className="text-2xl tracking-tight">
                    {partFormMode === 'edit' ? 'Edit Part' : 'Add New Part'}
                  </h2>
                  <button
                    type="button"
                    onClick={closePartForm}
                    className="p-2 rounded-lg hover:bg-accent/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handlePartFormSubmit} className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {formError && (
                      <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                        {formError}
                      </p>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="partName" className="text-sm text-foreground">
                          Part Name *
                        </label>
                        <Input
                          id="partName"
                          value={newPartName}
                          onChange={(e) => setNewPartName(e.target.value)}
                          placeholder="Enter part name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="partNumber" className="text-sm text-foreground">
                          Part Number *
                        </label>
                        <Input
                          id="partNumber"
                          value={newPartNumber}
                          onChange={(e) => setNewPartNumber(e.target.value)}
                          placeholder="e.g., BRG-2024-001"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="category" className="text-sm text-foreground">
                          Category *
                        </label>
                        <select
                          id="category"
                          value={newPartCategoryId}
                          onChange={(e) => setNewPartCategoryId(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-input bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring h-9"
                          required
                        >
                          {catalog.categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                          <option value={MANUAL_OPTION}>+ Add manually</option>
                        </select>
                        {newPartCategoryId === MANUAL_OPTION && (
                          <Input
                            value={newPartCategoryManual}
                            onChange={(e) => setNewPartCategoryManual(e.target.value)}
                            placeholder="Enter new category"
                            required
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="material" className="text-sm text-foreground">
                          Material *
                        </label>
                        <select
                          id="material"
                          value={newPartMaterialId}
                          onChange={(e) => setNewPartMaterialId(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-input bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring h-9"
                          required
                        >
                          {catalog.materials.map((mat) => (
                            <option key={mat.id} value={mat.id}>{mat.name}</option>
                          ))}
                          <option value={MANUAL_OPTION}>+ Add manually</option>
                        </select>
                        {newPartMaterialId === MANUAL_OPTION && (
                          <Input
                            value={newPartMaterialManual}
                            onChange={(e) => setNewPartMaterialManual(e.target.value)}
                            placeholder="Enter new material"
                            required
                          />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="manufacturer" className="text-sm text-foreground">
                        Manufacturer
                      </label>
                      <select
                        id="manufacturer"
                        value={newPartManufacturerId}
                        onChange={(e) => setNewPartManufacturerId(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-input bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring h-9"
                      >
                        <option value="">None</option>
                        {catalog.manufacturers.map((mfg) => (
                          <option key={mfg.id} value={mfg.id}>{mfg.name}</option>
                        ))}
                        <option value={MANUAL_OPTION}>+ Add manually</option>
                      </select>
                      {newPartManufacturerId === MANUAL_OPTION && (
                        <Input
                          value={newPartManufacturerManual}
                          onChange={(e) => setNewPartManufacturerManual(e.target.value)}
                          placeholder="Enter new manufacturer (optional)"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm text-foreground">
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={newPartDescription}
                        onChange={(e) => setNewPartDescription(e.target.value)}
                        placeholder="Enter part description"
                        rows={3}
                        className="w-full px-3 py-2 rounded-md border border-input bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                      <h3 className="tracking-tight text-foreground">File Uploads</h3>
                      {partFormMode === 'edit' && (
                        <p className="text-xs text-muted-foreground">
                          Upload new files only if you want to replace the existing ones.
                        </p>
                      )}

                      <div className="space-y-2">
                        <label htmlFor="partImage" className="text-sm text-foreground">
                          Part Image
                        </label>
                        <div className="flex items-center gap-3">
                          <label
                            htmlFor="partImage"
                            className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-muted/20"
                          >
                            <Upload className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {partImage ? partImage.name : 'Choose image file (PNG, JPG)'}
                            </span>
                            <input
                              id="partImage"
                              type="file"
                              accept="image/*"
                              onChange={(e) => setPartImage(e.target.files?.[0] || null)}
                              className="hidden"
                            />
                          </label>
                          {partImage && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setPartImage(null)}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="stlFile" className="text-sm text-foreground">
                          STL File
                        </label>
                        <div className="flex items-center gap-3">
                          <label
                            htmlFor="stlFile"
                            className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-muted/20"
                          >
                            <Upload className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {stlFile ? stlFile.name : 'Choose STL CAD file'}
                            </span>
                            <input
                              id="stlFile"
                              type="file"
                              accept=".stl"
                              onChange={(e) => setStlFile(e.target.files?.[0] || null)}
                              className="hidden"
                            />
                          </label>
                          {stlFile && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setStlFile(null)}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="stepFile" className="text-sm text-foreground">
                          STEP File
                        </label>
                        <div className="flex items-center gap-3">
                          <label
                            htmlFor="stepFile"
                            className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-muted/20"
                          >
                            <Upload className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {stepFile ? stepFile.name : 'Choose STEP CAD file'}
                            </span>
                            <input
                              id="stepFile"
                              type="file"
                              accept=".step,.stp"
                              onChange={(e) => setStepFile(e.target.files?.[0] || null)}
                              className="hidden"
                            />
                          </label>
                          {stepFile && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setStepFile(null)}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border">
                      <Button type="submit" className="flex-1" disabled={isSaving}>
                        {partFormMode === 'edit' ? (
                          <>
                            <Pencil className="w-4 h-4" />
                            Save Changes
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add Part
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={closePartForm}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
      </main>

      {selectedPart && (
        <PartDetailModal
          part={selectedPart}
          onClose={() => setSelectedPart(null)}
          onPartUpdated={catalog.reload}
        />
      )}

      {deleteTargetPartNumber && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-2xl">
            <div className="p-5 border-b border-border">
              <h3 className="text-lg tracking-tight">Delete Part</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Are you sure you want to delete part{' '}
                <span className="font-mono text-foreground">{deleteTargetPartNumber}</span>?
                This action cannot be undone.
              </p>
              {deleteError && (
                <p className="mt-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                  {deleteError}
                </p>
              )}
            </div>
            <div className="p-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDeleteTargetPartNumber(null);
                  setDeleteError('');
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDeletePart}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
