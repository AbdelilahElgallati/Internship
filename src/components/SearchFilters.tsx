// import { Search, MapPin, Filter, X } from 'lucide-react';

// interface SearchFiltersProps {
//   keyword: string;
//   location: string;
//   sourceSite: string;
//   onKeywordChange: (value: string) => void;
//   onLocationChange: (value: string) => void;
//   onSourceSiteChange: (value: string) => void;
//   onClearFilters: () => void;
// }

// export const SearchFilters = ({
//   keyword,
//   location,
//   sourceSite,
//   onKeywordChange,
//   onLocationChange,
//   onSourceSiteChange,
//   onClearFilters
// }: SearchFiltersProps) => {
//   const hasActiveFilters = keyword || location || sourceSite;

//   return (
//     <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center space-x-2">
//           <Filter className="w-5 h-5 text-teal-600" />
//           <h2 className="text-lg font-semibold text-gray-900">Search & Filter</h2>
//         </div>
//         {hasActiveFilters && (
//           <button
//             onClick={onClearFilters}
//             className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
//           >
//             <X className="w-4 h-4" />
//             <span>Clear filters</span>
//           </button>
//         )}
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="relative">
//           <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-2">
//             Keyword
//           </label>
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//             <input
//               id="keyword"
//               type="text"
//               placeholder="Search by title or description..."
//               value={keyword}
//               onChange={(e) => onKeywordChange(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
//             />
//           </div>
//         </div>

//         <div className="relative">
//           <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
//             Location
//           </label>
//           <div className="relative">
//             <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//             <input
//               id="location"
//               type="text"
//               placeholder="City or country..."
//               value={location}
//               onChange={(e) => onLocationChange(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
//             />
//           </div>
//         </div>

//         <div>
//           <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
//             Source Site
//           </label>
//           <select
//             id="source"
//             value={sourceSite}
//             onChange={(e) => onSourceSiteChange(e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors bg-white"
//           >
//             <option value="">All Sources</option>
//             <option value="LinkedIn">LinkedIn</option>
//             <option value="Indeed">Indeed</option>
//           </select>
//         </div>
//       </div>
//     </div>
//   );
// };

import { Search, MapPin, Filter, X, ChevronDown, Sparkles } from 'lucide-react';

interface SearchFiltersProps {
  keyword: string;
  location: string;
  sourceSite: string;
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSourceSiteChange: (value: string) => void;
  onClearFilters: () => void;
}

const SOURCE_OPTIONS = [
  { label: 'All platforms', value: '' },
  { label: 'LinkedIn', value: 'LinkedIn' },
  { label: 'Indeed', value: 'Indeed' },
  { label: "RemoteOk", value: 'RemoteOk'}
];

export const SearchFilters = ({
  keyword,
  location,
  sourceSite,
  onKeywordChange,
  onLocationChange,
  onSourceSiteChange,
  onClearFilters
}: SearchFiltersProps) => {
  const hasActiveFilters = Boolean(keyword || location || sourceSite);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <Filter className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Smart search filters</h2>
            <p className="text-sm text-slate-500">
              Combine keywords, locations, and sources to narrow the results instantly.
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="keyword" className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Search className="h-4 w-4 text-emerald-500" />
            Keyword
          </label>
          <div className="relative">
            <input
              id="keyword"
              type="text"
              placeholder="Search by title, tech stack, or responsibilities"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <MapPin className="h-4 w-4 text-emerald-500" />
            Location
          </label>
          <div className="relative">
            <input
              id="location"
              type="text"
              placeholder="City, region, or remote-friendly keywords"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        <div className="space-y-3 md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            Source platform
          </label>
          <div className="relative">
            <select
              id="source"
              value={sourceSite}
              onChange={(e) => onSourceSiteChange(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              {SOURCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex flex-wrap gap-2">
            {SOURCE_OPTIONS.map((option) => (
              <button
                key={option.value || 'all'}
                type="button"
                onClick={() => onSourceSiteChange(option.value)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                  sourceSite === option.value
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
