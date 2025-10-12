import { Header } from './components/Header';
import { SearchFilters } from './components/SearchFilters';
import { InternshipList } from './components/InternshipList';
import { useInternships } from './hooks/useInternships';

function App() {
  const {
    internships,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters
  } = useInternships();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <SearchFilters
            keyword={filters.keyword}
            location={filters.location}
            sourceSite={filters.sourceSite}
            onKeywordChange={(value) => updateFilters({ keyword: value })}
            onLocationChange={(value) => updateFilters({ location: value })}
            onSourceSiteChange={(value) => updateFilters({ sourceSite: value })}
            onClearFilters={clearFilters}
          />
        </div>

        <InternshipList
          internships={internships}
          loading={loading}
          error={error}
        />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            Internship Aggregator - Automatically updated every 6 hours from LinkedIn and Indeed
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
