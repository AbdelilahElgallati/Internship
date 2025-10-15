import { useState, useEffect } from 'react';
import { Search, BarChart3, Loader2 } from 'lucide-react';
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

  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);

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
  }, [internships, searchQuery, locationFilter, sourceFilter, sortBy]);

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

      const locations = [...new Set(internshipsData.map((i) => i.location))].filter(Boolean).sort();
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
      console.log("The statistiques:")
      console.log(data)

      if (error) throw error;

      if (data) {
        // ✨ FIX: Transform the objects into arrays of objects
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
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.job_title.toLowerCase().includes(query) ||
          i.job_description.toLowerCase().includes(query)
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((i) => i.location === locationFilter);
    }

    if (sourceFilter) {
      filtered = filtered.filter((i) => i.source_site === sourceFilter);
    }

    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.date_posted).getTime() - new Date(a.date_posted).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date_posted).getTime() - new Date(b.date_posted).getTime());
        break;
      case 'company_asc':
        filtered.sort((a, b) => a.company_name.localeCompare(b.company_name));
        break;
      case 'company_desc':
        filtered.sort((a, b) => b.company_name.localeCompare(a.company_name));
        break;
    }

    setFilteredInternships(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                InternHub
              </h1>
              <p className="text-gray-600 text-sm mt-1">Find your dream internship</p>
            </div>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'search'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Search className="w-5 h-5" />
                Search
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'stats'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Statistics
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'search' ? (
          <div className="space-y-6">
            <SearchFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              locationFilter={locationFilter}
              onLocationChange={setLocationFilter}
              sourceFilter={sourceFilter}
              onSourceChange={setSourceFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              availableLocations={availableLocations}
              availableSources={availableSources}
            />

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 text-lg">Loading internships...</p>
              </div>
            ) : filteredInternships.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No internships found</h3>
                <p className="text-gray-600">Try adjusting your search filters</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <p className="text-gray-700 font-medium">
                    <span className="text-blue-600 font-bold">{filteredInternships.length}</span> internships found
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredInternships.map((internship) => (
                    <InternshipCard key={internship.id} internship={internship} />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <StatsDashboard statistics={statistics} isLoading={isStatsLoading} />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            InternHub - Your gateway to amazing internship opportunities
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;