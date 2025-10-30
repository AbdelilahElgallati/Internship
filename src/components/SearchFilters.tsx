import { Search, Filter, ArrowUpDown, X, Calendar } from 'lucide-react';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sourceFilter: string;
  onSourceChange: (value: string) => void;
  dateFilter: string;
  onDateChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  availableSources: string[];
}

export default function SearchFilters({
  searchQuery,
  onSearchChange,
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
    onSourceChange('');
    onDateChange('');
    onSortChange('recent');
  };

  const hasActiveFilters = searchQuery || sourceFilter || dateFilter || sortBy !== 'recent';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 space-y-6 border border-gray-100 dark:border-slate-700 transition-colors duration-500">
      
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder="Rechercher titres, entreprises, mots-clés, villes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300 bg-gray-50 dark:bg-slate-900 dark:text-gray-200 focus:bg-white dark:focus:bg-slate-800 group-hover:border-gray-300 dark:group-hover:border-slate-600"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="relative group">
          <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors z-10" />
          <select
            value={sourceFilter}
            onChange={(e) => onSourceChange(e.target.value)}
            className="w-full pl-12 pr-10 py-4 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:outline-none appearance-none bg-gray-50 dark:bg-slate-900 dark:text-gray-200 focus:bg-white dark:focus:bg-slate-800 group-hover:border-gray-300 dark:group-hover:border-slate-600 transition-all duration-300 cursor-pointer font-medium"
          >
            <option value="">Toutes les sources</option>
            {availableSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 dark:border-gray-500 transform rotate-45 transition-transform group-focus-within:rotate-225"></div>
          </div>
        </div>

        <div className="relative group">
          <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors z-10" />
          <select
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full pl-12 pr-10 py-4 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:outline-none appearance-none bg-gray-50 dark:bg-slate-900 dark:text-gray-200 focus:bg-white dark:focus:bg-slate-800 group-hover:border-gray-300 dark:group-hover:border-slate-600 transition-all duration-300 cursor-pointer font-medium"
          >
            <option value="">Toutes les dates</option>
            <option value="1h">🕐 1 dernière heure</option>
            <option value="today">📅 Aujourd'hui</option>
            <option value="week">📆 7 derniers jours</option>
            <option value="month">🗓️ 30 derniers jours</option>
          </select>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 dark:border-gray-500 transform rotate-45 transition-transform group-focus-within:rotate-225"></div>
          </div>
        </div>

        <div className="relative group">
          <ArrowUpDown className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors z-10" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full pl-12 pr-10 py-4 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:outline-none appearance-none bg-gray-50 dark:bg-slate-900 dark:text-gray-200 focus:bg-white dark:focus:bg-slate-800 group-hover:border-gray-300 dark:group-hover:border-slate-600 transition-all duration-300 cursor-pointer font-medium"
          >
            <option value="recent">🕒 Plus récent</option>
            <option value="oldest">📜 Plus ancien</option>
            <option value="company_asc">🏢 Entreprise A-Z</option>
            <option value="company_desc">🏢 Entreprise Z-A</option>
          </select>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 dark:border-gray-500 transform rotate-45 transition-transform group-focus-within:rotate-225"></div>
          </div>
        </div>

        <button
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className={`px-6 py-4 border-2 rounded-xl font-semibold transition-all duration-300 ${
            hasActiveFilters
              ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 hover:shadow-md transform hover:scale-105 dark:bg-red-900/50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900 dark:hover:border-red-700'
              : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed dark:bg-slate-700 dark:border-slate-600 dark:text-gray-500'
          }`}
        >
          Effacer
        </button>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
            <span>Filtres actifs:</span>
          </div>
          {searchQuery && (
            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full dark:bg-blue-900 dark:text-blue-200">
              Recherche: "{searchQuery}"
            </span>
          )}
          {sourceFilter && (
            <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full dark:bg-purple-900 dark:text-purple-200">
              Source: "{sourceFilter}"
            </span>
          )}
          {dateFilter && (
            <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full dark:bg-orange-900 dark:text-orange-200">
              Date: {getDateFilterLabel(dateFilter)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function getDateFilterLabel(dateFilter: string): string {
  const labels: Record<string, string> = {
    '1h': '1 dernière heure',
    'today': 'Aujourd\'hui',
    'week': '7 derniers jours',
    'month': '30 derniers jours',
    'specific': 'Date spécifique'
  };
  return labels[dateFilter] || dateFilter;
}
