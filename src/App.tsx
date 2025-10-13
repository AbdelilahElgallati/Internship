// import { Header } from './components/Header';
// import { SearchFilters } from './components/SearchFilters';
// import { InternshipList } from './components/InternshipList';
// import { useInternships } from './hooks/useInternships';

// function App() {
//   const {
//     internships,
//     loading,
//     error,
//     filters,
//     updateFilters,
//     clearFilters
//   } = useInternships();

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="mb-8">
//           <SearchFilters
//             keyword={filters.keyword}
//             location={filters.location}
//             sourceSite={filters.sourceSite}
//             onKeywordChange={(value) => updateFilters({ keyword: value })}
//             onLocationChange={(value) => updateFilters({ location: value })}
//             onSourceSiteChange={(value) => updateFilters({ sourceSite: value })}
//             onClearFilters={clearFilters}
//           />
//         </div>

//         <InternshipList
//           internships={internships}
//           loading={loading}
//           error={error}
//         />
//       </main>

//       <footer className="bg-white border-t border-gray-200 mt-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <p className="text-center text-gray-600 text-sm">
//             Internship Aggregator - Automatically updated every 6 hours from LinkedIn and Indeed
//           </p>
//         </div>
//       </footer>
//     </div>
//   );
// }

// export default App;

import { useMemo } from 'react';
import { Header, type HeaderStats } from './components/Header';
import { SearchFilters } from './components/SearchFilters';
import { InternshipList } from './components/InternshipList';
import { InsightsPanel, type InsightsData } from './components/InsightsPanel';
import { useInternships } from './hooks/useInternships';
import { useLastUpdate } from './hooks/useLastUpdate';
import type { Internship } from './lib/supabase';

const computeAnalytics = (
  internships: Internship[]
): { stats: HeaderStats; insights: InsightsData } => {
  const sourceMap = new Map<string, number>();
  const locationMap = new Map<string, number>();
  const companyMap = new Map<string, number>();
  let remoteCount = 0;
  let newThisWeek = 0;
  const now = new Date();

  internships.forEach((internship) => {
    const source = internship.source_site?.trim();
    if (source) {
      sourceMap.set(source, (sourceMap.get(source) ?? 0) + 1);
    }

    const location = internship.location?.trim();
    if (location) {
      locationMap.set(location, (locationMap.get(location) ?? 0) + 1);
      if (location.toLowerCase().includes('remote')) {
        remoteCount += 1;
      }
    }

    const company = internship.company_name?.trim();
    if (company) {
      companyMap.set(company, (companyMap.get(company) ?? 0) + 1);
    }

    if (internship.date_posted) {
      const postedDate = new Date(internship.date_posted);
      if (!Number.isNaN(postedDate.getTime())) {
        const diffDays = (now.getTime() - postedDate.getTime()) / 86400000;
        if (diffDays >= 0 && diffDays <= 7) {
          newThisWeek += 1;
        }
      }
    }
  });

  const sortEntries = (map: Map<string, number>) =>
    Array.from(map.entries())
      .filter(([name]) => name.trim().length > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

  const topSources = sortEntries(sourceMap);
  const topCompanies = sortEntries(companyMap);
  const topLocations = sortEntries(locationMap);

  return {
    stats: {
      total: internships.length,
      remoteCount,
      newThisWeek,
      totalCompanies: companyMap.size,
      topSource: topSources[0] ?? null
    },
    insights: {
      topCompanies,
      topLocations,
      topSources
    }
  };
};

function App() {
  const {
    internships,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters
  } = useInternships();
  const { lastUpdate, loading: lastUpdateLoading } = useLastUpdate();

  const { stats, insights } = useMemo(
    () => computeAnalytics(internships),
    [internships]
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),transparent_55%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.12),transparent_60%)]" />

      <Header
        stats={stats}
        lastUpdate={lastUpdate}
        loadingLastUpdate={lastUpdateLoading}
      />



      <main className="relative z-10 -mt-24 md:-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-6">
              <SearchFilters
                keyword={filters.keyword}
                location={filters.location}
                sourceSite={filters.sourceSite}
                onKeywordChange={(value) => updateFilters({ keyword: value })}
                onLocationChange={(value) => updateFilters({ location: value })}
                onSourceSiteChange={(value) => updateFilters({ sourceSite: value })}
                onClearFilters={clearFilters}
              />

              <InsightsPanel insights={insights} loading={loading} />
            </div>

            <InternshipList
              internships={internships}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-slate-950/80 backdrop-blur py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-3 text-center text-sm text-slate-300 md:flex-row md:justify-between md:text-left">
            <p>Internship Aggregator · Automatically refreshed every 6 hours</p>
            <p className="text-slate-400">
              Built to help emerging talent discover their next opportunity.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
