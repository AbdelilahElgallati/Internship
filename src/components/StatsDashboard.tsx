// import { Briefcase, TrendingUp, MapPin, Building2 } from 'lucide-react';
// import { Statistics } from '../lib/supabase';

// interface StatsDashboardProps {
//   statistics: Statistics | null;
//   isLoading: boolean;
// }

// export default function StatsDashboard({ statistics, isLoading }: StatsDashboardProps) {
//   if (isLoading) {
//     return (
//       <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
//         <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
//         <div className="space-y-3">
//           <div className="h-20 bg-gray-200 rounded"></div>
//           <div className="h-20 bg-gray-200 rounded"></div>
//           <div className="h-20 bg-gray-200 rounded"></div>
//         </div>
//       </div>
//     );
//   }

//   if (!statistics) return null;

//   return (
//     <div className="space-y-6">
//       <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg p-8 text-white">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Internships</p>
//             <p className="text-5xl font-bold mt-2">
//               {(statistics.total_count ?? 0).toLocaleString()}
//             </p>
//           </div>
//           <Briefcase className="w-16 h-16 text-blue-300 opacity-80" />
//         </div>
//       </div>

//       <div className="bg-white rounded-2xl shadow-lg p-6">
//         <div className="flex items-center mb-4">
//           <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
//           <h3 className="text-xl font-bold text-gray-900">By Source</h3>
//         </div>
//         <div className="space-y-3">
//           {statistics.by_source?.map((source) => {
//             const percentage = ((source.count / statistics.total_count) * 100).toFixed(1);
//             return (
//               <div key={source.source_site} className="space-y-1">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm font-medium text-gray-700">{source.source_site}</span>
//                   <span className="text-sm font-semibold text-gray-900">{source.count.toLocaleString()}</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
//                   <div
//                     className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
//                     style={{ width: `${percentage}%` }}
//                   ></div>
//                 </div>
//                 <p className="text-xs text-gray-500">{percentage}%</p>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       <div className="bg-white rounded-2xl shadow-lg p-6">
//         <div className="flex items-center mb-4">
//           <MapPin className="w-6 h-6 text-blue-600 mr-2" />
//           <h3 className="text-xl font-bold text-gray-900">Top Locations</h3>
//         </div>
//         <div className="space-y-2">
//           {statistics.top_locations?.slice(0, 10).map((location, index) => (
//             <div key={location.location} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//               <div className="flex items-center">
//                 <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 font-bold text-sm mr-3">
//                   {index + 1}
//                 </span>
//                 <span className="text-sm font-medium text-gray-700 line-clamp-1">{location.location}</span>
//               </div>
//               <span className="text-sm font-semibold text-gray-900 ml-2 flex-shrink-0">{location.count.toLocaleString()}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="bg-white rounded-2xl shadow-lg p-6">
//         <div className="flex items-center mb-4">
//           <Building2 className="w-6 h-6 text-blue-600 mr-2" />
//           <h3 className="text-xl font-bold text-gray-900">Top Companies</h3>
//         </div>
//         <div className="space-y-2">
//           {statistics.top_companies?.slice(0, 10).map((company, index) => (
//             <div key={company.company_name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//               <div className="flex items-center flex-1 min-w-0">
//                 <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 font-bold text-sm mr-3 flex-shrink-0">
//                   {index + 1}
//                 </span>
//                 <span className="text-sm font-medium text-gray-700 truncate">{company.company_name}</span>
//               </div>
//               <span className="text-sm font-semibold text-gray-900 ml-2 flex-shrink-0">{company.count.toLocaleString()}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }


import { Briefcase, TrendingUp, MapPin, Building2, Inbox } from 'lucide-react';
import { Statistics } from '../lib/supabase';

interface StatsDashboardProps {
  statistics: Statistics | null;
  isLoading: boolean;
}

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center p-4 text-center text-gray-500">
    <Inbox className="w-8 h-8 mb-2" />
    <p className="text-sm font-medium">{message}</p>
  </div>
);

export default function StatsDashboard({ statistics, isLoading }: StatsDashboardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!statistics) return null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Internships</p>
            <p className="text-5xl font-bold mt-2">
              {(statistics.total_count ?? 0).toLocaleString()}
            </p>
          </div>
          <Briefcase className="w-16 h-16 text-blue-300 opacity-80" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-900">By Source</h3>
        </div>
        <div className="space-y-3">
          {Array.isArray(statistics.by_source) && statistics.by_source.length > 0 ? (
            statistics.by_source.map((source) => {
              const percentage =
                statistics.total_count > 0
                  ? ((source.count / statistics.total_count) * 100).toFixed(1)
                  : '0';
              return (
                <div key={source.source_site} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{source.source_site}</span>
                    <span className="text-sm font-semibold text-gray-900">{source.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">{percentage}%</p>
                </div>
              );
            })
          ) : (
            <EmptyState message="No source data available." />
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <MapPin className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-900">Top Locations</h3>
        </div>
        <div className="space-y-2">
          {Array.isArray(statistics.top_locations) && statistics.top_locations.length > 0 ? (
            statistics.top_locations.slice(0, 10).map((location, index) => (
              <div key={location.location} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 font-bold text-sm mr-3">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700 line-clamp-1">{location.location}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 ml-2 flex-shrink-0">{location.count.toLocaleString()}</span>
              </div>
            ))
          ) : (
            <EmptyState message="No location data available." />
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <Building2 className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-900">Top Companies</h3>
        </div>
        <div className="space-y-2">
          {Array.isArray(statistics.top_companies) && statistics.top_companies.length > 0 ? (
            statistics.top_companies.slice(0, 10).map((company, index) => (
              <div key={company.company_name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center flex-1 min-w-0">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 font-bold text-sm mr-3 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700 truncate">{company.company_name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 ml-2 flex-shrink-0">{company.count.toLocaleString()}</span>
              </div>
            ))
           ) : (
            <EmptyState message="No company data available." />
          )}
        </div>
      </div>
    </div>
  );
}