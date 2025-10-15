import { Search, MapPin, Filter } from 'lucide-react';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  locationFilter: string;
  onLocationChange: (value: string) => void;
  sourceFilter: string;
  onSourceChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  availableLocations: string[];
  availableSources: string[];
}

export default function SearchFilters({
  searchQuery,
  onSearchChange,
  locationFilter,
  onLocationChange,
  sourceFilter,
  onSourceChange,
  sortBy,
  onSortChange,
  availableLocations,
  availableSources,
}: SearchFiltersProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search job titles and keywords..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={locationFilter}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none appearance-none bg-white transition-colors cursor-pointer"
          >
            <option value="">All Locations</option>
            {availableLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={sourceFilter}
            onChange={(e) => onSourceChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none appearance-none bg-white transition-colors cursor-pointer"
          >
            <option value="">All Sources</option>
            {availableSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none appearance-none bg-white transition-colors cursor-pointer"
        >
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest First</option>
          <option value="company_asc">Company A-Z</option>
          <option value="company_desc">Company Z-A</option>
        </select>
      </div>
    </div>
  );
}
