import { useState, useEffect } from 'react';
import { supabase, ScrapeLog } from '../lib/supabase';

export const useLastUpdate = () => {
  const [lastUpdate, setLastUpdate] = useState<ScrapeLog | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLastUpdate = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scrape_logs')
        .select('*')
        .order('scrape_start', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      setLastUpdate(data);
    } catch (err) {
      console.error('Error fetching last update:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLastUpdate();

    const interval = setInterval(fetchLastUpdate, 60000);

    return () => clearInterval(interval);
  }, []);

  return { lastUpdate, loading, refetch: fetchLastUpdate };
};