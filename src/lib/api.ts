import { Internship, StatisticsApiResponse } from './types';

const BASE_API_URL = 'http://localhost:8000';

interface InternshipsResponse {
  count: number;
  limit: number;
  offset: number;
  data: Internship[];
}

interface SearchResponse {
  count: number;
  data: Internship[];
}

async function apiFetch<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${BASE_API_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Échec de la récupération pour ${endpoint}:`, error);
    throw error;
  }
}

export const fetchInternships = (limit: number = 50, offset: number = 0): Promise<InternshipsResponse> => {
  return apiFetch<InternshipsResponse>(`/internships?limit=${limit}&offset=${offset}`);
};

export const searchInternships = (
  keyword: string,
  location: string,
  sourceSite: string,
  limit: number = 200
): Promise<SearchResponse> => {
  const params = new URLSearchParams();
  if (keyword) params.append('keyword', keyword);
  if (location) params.append('location', location);
  if (sourceSite) params.append('source_site', sourceSite);
  params.append('limit', limit.toString());

  return apiFetch<SearchResponse>(`/internships/search?${params.toString()}`);
};

export const fetchStatistics = (): Promise<StatisticsApiResponse> => {
  return apiFetch<StatisticsApiResponse>('/internships/stats');
};

export const fetchLastUpdate = (): Promise<any> => {
  return apiFetch<any>('/stats/last_update');
};
