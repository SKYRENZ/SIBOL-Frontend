import { useMemo, useState } from "react";
import { Filter, X } from "lucide-react";
import useFilters from "../../hooks/filter/useFilter";

import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Checkbox } from "@/Components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { Separator } from "@/Components/ui/separator";

type FilterPanelProps = {
  types?: string[]; 

  
  onFilterChange?: (filters: string[]) => void;
  className?: string;
};

const prettify = (key: string) =>
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const FilterPanel: React.FC<FilterPanelProps> = ({
  types,
  onFilterChange,
  className = "",
}) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const { filters, loading, error } = useFilters(types);

  const orderedCategories = useMemo(() => {
    const keys = types ?? Object.keys(filters);
    return keys
      .map((key) => ({
        key,
        options: (filters[key] ?? []).map((item) => item.name),
      }))
      .filter(({ options }) => options.length > 0);
  }, [filters, types]);

  const handleRemoveFilter = (filter: string) => {
    const newFilters = selectedFilters.filter((f) => f !== filter);
    setSelectedFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleCheckboxChange = (option: string) => {
    const newFilters = selectedFilters.includes(option)
      ? selectedFilters.filter((f) => f !== option)
      : [...selectedFilters, option];

    setSelectedFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter by
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-[500px] p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Filter className="w-5 h-5" />
              Filter
            </div>
          </div>

          {/* Active Filters */}
          <div className="border rounded-md p-3 mb-4">
            {selectedFilters.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No filters applied
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedFilters.map((filter) => (
                  <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                    {filter}
                    <button
                      onClick={() => handleRemoveFilter(filter)}
                      className="ml-1 rounded-full bg-[#355842] text-white hover:bg-[#2e4a36] p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator className="mb-4" />

          {/* Filters */}
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading filters...</p>
            ) : error ? (
              <p className="text-destructive text-sm">{error}</p>
            ) : orderedCategories.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No filter options available.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {orderedCategories.map(({ key, options }) => (
                  <div key={key}>
                    <h3 className="font-semibold mb-2 text-sm">
                      {prettify(key)}
                    </h3>

                    <div className="space-y-2">
                      {options.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                          id={option}
                          checked={selectedFilters.includes(option)}
                          onCheckedChange={() => handleCheckboxChange(option)}
                          className="focus:outline-none"
                        />
                          <label
                            htmlFor={option}
                            className="text-sm cursor-pointer leading-none"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FilterPanel;