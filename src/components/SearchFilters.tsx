import { Search, Filter, ArrowUpDown, X, Calendar } from 'lucide-react';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  locationFilter: string;
  onLocationChange: (value: string) => void;
  sourceFilter: string;
  onSourceChange: (value: string) => void;
  dateFilter: string;
  onDateChange: (value: string) => void;
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
  dateFilter,
  onDateChange,
  sortBy,
  onSortChange,
  availableSources,
}: SearchFiltersProps) {
  const clearFilters = () => {
    onSearchChange('');
    onLocationChange('');
    onSourceChange('');
    onDateChange('');
    onSortChange('recent');
  };

  const hasActiveFilters = searchQuery || locationFilter || sourceFilter || dateFilter || sortBy !== 'recent';

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6 border border-gray-100">
      {/* Enhanced Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder="Search job titles, companies, keywords, cities, or countries..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300 bg-gray-50 focus:bg-white group-hover:border-gray-300"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Source Filter */}
        <div className="relative group">
          <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors z-10" />
          <select
            value={sourceFilter}
            onChange={(e) => onSourceChange(e.target.value)}
            className="w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none appearance-none bg-gray-50 focus:bg-white group-hover:border-gray-300 transition-all duration-300 cursor-pointer font-medium bg-gradient-to-r from-gray-50 to-white hover:from-green-50 hover:to-white"
          >
            <option value="">All Sources</option>
            {availableSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45 transition-transform group-focus-within:rotate-225"></div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="relative group">
          <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors z-10" />
          <select
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none appearance-none bg-gray-50 focus:bg-white group-hover:border-gray-300 transition-all duration-300 cursor-pointer font-medium bg-gradient-to-r from-gray-50 to-white hover:from-purple-50 hover:to-white"
          >
            <option value="">All Dates</option>
            <option value="1h">🕐 Last 1 hour</option>
            <option value="today">📅 Today</option>
            <option value="week">📆 Last 7 days</option>
            <option value="month">🗓️ Last 30 days</option>
          </select>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45 transition-transform group-focus-within:rotate-225"></div>
          </div>
        </div>

        {/* Sort Filter */}
        <div className="relative group">
          <ArrowUpDown className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors z-10" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none appearance-none bg-gray-50 focus:bg-white group-hover:border-gray-300 transition-all duration-300 cursor-pointer font-medium bg-gradient-to-r from-gray-50 to-white hover:from-orange-50 hover:to-white"
          >
            <option value="recent">🕒 Most Recent</option>
            <option value="oldest">📜 Oldest First</option>
            <option value="company_asc">🏢 Company A-Z</option>
            <option value="company_desc">🏢 Company Z-A</option>
          </select>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45 transition-transform group-focus-within:rotate-225"></div>
          </div>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className={`px-6 py-4 border-2 rounded-xl font-semibold transition-all duration-300 ${
            hasActiveFilters
              ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 hover:shadow-md transform hover:scale-105'
              : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
          }`}
        >
          Clear All
        </button>
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2 text-sm text-blue-600 font-medium">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>Active filters:</span>
          </div>
          {searchQuery && (
            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              Search: "{searchQuery}"
            </span>
          )}
          {locationFilter && (
            <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
              Location: "{locationFilter}"
            </span>
          )}
          {sourceFilter && (
            <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">
              Source: "{sourceFilter}"
            </span>
          )}
          {dateFilter && (
            <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full">
              Date: {getDateFilterLabel(dateFilter)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to get date filter label
function getDateFilterLabel(dateFilter: string): string {
  const labels: Record<string, string> = {
    '1h': 'Last 1 hour',
    'today': 'Today',
    'week': 'Last 7 days',
    'month': 'Last 30 days',
    'specific': 'Specific date'
  };
  return labels[dateFilter] || dateFilter;
}