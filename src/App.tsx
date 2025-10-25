import { useState, useEffect } from 'react';
import { Search, BarChart3, Loader2, Rocket, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, Internship, Statistics } from './lib/supabase';
import SearchFilters from './components/SearchFilters';
import InternshipCard from './components/InternshipCard';
import StatsDashboard from './components/StatsDashboard';

function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'stats'>('search');
  const [internships, setInternships] = useState<Internship[]>([]);
  const [filteredInternships, setFilteredInternships] = useState<Internship[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInternships.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInternships.length / itemsPerPage);

  useEffect(() => {
    fetchInternships();
  }, []);

  useEffect(() => {
    if (activeTab === 'stats' && !statistics) {
      fetchStatistics();
    }
  }, [activeTab]);

  useEffect(() => {
    applyFiltersAndSort();
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [internships, searchQuery, locationFilter, sourceFilter, dateFilter, sortBy]);

  const fetchInternships = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('internships')
        .select('*')
        .order('date_posted', { ascending: false });

      if (error) throw error;

      const internshipsData = data || [];
      setInternships(internshipsData);

      const locations = [...new Set(internshipsData.map((i) => i.location))]
        .filter(Boolean)
        .filter(location => {
          // Filter out date-like strings and invalid locations
          const isDate = /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(location) ||
            /^\d{4}-\d{1,2}-\d{1,2}$/.test(location) ||
            /^(today|yesterday|tomorrow|week|month)$/i.test(location);
          return !isDate && location.length > 2; // Filter out very short strings
        })
        .map(location => location.trim())
        .sort();

      const sources = [...new Set(internshipsData.map((i) => i.source_site))].filter(Boolean).sort();

      setAvailableLocations(locations);
      setAvailableSources(sources);
    } catch (error) {
      console.error('Error fetching internships:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setIsStatsLoading(true);
      const { data, error } = await supabase.rpc('get_internship_statistics');
      console.log("The statistics:")
      console.log(data)

      if (error) throw error;

      if (data) {
        const parsedData: Statistics = {
          total_count: data.total_internships || 0,
          by_source: data.by_source ? Object.entries(data.by_source).map(([key, value]) => ({ source_site: key, count: value as number })) : [],
          top_locations: data.top_10_locations ? Object.entries(data.top_10_locations).map(([key, value]) => ({ location: key, count: value as number })) : [],
          top_companies: data.top_10_companies ? Object.entries(data.top_10_companies).map(([key, value]) => ({ company_name: key, count: value as number })) : [],
        };
        setStatistics(parsedData);
      } else {
        setStatistics(null);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...internships];

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (i) =>
          i.job_title?.toLowerCase().includes(query) ||
          i.company_name?.toLowerCase().includes(query) ||
          i.job_description?.toLowerCase().includes(query) ||
          (i.location && (
            i.location.toLowerCase().includes(query) ||
            extractLocationParts(i.location).some(part =>
              part.toLowerCase().includes(query)
            )
          ))
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((i) =>
        i.location && i.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (sourceFilter) {
      filtered = filtered.filter((i) => i.source_site === sourceFilter);
    }

    if (dateFilter) {
      const now = new Date();
      const internshipDate = (dateString: string) => new Date(dateString);

      switch (dateFilter) {
        case '1h':
          filtered = filtered.filter((i) => {
            const diffMs = now.getTime() - internshipDate(i.date_posted).getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            return diffHours <= 1;
          });
          break;
        case 'today':
          filtered = filtered.filter((i) => {
            const internshipDay = internshipDate(i.date_posted);
            return internshipDay.toDateString() === now.toDateString();
          });
          break;
        case 'week':
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((i) => internshipDate(i.date_posted) >= oneWeekAgo);
          break;
        case 'month':
          const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((i) => internshipDate(i.date_posted) >= oneMonthAgo);
          break;
        case 'specific':
          break;
      }
    }

    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.date_posted).getTime() - new Date(a.date_posted).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date_posted).getTime() - new Date(b.date_posted).getTime());
        break;
      case 'company_asc':
        filtered.sort((a, b) => (a.company_name || '').localeCompare(b.company_name || ''));
        break;
      case 'company_desc':
        filtered.sort((a, b) => (b.company_name || '').localeCompare(a.company_name || ''));
        break;
    }

    setFilteredInternships(filtered);
  };

  const extractLocationParts = (location: string): string[] => {
    if (!location) return [];

    const parts = location.split(',')
      .map(part => part.trim())
      .filter(part => part.length > 0);

    return parts;
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <header className="relative bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Rocket className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-5 h-5 text-yellow-500 fill-current" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  InternHub
                </h1>
                <p className="text-gray-600 text-sm mt-1 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Live opportunities updated daily
                </p>
              </div>
            </div>

            {/* <div className="flex gap-2 bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl shadow-inner border border-gray-200/60">
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'search'
                  ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                  }`}
              >
                <Search className="w-5 h-5" />
                Search
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'stats'
                  ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                  }`}
              >
                <BarChart3 className="w-5 h-5" />
                Analytics
              </button>
            </div> */}
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* {activeTab === 'search' ? ( */}
          <div className="space-y-8">
            <SearchFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              locationFilter={locationFilter}
              onLocationChange={setLocationFilter}
              sourceFilter={sourceFilter}
              onSourceChange={setSourceFilter}
              dateFilter={dateFilter}
              onDateChange={setDateFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              availableLocations={availableLocations}
              availableSources={availableSources}
            />

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl shadow-lg">
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                </div>
                <p className="text-gray-600 text-lg font-medium mt-4">Loading opportunities...</p>
                <p className="text-gray-500 text-sm mt-2">Finding the best internships for you</p>
              </div>
            ) : filteredInternships.length === 0 ? (
              <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl shadow-lg">
                <div className="text-8xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No internships found</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Try adjusting your search filters or browse all opportunities
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setLocationFilter('');
                    setSourceFilter('');
                    setDateFilter('');
                    setSortBy('recent');
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Show All Internships
                </button>
              </div>
            ) : (
              <>
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                  <div>
                    <p className="text-gray-700 font-semibold">
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                        {filteredInternships.length}
                      </span>
                      <span className="ml-2">internships found</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredInternships.length)} of {filteredInternships.length}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Real-time results • Page {currentPage} of {totalPages}</span>
                  </div>
                </div>

                {/* Internships Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {currentItems.map((internship) => (
                    <InternshipCard key={internship.id} internship={internship} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg mt-8">
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages} • {filteredInternships.length} total internships
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Previous Button */}
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className={`flex items-center px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                          : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md'
                          }`}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {getPageNumbers().map((page) => (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`w-10 h-10 rounded-xl font-semibold transition-all duration-300 ${currentPage === page
                              ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg scale-105'
                              : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                              }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className={`flex items-center px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                          : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md'
                          }`}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        {/* ) : (
          <StatsDashboard statistics={statistics} isLoading={isStatsLoading} />
        )} */}
      </main>

      <footer className="relative bg-white/80 backdrop-blur-md border-t border-gray-200/60 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900">InternHub</p>
                <p className="text-sm text-gray-600">Find your perfect internship</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>Made with ❤️ for students</span>
              <span>•</span>
              <span>Updated daily</span>
              <span>•</span>
              <span>100% Free</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;