// import { Loader2, Inbox, AlertCircle, Sparkles } from 'lucide-react';
// import { InternshipCard } from './InternshipCard';
// import { Internship } from '../lib/supabase';

// interface InternshipListProps {
//   internships: Internship[];
//   loading: boolean;
//   error: string | null;
// }

// const SkeletonCard = () => (
//   <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow animate-pulse">
//     <div className="h-3.5 w-32 rounded bg-slate-200/80" />
//     <div className="mt-3 h-7 w-3/4 rounded bg-slate-200/80" />
//     <div className="mt-6 space-y-3">
//       <div className="h-3 w-2/3 rounded bg-slate-200/70" />
//       <div className="h-3 w-1/2 rounded bg-slate-200/70" />
//       <div className="h-3 w-3/5 rounded bg-slate-200/70" />
//     </div>
//     <div className="mt-6 h-10 w-full rounded bg-slate-200/70" />
//   </div>
// );

// export const InternshipList = ({ internships, loading, error }: InternshipListProps) => {
//   if (error) {
//     return (
//       <section className="space-y-6">
//         <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
//           <div className="flex items-start gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
//               <AlertCircle className="h-5 w-5" />
//             </div>
//             <div>
//               <h3 className="text-lg font-semibold text-red-800">Unable to load internships</h3>
//               <p className="mt-1 text-sm text-red-600">{error}</p>
//               <p className="mt-3 text-xs text-red-500">
//                 Please adjust your filters or try again in a few moments.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   const summaryLabel = loading
//     ? 'Fetching fresh opportunities...'
//     : `Showing ${internships.length.toLocaleString()} curated internships`;

//   return (
//     <section className="space-y-6">
//       <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/80 px-6 py-5 shadow-xl backdrop-blur">
//         <div>
//           <p className="text-sm font-medium text-slate-600">Opportunity feed</p>
//           <h2 className="mt-1 text-2xl font-semibold text-slate-900">{summaryLabel}</h2>
//         </div>
//         <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-600">
//           {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
//           <span>{loading ? 'Syncing data' : 'Real-time sync active'}</span>
//         </div>
//       </div>

//       {loading ? (
//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//           {Array.from({ length: 4 }).map((_, index) => (
//             <SkeletonCard key={index} />
//           ))}
//         </div>
//       ) : internships.length === 0 ? (
//         <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white/90 px-8 py-16 text-center shadow-xl">
//           <Inbox className="h-14 w-14 text-slate-400" />
//           <div className="space-y-1">
//             <h3 className="text-xl font-semibold text-slate-900">No internships match those filters</h3>
//             <p className="text-sm text-slate-600">
//               Try broadening your search or check again soon—the feed refreshes throughout the day.
//             </p>
//           </div>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//           {internships.map((internship) => (
//             <InternshipCard key={internship.id} internship={internship} />
//           ))}
//         </div>
//       )}
//     </section>
//   );
// };

// InternshipList.tsx
import { useState, useEffect } from 'react';
import { Loader2, Inbox, AlertCircle, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { InternshipCard } from './InternshipCard';
import { Internship } from '../lib/supabase';

interface InternshipListProps {
  internships: Internship[];
  loading: boolean;
  error: string | null;
}

const ITEMS_PER_PAGE = 10;

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
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when internships change (due to filtering)
  useEffect(() => {
    setCurrentPage(1);
  }, [internships]);

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

  // Calculate pagination values
  const totalPages = Math.ceil(internships.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentInternships = internships.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const summaryLabel = loading
    ? 'Fetching fresh opportunities...'
    : `Showing ${startIndex + 1}-${Math.min(endIndex, internships.length)} of ${internships.length.toLocaleString()} curated internships`;

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
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {currentInternships.map((internship) => (
              <InternshipCard key={internship.id} internship={internship} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-6">
              <div className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first 2 pages, last 2 pages, and pages around current page
                      return page === 1 || 
                             page === totalPages || 
                             (page >= currentPage - 1 && page <= currentPage + 1);
                    })
                    .map((page, index, array) => {
                      // Add ellipsis for gaps
                      const showEllipsis = index > 0 && page - array[index - 1] > 1;
                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsis && (
                            <span className="px-2 text-slate-400">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`h-9 w-9 rounded-full text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-emerald-500 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};