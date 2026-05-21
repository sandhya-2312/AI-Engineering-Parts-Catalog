import type { ApiPart, PartAvailabilityApi } from './api/types';
import type { Part } from './mockData';

const THUMBNAILS = ['🔩', '⚙️', '🔧', '⚡', '💨', '📏', '🏭', '🔗'];

function availabilityLabel(value: PartAvailabilityApi): Part['availability'] {
  const map: Record<PartAvailabilityApi, Part['availability']> = {
    in_stock: 'In Stock',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
  };
  return map[value] ?? 'In Stock';
}

export function mapApiPartToPart(api: ApiPart, index = 0): Part {
  return {
    id: api.id,
    name: api.name,
    partNumber: api.partNumber,
    category: api.category?.name ?? '—',
    material: api.material?.name ?? '—',
    manufacturer: api.manufacturer?.name ?? '—',
    partType: api.partType ?? '—',
    revision: api.revision ?? '—',
    availability: availabilityLabel(api.availability),
    dimensions: {
      length: api.dimensions?.length ?? 0,
      width: api.dimensions?.width ?? 0,
      height: api.dimensions?.height ?? 0,
    },
    weight: api.weight ?? 0,
    description: api.description ?? '',
    tags: api.tags ?? [],
    thumbnail: api.thumbnail ?? THUMBNAILS[index % THUMBNAILS.length],
    downloads: api.downloads ?? 0,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

export function availabilityToApi(
  label: Part['availability'],
): PartAvailabilityApi {
  const map: Record<Part['availability'], PartAvailabilityApi> = {
    'In Stock': 'in_stock',
    'Low Stock': 'low_stock',
    'Out of Stock': 'out_of_stock',
  };
  return map[label] ?? 'in_stock';
}
