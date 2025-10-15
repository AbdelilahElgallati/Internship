import { Briefcase, TrendingUp, MapPin, Building2, Inbox, Users, Zap, Target } from 'lucide-react';
import { Statistics } from '../lib/supabase';

interface StatsDashboardProps {
  statistics: Statistics | null;
  isLoading: boolean;
}

const StatCard = ({ icon: Icon, title, value, gradient, delay = 0 }: { icon: any, title: string, value: string, gradient: string, delay?: number }) => (
  <div 
    className={`bg-gradient-to-br ${gradient} rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-500`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
        <Icon className="w-8 h-8 text-white" />
      </div>
    </div>
  </div>
);

const EmptyState = ({ message, icon: Icon = Inbox }: { message: string; icon?: any }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 bg-gray-50 rounded-2xl">
    <Icon className="w-12 h-12 mb-3 text-gray-400" />
    <p className="text-sm font-medium">{message}</p>
  </div>
);

export default function StatsDashboard({ statistics, isLoading }: StatsDashboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-2xl p-6 h-32"></div>
          ))}
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-2xl p-6 h-64"></div>
        ))}
      </div>
    );
  }

  if (!statistics) return null;

  const totalCount = statistics.total_count ?? 0;
  const avgPerSource = statistics.by_source && statistics.by_source.length > 0 
    ? Math.round(totalCount / statistics.by_source.length) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Briefcase}
          title="Total Internships"
          value={totalCount.toLocaleString()}
          gradient="from-blue-500 to-blue-700"
          delay={0}
        />
        <StatCard
          icon={Users}
          title="Sources"
          value={(statistics.by_source?.length || 0).toString()}
          gradient="from-green-500 to-green-700"
          delay={100}
        />
        <StatCard
          icon={Target}
          title="Avg per Source"
          value={avgPerSource.toLocaleString()}
          gradient="from-purple-500 to-purple-700"
          delay={200}
        />
        <StatCard
          icon={Zap}
          title="Top Companies"
          value={(statistics.top_companies?.length || 0).toString()}
          gradient="from-orange-500 to-orange-700"
          delay={300}
        />
      </div>

      {/* Source Distribution */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mr-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Distribution by Source</h3>
            <p className="text-gray-600 text-sm">Where internships are coming from</p>
          </div>
        </div>
        <div className="space-y-4">
          {Array.isArray(statistics.by_source) && statistics.by_source.length > 0 ? (
            statistics.by_source.map((source, index) => {
              const percentage = totalCount > 0 ? ((source.count / totalCount) * 100) : 0;
              const gradients = [
                'from-blue-500 to-blue-600',
                'from-green-500 to-green-600',
                'from-purple-500 to-purple-600',
                'from-orange-500 to-orange-600',
                'from-pink-500 to-pink-600',
              ];
              const gradient = gradients[index % gradients.length];

              return (
                <div key={source.source_site} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${gradient}`}></div>
                      <span className="text-sm font-semibold text-gray-900">{source.source_site}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900">{source.count.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 font-medium">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState message="No source data available." />
          )}
        </div>
      </div>

      {/* Top Locations & Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Locations */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl mr-4">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Top Locations</h3>
              <p className="text-gray-600 text-sm">Most popular internship locations</p>
            </div>
          </div>
          <div className="space-y-3">
            {Array.isArray(statistics.top_locations) && statistics.top_locations.length > 0 ? (
              statistics.top_locations.slice(0, 8).map((location, index) => (
                <div key={location.location} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-blue-50 hover:to-white transition-all duration-300 group">
                  <div className="flex items-center space-x-3">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-xl font-bold text-sm group-hover:scale-110 transition-transform ${
                      index < 3 
                        ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 truncate">{location.location}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                    {location.count.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <EmptyState message="No location data available." />
            )}
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl mr-4">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Top Companies</h3>
              <p className="text-gray-600 text-sm">Companies with most opportunities</p>
            </div>
          </div>
          <div className="space-y-3">
            {Array.isArray(statistics.top_companies) && statistics.top_companies.length > 0 ? (
              statistics.top_companies.slice(0, 8).map((company, index) => (
                <div key={company.company_name} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-purple-50 hover:to-white transition-all duration-300 group">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-xl font-bold text-sm group-hover:scale-110 transition-transform ${
                      index < 3 
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 truncate">{company.company_name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg flex-shrink-0">
                    {company.count.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <EmptyState message="No company data available." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}