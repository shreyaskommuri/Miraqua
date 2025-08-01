import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

interface SearchFilter {
  crop?: string;
  status?: string;
  moistureLevel?: string;
  location?: string;
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilter) => void;
  activeFilters: SearchFilter;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ 
  onFiltersChange, 
  activeFilters 
}) => {
  const [localFilters, setLocalFilters] = useState<SearchFilter>(activeFilters);

  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const removeFilter = (key: keyof SearchFilter) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="space-y-3">
      {/* Filter trigger */}
      <div className="flex items-center space-x-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 h-5 min-w-[1.25rem] text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Advanced Filters</SheetTitle>
            </SheetHeader>
            
            <div className="space-y-6 mt-6">
              {/* Crop Type */}
              <div className="space-y-2">
                <Label>Crop Type</Label>
                <Select 
                  value={localFilters.crop || ''} 
                  onValueChange={(value) => setLocalFilters(prev => ({ ...prev, crop: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any crop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any crop</SelectItem>
                    <SelectItem value="tomatoes">Tomatoes</SelectItem>
                    <SelectItem value="lettuce">Lettuce</SelectItem>
                    <SelectItem value="herbs">Herbs</SelectItem>
                    <SelectItem value="flowers">Flowers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={localFilters.status || ''} 
                  onValueChange={(value) => setLocalFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any status</SelectItem>
                    <SelectItem value="healthy">Healthy</SelectItem>
                    <SelectItem value="needs-attention">Needs Attention</SelectItem>
                    <SelectItem value="watering">Watering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Moisture Level */}
              <div className="space-y-2">
                <Label>Moisture Level</Label>
                <Select 
                  value={localFilters.moistureLevel || ''} 
                  onValueChange={(value) => setLocalFilters(prev => ({ ...prev, moistureLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any level</SelectItem>
                    <SelectItem value="low">Low (0-30%)</SelectItem>
                    <SelectItem value="medium">Medium (30-70%)</SelectItem>
                    <SelectItem value="high">High (70-100%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="Filter by location..."
                  value={localFilters.location || ''}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4">
                <Button onClick={applyFilters} className="flex-1">
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => (
            <Badge 
              key={key} 
              variant="secondary" 
              className="flex items-center space-x-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => removeFilter(key as keyof SearchFilter)}
            >
              <span className="capitalize">{key}: {value}</span>
              <X className="w-3 h-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};