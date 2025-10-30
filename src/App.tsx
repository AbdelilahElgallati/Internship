import { useState, useEffect } from 'react';
import { Search, BarChart3, Loader2, Rocket, Sparkles, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import { Internship, Statistics, StatisticsApiResponse } from './lib/types';
import * as api from './lib/api';
import SearchFilters from './components/SearchFilters';
import InternshipCard from './components/InternshipCard';

type Theme = 'light' | 'dark';

function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'stats'>('search');
  
  const [internships, setInternships] = useState<Internship[]>([]);
  const [filteredInternships, setFilteredInternships] = useState<Internship[]>([]);
  
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const [theme, setTheme] = useState<Theme>('light');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const [searchQuery, setSearchQuery] = useState('');
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
    fetchInitialData();

    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme: Theme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      runSearch();
    }
  }, [searchQuery, sourceFilter]);
  
  useEffect(() => {
    applyClientFiltersAndSort();
    setCurrentPage(1); 
  }, [internships, dateFilter, sortBy]);

  // useEffect(() => {
  //   if (activeTab === 'stats' && !statistics) {
  //     // fetchStatistics(); // À décommenter si besoin
  //   }
  // }, [activeTab]);

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('Rafraîchissement automatique des données...');
      fetchInitialData(); 
    }, 2 * 60 * 60 * 1000); 

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const response = await api.fetchInternships(200, 0);
      const internshipsData = response.data || [];
      
      setInternships(internshipsData); 
      setLastUpdated(new Date());

      const locations = [...new Set(internshipsData.map((i) => i.location))]
        .filter((location): location is string => {
          if (!location) return false;
          const isDate = /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(location) ||
            /^\d{4}-\d{1,2}-\d{1,2}$/.test(location) ||
            /^(today|yesterday|tomorrow|week|month)$/i.test(location);
          return !isDate && location.length > 2;
        })
        .map(location => location.trim())
        .sort();

      const sources = [...new Set(internshipsData.map((i) => i.source_site))].filter(Boolean).sort();

      setAvailableLocations(locations);
      setAvailableSources(sources);
    } catch (error) {
      console.error('Erreur lors de la récupération des stages initiaux:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runSearch = async () => {
    try {
      setIsLoading(true);
      if (!searchQuery && !sourceFilter) {
        await fetchInitialData(); 
      } else {
        const response = await api.searchInternships(searchQuery, searchQuery, sourceFilter, 200);
        setInternships(response.data || []); 
        setLastUpdated(new Date()); 
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de stages:', error);
      setInternships([]); 
    } finally {
      setIsLoading(false);
    }
  };

  const applyClientFiltersAndSort = () => {
    let filtered = [...internships]; 

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

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const formatLastUpdated = () => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    }).format(lastUpdated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-gray-900 transition-colors duration-500">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-pulse delay-500"></div>
      </div>

      <header className="relative bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200/60 dark:bg-slate-900/80 dark:border-slate-700/60 transition-colors duration-500">
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
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Dernière mise à jour : {formatLastUpdated()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-inner border border-gray-200/60 dark:border-slate-700/60 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 transition-all duration-300"
                aria-label="Toggle dark mode"
              >
                {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sourceFilter={sourceFilter}
            onSourceChange={setSourceFilter}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            availableSources={availableSources}
          />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-lg transition-colors duration-500">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg font-medium mt-4">Chargement des opportunités...</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Recherche des meilleurs stages pour vous</p>
            </div>
          ) : filteredInternships.length === 0 ? (
            <div className="text-center py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-lg">
              <div className="text-8xl mb-6">Search</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Aucun stage trouvé</h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6">
                Essayez d'ajuster vos filtres de recherche ou parcourez toutes les opportunités
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSourceFilter('');
                  setDateFilter('');
                  setSortBy('recent');
                }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Afficher tous les stages
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                <div>
                  <p className="text-gray-700 dark:text-gray-200 font-semibold">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                      {filteredInternships.length}
                    </span>
                    <span className="ml-2">stages trouvés</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Affichage de {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredInternships.length)} sur {filteredInternships.length}
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Résultats en temps réel • Page {currentPage} sur {totalPages}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {currentItems.map((internship) => (
                  <InternshipCard key={internship.id} internship={internship} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg mt-8">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} sur {totalPages} • {filteredInternships.length} stages au total
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`flex items-center px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed bg-gray-100 dark:bg-gray-700 dark:text-gray-500'
                          : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md dark:bg-slate-700 dark:text-gray-200 dark:border-slate-600 dark:hover:bg-slate-600'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Précédent
                    </button>

                    <div className="flex items-center space-x-1">
                      {getPageNumbers().map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`w-10 h-10 rounded-xl font-semibold transition-all duration-300 ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg scale-105'
                              : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:bg-slate-700 dark:text-gray-200 dark:border-slate-600 dark:hover:bg-slate-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`flex items-center px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed bg-gray-100 dark:bg-gray-700 dark:text-gray-500'
                          : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md dark:bg-slate-700 dark:text-gray-200 dark:border-slate-600 dark:hover:bg-slate-600'
                      }`}
                    >
                      Suivant
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-gray-200/60 dark:border-slate-700/60 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">InternHub</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Trouvez votre stage parfait</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Fait avec Heart pour les étudiants</span>
              <span className="hidden sm:inline">•</span>
              <span>Mis à jour quotidiennement</span>
              <span className="hidden sm:inline">•</span>
              <span>100% Gratuit</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;