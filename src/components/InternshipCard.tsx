import { MapPin, Calendar, Building2, ExternalLink, Tag } from 'lucide-react';
import { Internship } from '../lib/supabase';

interface InternshipCardProps {
  internship: Internship;
}

export const InternshipCard = ({ internship }: InternshipCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'LinkedIn':
        return 'bg-blue-100 text-blue-700';
      case 'Indeed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-teal-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
            {internship.job_title}
          </h3>
          <div className="flex items-center space-x-2 text-gray-700 mb-1">
            <Building2 className="w-4 h-4" />
            <span className="font-medium">{internship.company_name}</span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSourceColor(internship.source_site)}`}>
          {internship.source_site}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
        {internship.location && (
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{internship.location}</span>
          </div>
        )}
        {internship.date_posted && (
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(internship.date_posted)}</span>
          </div>
        )}
        {internship.employment_type && (
          <div className="flex items-center space-x-1">
            <Tag className="w-4 h-4" />
            <span>{internship.employment_type}</span>
          </div>
        )}
      </div>

      {internship.job_description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {internship.job_description}
        </p>
      )}

      <div className="pt-4 border-t border-gray-100">
        <a
          href={internship.apply_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          <span>Apply Now</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
