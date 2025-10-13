// import { InternshipCard } from './InternshipCard';
// import { Internship } from '../lib/supabase';
// import { Loader2, Inbox } from 'lucide-react';

// interface InternshipListProps {
//   internships: Internship[];
//   loading: boolean;
//   error: string | null;
// }

// export const InternshipList = ({ internships, loading, error }: InternshipListProps) => {
//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center py-20">
//         <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
//         <p className="text-gray-600 text-lg">Loading internships...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-lg p-6">
//         <p className="text-red-800 font-medium">Error loading internships</p>
//         <p className="text-red-600 text-sm mt-1">{error}</p>
//       </div>
//     );
//   }

//   if (internships.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-lg">
//         <Inbox className="w-16 h-16 text-gray-400 mb-4" />
//         <h3 className="text-xl font-semibold text-gray-900 mb-2">No internships found</h3>
//         <p className="text-gray-600 text-center max-w-md">
//           Try adjusting your search filters or check back later for new listings.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between mb-4">
//         <p className="text-gray-700 font-medium">
//           Found <span className="text-teal-600 font-bold">{internships.length}</span> internships
//         </p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {internships.map((internship) => (
//           <InternshipCard key={internship.id} internship={internship} />
//         ))}
//       </div>
//     </div>
//   );
// };


import { Loader2, Inbox, AlertCircle, Sparkles } from 'lucide-react';
import { InternshipCard } from './InternshipCard';
import { Internship } from '../lib/supabase';

interface InternshipListProps {
  internships: Internship[];
  loading: boolean;
  error: string | null;
}

const SkeletonCard = () => (
  <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow animate-pulse">
    <div className="h-3.5 w-32 rounded bg-slate-200/80" />
    <div className="mt-3 h-7 w-3/4 rounded bg-slate-200/80" />
    <div className="mt-6 space-y-3">
      <div className="h-3 w-2/3 rounded bg-slate-200/70" />
      <div className="h-3 w-1/2 rounded bg-slate-200/70" />
      <div className="h-3 w-3/5 rounded bg-slate-200/70" />
    </div>
    <div className="mt-6 h-10 w-full rounded bg-slate-200/70" />
  </div>
);

export const InternshipList = ({ internships, loading, error }: InternshipListProps) => {
  if (error) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Unable to load internships</h3>
              <p className="mt-1 text-sm text-red-600">{error}</p>
              <p className="mt-3 text-xs text-red-500">
                Please adjust your filters or try again in a few moments.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const summaryLabel = loading
    ? 'Fetching fresh opportunities...'
    : `Showing ${internships.length.toLocaleString()} curated internships`;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/80 px-6 py-5 shadow-xl backdrop-blur">
        <div>
          <p className="text-sm font-medium text-slate-600">Opportunity feed</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">{summaryLabel}</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-600">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span>{loading ? 'Syncing data' : 'Real-time sync active'}</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : internships.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white/90 px-8 py-16 text-center shadow-xl">
          <Inbox className="h-14 w-14 text-slate-400" />
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-slate-900">No internships match those filters</h3>
            <p className="text-sm text-slate-600">
              Try broadening your search or check again soon—the feed refreshes throughout the day.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {internships.map((internship) => (
            <InternshipCard key={internship.id} internship={internship} />
          ))}
        </div>
      )}
    </section>
  );
};
