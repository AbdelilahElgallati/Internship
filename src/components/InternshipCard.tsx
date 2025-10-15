import { MapPin, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { Internship } from '../lib/supabase';

interface InternshipCardProps {
  internship: Internship;
}

export default function InternshipCard({ internship }: InternshipCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getSourceColor = (source: string) => {
    const colors: { [key: string]: string } = {
      LinkedIn: 'bg-blue-100 text-blue-700',
      Indeed: 'bg-green-100 text-green-700',
      Glassdoor: 'bg-teal-100 text-teal-700',
      default: 'bg-gray-100 text-gray-700',
    };
    return colors[source] || colors.default;
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-300 group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {internship.job_title}
          </h3>
          <p className="text-lg text-gray-700 mt-1 font-medium">{internship.company_name}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSourceColor(internship.source_site)} whitespace-nowrap ml-3`}>
          {internship.source_site}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600 text-sm">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="line-clamp-1">{internship.location}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>Posted {formatDate(internship.date_posted)}</span>
        </div>
        {internship.salary && (
          <div className="flex items-center text-gray-600 text-sm">
            <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="line-clamp-1">{internship.salary}</span>
          </div>
        )}
      </div>

      {internship.job_description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {truncateDescription(internship.job_description)}
        </p>
      )}

      <a
        href={internship.apply_link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Apply Now
        <ExternalLink className="w-4 h-4 ml-2" />
      </a>
    </div>
  );
}
