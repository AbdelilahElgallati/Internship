import type { ComponentType } from 'react';
import { Building2, MapPin, Layers, Activity } from 'lucide-react';

export interface InsightsData {
  topCompanies: { name: string; count: number }[];
  topLocations: { name: string; count: number }[];
  topSources: { name: string; count: number }[];
}

interface InsightsPanelProps {
  insights: InsightsData;
  loading: boolean;
}

const InsightSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-200/60 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 rounded bg-slate-200/60 animate-pulse" />
            <div className="h-2.5 w-24 rounded bg-slate-200/40 animate-pulse" />
          </div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-200/40 animate-pulse" />
      </div>
    ))}
  </div>
);

const renderSection = (
  title: string,
  description: string,
  icon: ComponentType<{ className?: string }>,
  items: { name: string; count: number }[]
) => {
  if (items.length === 0) {
    return null;
  }

  const maxCount = Math.max(...items.map((item) => item.count), 1);
  const Icon = icon;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/60 text-emerald-400">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-800">{item.name}</span>
              <span className="text-xs font-semibold text-emerald-600">{item.count}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                style={{ width: `${Math.max(8, (item.count / maxCount) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const InsightsPanel = ({ insights, loading }: InsightsPanelProps) => {
  const hasData =
    insights.topCompanies.length > 0 ||
    insights.topLocations.length > 0 ||
    insights.topSources.length > 0;

  return (
    <aside className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Market insights</h3>
          <p className="text-sm text-slate-500">
            Spot where hiring demand is highest right now.
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <Activity className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 space-y-7">
        {loading && <InsightSkeleton />}
        {!loading && hasData && (
          <div className="space-y-7">
            {renderSection(
              'Top companies hiring',
              'Teams with the most open roles across tracked platforms.',
              Building2,
              insights.topCompanies
            )}
            {renderSection(
              'Hot locations',
              'Cities and hubs with the greatest internship activity.',
              MapPin,
              insights.topLocations
            )}
            {renderSection(
              'Trending sources',
              'Boards generating the largest share of listings.',
              Layers,
              insights.topSources
            )}
          </div>
        )}
        {!loading && !hasData && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
            We&apos;ll surface insights once new listings arrive. Try broadening your filters to see more activity.
          </p>
        )}
      </div>
    </aside>
  );
};
