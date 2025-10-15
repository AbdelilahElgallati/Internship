import { MapPin, Calendar, DollarSign, ExternalLink, Building2, Clock } from 'lucide-react';
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
      LinkedIn: 'from-blue-500 to-blue-600',
      Indeed: 'from-green-500 to-green-600',
      Glassdoor: 'from-teal-500 to-teal-600',
      default: 'from-gray-500 to-gray-600',
    };
    return colors[source] || colors.default;
  };

  const getSourceIcon = (source: string) => {
    const icons: { [key: string]: string } = {
      LinkedIn: '💼',
      Indeed: '🔍',
      Glassdoor: '🏢',
      default: '📋',
    };
    return icons[source] || icons.default;
  };

  const truncateText = (text: string | null, maxLength: number = 120): string => {
    if (!text || text === 'Not specified') return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const truncateTitle = (title: string | null, maxLength: number = 80): string => {
    if (!title) return 'No Title';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).trim() + '...';
  };

  const truncateCompany = (company: string | null, maxLength: number = 60): string => {
    if (!company) return 'Unknown Company';
    if (company.length <= maxLength) return company;
    return company.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="group relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-gray-100 group-hover:border-blue-200 h-full flex flex-col">
        {/* Header with Company Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                {truncateTitle(internship.job_title)}
              </h3>
              <p className="text-base text-gray-700 font-semibold truncate">
                {truncateCompany(internship.company_name)}
              </p>
            </div>
          </div>
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full bg-gradient-to-r ${getSourceColor(internship.source_site)} text-white text-xs font-bold flex-shrink-0 ml-2`}>
            <span>{getSourceIcon(internship.source_site)}</span>
            <span className="hidden sm:inline">{internship.source_site}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
            <span className="line-clamp-1 font-medium">
              {internship.location && internship.location !== 'Not specified' 
                ? internship.location 
                : 'Remote / Location not specified'
              }
            </span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0 text-green-500" />
            <span className="font-medium">Posted {formatDate(internship.date_posted)}</span>
          </div>
          {internship.salary && internship.salary !== 'Not specified' && (
            <div className="flex items-center text-gray-600 text-sm">
              <DollarSign className="w-4 h-4 mr-2 flex-shrink-0 text-yellow-500" />
              <span className="line-clamp-1 font-semibold text-green-600">
                {internship.salary}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {internship.job_description && internship.job_description !== 'Not specified' && (
          <div className="flex-1 mb-4">
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
              {truncateText(internship.job_description)}
            </p>
          </div>
        )}

        {/* Apply Button */}
        <div className="mt-auto pt-4">
          <a
            href={internship.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-200 shadow-lg hover:shadow-xl"
          >
            <span className="relative z-10">Apply Now</span>
            <ExternalLink className="w-4 h-4 ml-2 relative z-10 transform group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
          </a>
        </div>
      </div>
    </div>
  );
}