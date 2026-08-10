import { CITY_PROFILES, type CityProfile } from '../data/globalLocationProfiles';

export const getCityProfiles = async (): Promise<CityProfile[]> => {
  return CITY_PROFILES;
};

export const getCityProfileById = async (id: string): Promise<CityProfile | undefined> => {
  return CITY_PROFILES.find(profile => profile.id === id);
};

export const searchCityProfiles = async (query: string): Promise<CityProfile[]> => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return CITY_PROFILES.filter(profile => (
    profile.city.toLowerCase().includes(normalized) ||
    profile.region.toLowerCase().includes(normalized) ||
    profile.country.toLowerCase().includes(normalized)
  ));
};

export const getComparisonList = async (baseId: string, limit = 10): Promise<CityProfile[]> => {
  const base = CITY_PROFILES.find(profile => profile.id === baseId);
  const sorted = CITY_PROFILES
    .filter(profile => profile.id !== baseId)
    .sort((a, b) => b.engagementScore - a.engagementScore);
  if (!base) return sorted.slice(0, limit);
  return sorted.slice(0, limit);
};

export const getHiddenGems = async (limit = 5): Promise<CityProfile[]> => {
  return [...CITY_PROFILES]
    .sort((a, b) => b.overlookedScore - a.overlookedScore)
    .slice(0, limit);
};

