import { useState, useEffect } from 'react';
import { supabase, Internship } from '../lib/supabase';

interface Filters {
  keyword: string;
  location: string;
  sourceSite: string;
}

export const useInternships = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    keyword: '',
    location: '',
    sourceSite: ''
  });

  const fetchInternships = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('internships')
        .select('*')
        .order('date_posted', { ascending: false })
        .limit(100);

      if (filters.keyword) {
        query = query.or(`job_title.ilike.%${filters.keyword}%,job_description.ilike.%${filters.keyword}%`);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.sourceSite) {
        query = query.eq('source_site', filters.sourceSite);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setInternships(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch internships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [filters]);

  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({ keyword: '', location: '', sourceSite: '' });
  };

  return {
    internships,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refetch: fetchInternships
  };
};