import { MapPin, Calendar, Building2, ExternalLink, Tag } from 'lucide-react';
import { Internship } from '../lib/supabase';

interface InternshipCardProps {
  internship: Internship;
}

const formatDate = (dateString: string) => {
  if (!dateString) {
    return null;
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getSourceStyles = (source: string) => {
  switch (source) {
    case 'LinkedIn':
      return 'from-blue-500/90 to-blue-500/70 text-white';
    case 'Indeed':
      return 'from-emerald-500/90 to-emerald-500/70 text-white';
    default:
      return 'from-slate-500/80 to-slate-500/60 text-white';
  }
};

export const InternshipCard = ({ internship }: InternshipCardProps) => {
  const formattedDate = formatDate(internship.date_posted);
  const sourceStyles = getSourceStyles(internship.source_site);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-sky-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Building2 className="h-3.5 w-3.5" />
              {internship.company_name}
            </span>
            <h3 className="text-2xl font-semibold text-slate-900 transition-colors group-hover:text-slate-950">
              {internship.job_title}
            </h3>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold uppercase tracking-wide ${sourceStyles}`}>
            {internship.source_site}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          {internship.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-slate-700">{internship.location}</span>
            </div>
          )}
          {formattedDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-500" />
              <span>Posted {formattedDate}</span>
            </div>
          )}
          {internship.employment_type && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-emerald-500" />
              <span>{internship.employment_type}</span>
            </div>
          )}
        </div>

        {internship.job_description && (
          <p className="text-sm leading-relaxed text-slate-600">
            {internship.job_description}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 pt-5">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-emerald-600">
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-semibold">
              {internship.source_site}
            </span>
            {formattedDate && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">
                Updated {formattedDate}
              </span>
            )}
          </div>
          <a
            href={internship.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-700"
          >
            Apply now
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
};
