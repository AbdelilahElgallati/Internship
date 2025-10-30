import { MapPin, DollarSign, ExternalLink, Building2, Clock } from 'lucide-react';
import { Internship } from '../lib/types';

interface InternshipCardProps {
  internship: Internship;
}

export default function InternshipCard({ internship }: InternshipCardProps) {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffSeconds = Math.round(diffTime / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffSeconds < 60) return "à l'instant";
    if (diffMinutes < 60) return `il y a ${diffMinutes} min`;
    if (diffHours < 24) return `il y a ${diffHours} h`;
    if (diffDays === 1) return 'hier';
    if (diffDays < 7) return `il y a ${diffDays} j`;
    if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} sem`;
    
    return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
  };

  const getSourceColor = (source: string) => {
    const colors: { [key: string]: string } = {
      LinkedIn: 'from-blue-500 to-blue-600',
      RemoteOk: 'from-green-500 to-green-600',
      Rekrute: 'from-teal-500 to-teal-600',
      default: 'from-gray-500 to-gray-600',
    };
    return colors[source] || colors.default;
  };

  const getSourceIcon = (source: string) => {
    const icons: { [key: string]: string } = {
      LinkedIn: '💼', 
      RemoteOk: '📄',
      Rekrute: '🏢',
      default: '🌐',
    };
    return icons[source] || icons.default;
  };

  const truncateText = (text: string | null, maxLength: number = 120): string => {
    if (!text || text === 'Not specified') return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const jobTitle = internship.job_title || 'Titre non spécifié';
  const companyName = internship.company_name || 'Entreprise inconnue';
  const location = internship.location && internship.location !== 'Not specified' 
    ? internship.location 
    : 'Télétravail / Non spécifié';

  return (
    <div className="group relative transition-all duration-300 ease-in-out opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-1000 group-hover:duration-300"></div>
      
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out p-6 border border-gray-100 dark:border-slate-700 group-hover:border-blue-200 dark:group-hover:border-blue-800 h-full flex flex-col">
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/50 dark:to-teal-900/50 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-500">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 
                className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2 leading-tight"
                title={jobTitle} 
              >
                {jobTitle}
              </h3>
              <p 
                className="text-base text-gray-700 dark:text-gray-300 font-semibold truncate transition-colors duration-500"
                title={companyName} 
              >
                {companyName}
              </p>
            </div>
          </div>
          <div 
            className={`flex items-center space-x-1 px-3 py-1 rounded-full bg-gradient-to-r ${getSourceColor(internship.source_site)} text-white text-xs font-bold flex-shrink-0 ml-2`}
            title={`Source: ${internship.source_site}`} 
          >
            <span>{getSourceIcon(internship.source_site)}</span>
            <span className="hidden sm:inline">{internship.source_site}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4">
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm transition-colors duration-500">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500 dark:text-blue-400" />
            <span className="line-clamp-1 font-medium" title={location}>
              {location}
            </span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm transition-colors duration-500">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0 text-green-500 dark:text-green-400" />
            <span className="font-medium">Publié {formatDate(internship.date_posted)}</span>
          </div>
          {internship.salary && internship.salary !== 'Not specified' && (
            <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm transition-colors duration-500">
              <DollarSign className="w-4 h-4 mr-2 flex-shrink-0 text-yellow-500 dark:text-yellow-400" />
              <span className="line-clamp-1 font-semibold text-green-600 dark:text-green-400">
                {internship.salary}
              </span>
            </div>
          )}
        </div>

        {internship.job_description && internship.job_description !== 'Not specified' && (
          <div className="flex-1 mb-4">
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 transition-colors duration-500">
              {truncateText(internship.job_description)}
            </p>
          </div>
        )}

        <div className="mt-auto pt-4">
          <a
            href={internship.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 shadow-lg hover:shadow-xl"
          >
            <span className="relative z-10">Postuler</span>
            <ExternalLink className="w-4 h-4 ml-2 relative z-10 transform group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
          </a>
        </div>
      </div>
    </div>
  );
}

