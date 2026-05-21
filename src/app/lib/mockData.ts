export interface Part {
  id: string;
  name: string;
  partNumber: string;
  category: string;
  material: string;
  manufacturer: string;
  partType: string;
  revision: string;
  availability: 'In Stock' | 'Low Stock' | 'Out of Stock';
  dimensions: { length: number; width: number; height: number };
  weight: number;
  description: string;
  tags: string[];
  thumbnail: string;
  downloads: number;
  createdAt?: string;
  updatedAt?: string;
}

export const mockParts: Part[] = [
  {
    id: 'P-001',
    name: 'Precision Bearing Assembly',
    partNumber: 'BRG-2024-001',
    category: 'Bearings',
    material: 'Stainless Steel',
    manufacturer: 'TechParts Inc',
    partType: 'Mechanical',
    revision: 'Rev C',
    availability: 'In Stock',
    dimensions: { length: 50, width: 50, height: 20 },
    weight: 0.45,
    description: 'High-precision bearing assembly for industrial automation applications',
    tags: ['precision', 'automation', 'industrial'],
    thumbnail: '🔩',
    downloads: 1247
  },
  {
    id: 'P-002',
    name: 'Hydraulic Cylinder Rod',
    partNumber: 'HYD-2024-045',
    category: 'Hydraulics',
    material: 'Chrome Steel',
    manufacturer: 'FluidTech',
    partType: 'Hydraulic',
    revision: 'Rev A',
    availability: 'In Stock',
    dimensions: { length: 300, width: 40, height: 40 },
    weight: 2.8,
    description: 'Heavy-duty hydraulic cylinder rod with chrome plating',
    tags: ['hydraulic', 'heavy-duty', 'chrome'],
    thumbnail: '⚙️',
    downloads: 892
  },
  {
    id: 'P-003',
    name: 'Motor Mount Bracket',
    partNumber: 'BRK-2024-128',
    category: 'Brackets',
    material: 'Aluminum Alloy',
    manufacturer: 'AlumaCast',
    partType: 'Structural',
    revision: 'Rev B',
    availability: 'Low Stock',
    dimensions: { length: 120, width: 80, height: 15 },
    weight: 0.65,
    description: 'Lightweight aluminum motor mount bracket for servo applications',
    tags: ['bracket', 'motor', 'lightweight'],
    thumbnail: '🔧',
    downloads: 2103
  },
  {
    id: 'P-004',
    name: 'Industrial Gear Drive',
    partNumber: 'GR-2024-067',
    category: 'Gears',
    material: 'Hardened Steel',
    manufacturer: 'GearWorks',
    partType: 'Transmission',
    revision: 'Rev D',
    availability: 'In Stock',
    dimensions: { length: 80, width: 80, height: 35 },
    weight: 1.2,
    description: 'Precision-cut industrial gear drive with 20:1 reduction ratio',
    tags: ['gear', 'transmission', 'precision'],
    thumbnail: '⚡',
    downloads: 1568
  },
  {
    id: 'P-005',
    name: 'Pneumatic Valve Body',
    partNumber: 'PNM-2024-089',
    category: 'Pneumatics',
    material: 'Brass',
    manufacturer: 'AirFlow Systems',
    partType: 'Pneumatic',
    revision: 'Rev A',
    availability: 'In Stock',
    dimensions: { length: 65, width: 45, height: 30 },
    weight: 0.38,
    description: 'Three-way pneumatic valve body for automated control systems',
    tags: ['pneumatic', 'valve', 'automation'],
    thumbnail: '💨',
    downloads: 743
  },
  {
    id: 'P-006',
    name: 'Linear Rail Guide',
    partNumber: 'LIN-2024-034',
    category: 'Motion',
    material: 'Stainless Steel',
    manufacturer: 'PrecisionMotion',
    partType: 'Linear Motion',
    revision: 'Rev C',
    availability: 'Out of Stock',
    dimensions: { length: 500, width: 30, height: 20 },
    weight: 1.9,
    description: 'High-precision linear rail guide system for CNC applications',
    tags: ['linear', 'motion', 'cnc'],
    thumbnail: '📏',
    downloads: 1891
  },
  {
    id: 'P-007',
    name: 'Electric Motor Housing',
    partNumber: 'MTR-2024-112',
    category: 'Housings',
    material: 'Die-Cast Aluminum',
    manufacturer: 'MotorCorp',
    partType: 'Enclosure',
    revision: 'Rev B',
    availability: 'In Stock',
    dimensions: { length: 150, width: 120, height: 100 },
    weight: 1.5,
    description: 'Rugged electric motor housing with IP65 rating',
    tags: ['motor', 'housing', 'weatherproof'],
    thumbnail: '🏭',
    downloads: 1234
  },
  {
    id: 'P-008',
    name: 'Coupling Assembly',
    partNumber: 'CPL-2024-078',
    category: 'Couplings',
    material: 'Steel Alloy',
    manufacturer: 'FlexConnect',
    partType: 'Connector',
    revision: 'Rev A',
    availability: 'In Stock',
    dimensions: { length: 60, width: 60, height: 45 },
    weight: 0.82,
    description: 'Flexible shaft coupling assembly for misalignment compensation',
    tags: ['coupling', 'flexible', 'shaft'],
    thumbnail: '🔗',
    downloads: 956
  }
];

export const categories = [
  'All Categories',
  'Bearings',
  'Hydraulics',
  'Brackets',
  'Gears',
  'Pneumatics',
  'Motion',
  'Housings',
  'Couplings'
];

export const manufacturers = [
  'All Manufacturers',
  'TechParts Inc',
  'FluidTech',
  'AlumaCast',
  'GearWorks',
  'AirFlow Systems',
  'PrecisionMotion',
  'MotorCorp',
  'FlexConnect'
];

export const materials = [
  'All Materials',
  'Stainless Steel',
  'Chrome Steel',
  'Aluminum Alloy',
  'Hardened Steel',
  'Brass',
  'Die-Cast Aluminum',
  'Steel Alloy'
];

export const partTypes = [
  'All Types',
  'Mechanical',
  'Hydraulic',
  'Structural',
  'Transmission',
  'Pneumatic',
  'Linear Motion',
  'Enclosure',
  'Connector'
];
