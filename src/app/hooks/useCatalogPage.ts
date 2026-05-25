import { useCallback, useEffect, useMemo, useState } from 'react';
import { catalogApi } from '../lib/api/catalog';
import { parseItemsPerPage } from '../lib/catalogSettings';
import { mapApiPartToPart } from '../lib/mapPart';
import type { LookupEntity } from '../lib/api/types';
import type { Part } from '../lib/mockData';
import { useCatalogSettings } from './useCatalogSettings';

const ALL = '';

export function useCatalogPage() {
  const catalogSettings = useCatalogSettings();
  const itemsPerPage = parseItemsPerPage(catalogSettings.itemsPerPage);

  const [parts, setParts] = useState<Part[]>([]);
  const [categories, setCategories] = useState<LookupEntity[]>([]);
  const [materials, setMaterials] = useState<LookupEntity[]>([]);
  const [manufacturers, setManufacturers] = useState<LookupEntity[]>([]);
  const [partTypes, setPartTypes] = useState<string[]>(['All Types']);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryId, setCategoryId] = useState(ALL);
  const [materialId, setMaterialId] = useState(ALL);
  const [manufacturerId, setManufacturerId] = useState(ALL);
  const [partType, setPartType] = useState('All Types');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery || undefined,
      categoryId: categoryId || undefined,
      materialId: materialId || undefined,
      manufacturerId: manufacturerId || undefined,
      partType: partType !== 'All Types' ? partType : undefined,
      sortBy: 'createdAt',
      sortOrder: 'DESC' as const,
    }),
    [currentPage, itemsPerPage, searchQuery, categoryId, materialId, manufacturerId, partType],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const applyFilters = useCallback((filters: Awaited<ReturnType<typeof catalogApi.filters>>) => {
    setCategories(filters.categories.filter((c) => c.id !== ''));
    setMaterials(filters.materials.filter((m) => m.id !== ''));
    setManufacturers(filters.manufacturers.filter((m) => m.id !== ''));
    setPartTypes(filters.partTypes);
  }, []);

  const loadParts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await catalogApi.listParts(queryParams);
      setParts(result.data.map((p, i) => mapApiPartToPart(p, i)));
      setTotalPages(result.meta.totalPages);
      setTotalItems(result.meta.total);
    } catch {
      setError('Failed to load parts. Is the API running?');
      setParts([]);
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    catalogApi
      .filters()
      .then(applyFilters)
      .catch(() => setError('Failed to load catalog filters.'));
  }, [applyFilters]);

  useEffect(() => {
    loadParts();
  }, [loadParts]);

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryId(ALL);
    setMaterialId(ALL);
    setManufacturerId(ALL);
    setPartType('All Types');
    setCurrentPage(1);
  };

  const categoryOptions = useMemo(
    () => [{ id: ALL, name: 'All Categories' }, ...categories],
    [categories],
  );
  const materialOptions = useMemo(
    () => [{ id: ALL, name: 'All Materials' }, ...materials],
    [materials],
  );
  const manufacturerOptions = useMemo(
    () => [{ id: ALL, name: 'All Manufacturers' }, ...manufacturers],
    [manufacturers],
  );

  return {
    parts,
    categories,
    materials,
    manufacturers,
    categoryOptions,
    materialOptions,
    manufacturerOptions,
    partTypes,
    searchQuery,
    setSearchQuery,
    categoryId,
    setCategoryId,
    materialId,
    setMaterialId,
    manufacturerId,
    setManufacturerId,
    partType,
    setPartType,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    isLoading,
    error,
    itemsPerPage,
    clearFilters,
    reload: loadParts,
  };
}
