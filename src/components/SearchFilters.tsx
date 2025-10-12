import { Search, MapPin, Filter, X } from 'lucide-react';

interface SearchFiltersProps {
  keyword: string;
  location: string;
  sourceSite: string;
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSourceSiteChange: (value: string) => void;
  onClearFilters: () => void;
}

export const SearchFilters = ({
  keyword,
  location,
  sourceSite,
  onKeywordChange,
  onLocationChange,
  onSourceSiteChange,
  onClearFilters
}: SearchFiltersProps) => {
  const hasActiveFilters = keyword || location || sourceSite;

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">Search & Filter</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-2">
            Keyword
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="keyword"
              type="text"
              placeholder="Search by title or description..."
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        <div className="relative">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="location"
              type="text"
              placeholder="City or country..."
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
            Source Site
          </label>
          <select
            id="source"
            value={sourceSite}
            onChange={(e) => onSourceSiteChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors bg-white"
          >
            <option value="">All Sources</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Indeed">Indeed</option>
          </select>
        </div>
      </div>
    </div>
  );
};
