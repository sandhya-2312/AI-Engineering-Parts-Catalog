import { useState } from 'react';
import PartDetailModal from './PartDetailModal';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, Filter, ChevronLeft, ChevronRight, Plus, Upload, X, Download } from 'lucide-react';
import { mockParts, categories, manufacturers, materials, partTypes, Part } from '../lib/mockData';

export default function Catalog() {
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedManufacturer, setSelectedManufacturer] = useState('All Manufacturers');
  const [selectedMaterial, setSelectedMaterial] = useState('All Materials');
  const [selectedType, setSelectedType] = useState('All Types');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showAddPartModal, setShowAddPartModal] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newPartCategory, setNewPartCategory] = useState('Bearings');
  const [newPartMaterial, setNewPartMaterial] = useState('');
  const [newPartManufacturer, setNewPartManufacturer] = useState('');
  const [newPartDescription, setNewPartDescription] = useState('');
  const [partImage, setPartImage] = useState<File | null>(null);
  const [stlFile, setStlFile] = useState<File | null>(null);
  const [stepFile, setStepFile] = useState<File | null>(null);

  const filteredParts = mockParts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || part.category === selectedCategory;
    const matchesManufacturer = selectedManufacturer === 'All Manufacturers' || part.manufacturer === selectedManufacturer;
    const matchesMaterial = selectedMaterial === 'All Materials' || part.material === selectedMaterial;
    const matchesType = selectedType === 'All Types' || part.partType === selectedType;

    return matchesSearch && matchesCategory && matchesManufacturer && matchesMaterial && matchesType;
  });

  const totalPages = Math.ceil(filteredParts.length / itemsPerPage);
  const currentParts = filteredParts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding part:', {
      name: newPartName,
      partNumber: newPartNumber,
      category: newPartCategory,
      material: newPartMaterial,
      manufacturer: newPartManufacturer,
      description: newPartDescription,
      image: partImage?.name,
      stl: stlFile?.name,
      step: stepFile?.name
    });
    setShowAddPartModal(false);
    setNewPartName('');
    setNewPartNumber('');
    setNewPartCategory('Bearings');
    setNewPartMaterial('');
    setNewPartManufacturer('');
    setNewPartDescription('');
    setPartImage(null);
    setStlFile(null);
    setStepFile(null);
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
                <Button size="sm" onClick={() => setShowAddPartModal(true)}>
                  <Plus className="w-3.5 h-3.5" />
                  Add Part
                </Button>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  {filteredParts.length} parts found
                </p>
              </div>

              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or part number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-[160px]">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring h-9"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[160px]">
                <select
                  value={selectedManufacturer}
                  onChange={(e) => setSelectedManufacturer(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring h-9"
                >
                  {manufacturers.map(mfg => (
                    <option key={mfg} value={mfg}>{mfg}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[160px]">
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring h-9"
                >
                  {materials.map(mat => (
                    <option key={mat} value={mat}>{mat}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[160px]">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring h-9"
                >
                  {partTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory('All Categories');
                  setSelectedManufacturer('All Manufacturers');
                  setSelectedMaterial('All Materials');
                  setSelectedType('All Types');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </Card>

          <Card className="flex-1 min-h-0 gap-0 border border-border/50 overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0 overflow-auto">
              <table className="w-full border-collapse">
                <thead className="bg-muted/50 border-b border-border sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-3 py-2 text-[11px] font-medium text-muted-foreground">Preview</th>
                    <th className="text-left px-3 py-2 text-[11px] font-medium text-muted-foreground">Part ID</th>
                    <th className="text-left px-3 py-2 text-[11px] font-medium text-muted-foreground">Part Name</th>
                    <th className="text-left px-3 py-2 text-[11px] font-medium text-muted-foreground">Category</th>
                    <th className="text-left px-3 py-2 text-[11px] font-medium text-muted-foreground">Material</th>
                    <th className="text-left px-3 py-2 text-[11px] font-medium text-muted-foreground">Revision</th>
                    <th className="text-left px-3 py-2 text-[11px] font-medium text-muted-foreground">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {currentParts.map((part) => (
                    <tr
                      key={part.id}
                      className="border-b border-border hover:bg-accent/5 transition-colors"
                    >
                      <td className="px-3 py-1.5 align-middle">
                        <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-base shrink-0">
                          {part.thumbnail}
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-xs text-foreground align-middle">{part.id}</td>
                      <td
                        className="px-3 py-1.5 text-xs text-primary align-middle cursor-pointer hover:underline"
                        onClick={() => setSelectedPart(part)}
                      >
                        {part.name}
                      </td>
                      <td className="px-3 py-1.5 text-xs text-muted-foreground align-middle">{part.category}</td>
                      <td className="px-3 py-1.5 text-xs text-muted-foreground align-middle">{part.material}</td>
                      <td className="px-3 py-1.5 text-xs text-primary align-middle">{part.revision}</td>
                      <td className="px-3 py-1.5 align-middle">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Download files for', part.id);
                          }}
                        >
                          <Download className="w-3 h-3" />
                          Files
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-border px-3 py-2 flex items-center justify-between bg-muted/20 shrink-0">
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          {showAddPartModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="w-full max-w-2xl max-h-[90vh] bg-card rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
                  <h2 className="text-2xl tracking-tight">Add New Part</h2>
                  <button
                    onClick={() => setShowAddPartModal(false)}
                    className="p-2 rounded-lg hover:bg-accent/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddPart} className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
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
                          value={newPartCategory}
                          onChange={(e) => setNewPartCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-input bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring h-9"
                          required
                        >
                          {categories.filter(c => c !== 'All Categories').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="material" className="text-sm text-foreground">
                          Material *
                        </label>
                        <Input
                          id="material"
                          value={newPartMaterial}
                          onChange={(e) => setNewPartMaterial(e.target.value)}
                          placeholder="e.g., Stainless Steel"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="manufacturer" className="text-sm text-foreground">
                        Manufacturer
                      </label>
                      <Input
                        id="manufacturer"
                        value={newPartManufacturer}
                        onChange={(e) => setNewPartManufacturer(e.target.value)}
                        placeholder="Enter manufacturer name"
                      />
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
                      <Button type="submit" className="flex-1">
                        <Plus className="w-4 h-4" />
                        Add Part
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddPartModal(false)}
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
        <PartDetailModal part={selectedPart} onClose={() => setSelectedPart(null)} />
      )}
    </>
  );
}
