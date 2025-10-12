import { InternshipCard } from './InternshipCard';
import { Internship } from '../lib/supabase';
import { Loader2, Inbox } from 'lucide-react';

interface InternshipListProps {
  internships: Internship[];
  loading: boolean;
  error: string | null;
}

export const InternshipList = ({ internships, loading, error }: InternshipListProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
        <p className="text-gray-600 text-lg">Loading internships...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-medium">Error loading internships</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (internships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-lg">
        <Inbox className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No internships found</h3>
        <p className="text-gray-600 text-center max-w-md">
          Try adjusting your search filters or check back later for new listings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-700 font-medium">
          Found <span className="text-teal-600 font-bold">{internships.length}</span> internships
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {internships.map((internship) => (
          <InternshipCard key={internship.id} internship={internship} />
        ))}
      </div>
    </div>
  );
};
