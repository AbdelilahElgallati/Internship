// import { Briefcase, Clock } from 'lucide-react';
// import { useLastUpdate } from '../hooks/useLastUpdate';

// export const Header = () => {
//   const { lastUpdate, loading } = useLastUpdate();

//   const getTimeAgo = (dateString: string) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffMs = now.getTime() - date.getTime();
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMins / 60);
//     const diffDays = Math.floor(diffHours / 24);

//     if (diffMins < 60) return `${diffMins} minutes ago`;
//     if (diffHours < 24) return `${diffHours} hours ago`;
//     return `${diffDays} days ago`;
//   };

//   return (
//     <header className="bg-white shadow-sm border-b border-gray-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <div className="p-2 bg-teal-600 rounded-lg">
//               <Briefcase className="w-8 h-8 text-white" />
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">
//                 Internship Aggregator
//               </h1>
//               <p className="text-sm text-gray-600 mt-1">
//                 Discover tech internships from top platforms
//               </p>
//             </div>
//           </div>

//           {!loading && lastUpdate && (
//             <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
//               <Clock className="w-4 h-4" />
//               <span>
//                 Last updated: {getTimeAgo(lastUpdate.scrape_start)}
//               </span>
//             </div>
//           )}
//         </div>

//         <div className="mt-4 flex items-center space-x-2 text-sm text-teal-700 bg-teal-50 px-4 py-2 rounded-lg border border-teal-200">
//           <Clock className="w-4 h-4" />
//           <span>Updates automatically every 6 hours</span>
//         </div>
//       </div>
//     </header>
//   );
// };

import { Briefcase, Clock, Sparkles, Building2, Globe2, TrendingUp } from 'lucide-react';
import type { ScrapeLog } from '../lib/supabase';

export interface HeaderStats {
  total: number;
  remoteCount: number;
  newThisWeek: number;
  totalCompanies: number;
  topSource: { name: string; count: number } | null;
}

interface HeaderProps {
  stats: HeaderStats;
  lastUpdate: ScrapeLog | null;
  loadingLastUpdate: boolean;
}

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
};

export const Header = ({ stats, lastUpdate, loadingLastUpdate }: HeaderProps) => {
  const metrics = [
    {
      label: 'Open internships',
      value: stats.total.toLocaleString(),
      icon: Briefcase,
      accent: 'from-emerald-500/30 to-emerald-500/0'
    },
    {
      label: 'New this week',
      value: stats.newThisWeek.toLocaleString(),
      icon: Sparkles,
      accent: 'from-cyan-400/30 to-cyan-400/0'
    },
    {
      label: 'Remote friendly',
      value: stats.remoteCount.toLocaleString(),
      icon: Globe2,
      accent: 'from-blue-400/30 to-blue-400/0'
    },
    {
      label: 'Hiring teams',
      value: stats.totalCompanies.toLocaleString(),
      icon: Building2,
      accent: 'from-purple-400/30 to-purple-400/0'
    }
  ];

  const lastUpdateLabel = !loadingLastUpdate && lastUpdate
    ? getRelativeTime(lastUpdate.scrape_start)
    : null;

  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute -top-32 right-[-20%] h-[420px] w-[420px] rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="absolute -bottom-40 left-[-10%] h-[380px] w-[380px] rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="flex flex-col gap-10 text-white">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-wide text-emerald-200">
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] text-white">Live</span>
                Fresh opportunities every few hours
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Discover the latest tech internships curated in one place
              </h1>
              <p className="mt-4 text-base text-slate-200 sm:text-lg">
                Filter by role, location, and hiring platform to zero in on the internships that match your goals. We consolidate results from leading boards so you don&apos;t have to.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 rounded-2xl border border-white/15 bg-white/5 px-6 py-5 text-sm text-slate-100 backdrop-blur">
              <div className="flex items-center gap-2 text-emerald-200">
                <Clock className="h-4 w-4" />
                <span className="font-medium tracking-wide uppercase text-xs">Status</span>
              </div>
              <p className="text-base font-medium">
                {loadingLastUpdate && 'Checking for updates...'}
                {!loadingLastUpdate && lastUpdateLabel && `Updated ${lastUpdateLabel}`}
                {!loadingLastUpdate && !lastUpdateLabel && 'Awaiting first sync'}
              </p>
              {stats.topSource && (
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-slate-200">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-200" />
                  <span>
                    Top source: <span className="font-medium text-white">{stats.topSource.name}</span> ({stats.topSource.count})
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map(({ label, value, icon: Icon, accent }) => (
              <div
                key={label}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-6 py-6 shadow-lg backdrop-blur transition-transform duration-300 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />
                <div className="relative flex flex-col gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-emerald-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-200">{label}</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
