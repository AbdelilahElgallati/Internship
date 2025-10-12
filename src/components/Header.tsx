import { Briefcase, Clock } from 'lucide-react';
import { useLastUpdate } from '../hooks/useLastUpdate';

export const Header = () => {
  const { lastUpdate, loading } = useLastUpdate();

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-600 rounded-lg">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Internship Aggregator
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Discover tech internships from top platforms
              </p>
            </div>
          </div>

          {!loading && lastUpdate && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
              <Clock className="w-4 h-4" />
              <span>
                Last updated: {getTimeAgo(lastUpdate.scrape_start)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center space-x-2 text-sm text-teal-700 bg-teal-50 px-4 py-2 rounded-lg border border-teal-200">
          <Clock className="w-4 h-4" />
          <span>Updates automatically every 6 hours</span>
        </div>
      </div>
    </header>
  );
};
