import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Globe, Landmark, Target, ArrowLeft, Download, Database, Users, TrendingUp, Plane, Ship, Zap, Calendar, Newspaper, ExternalLink, MapPin, Clock, DollarSign, Briefcase, GraduationCap, Factory, Activity, ChevronDown, ChevronUp, FileText, Award, History, Rocket, Search, Loader2, AlertCircle, CheckCircle2, BookOpen, Link2, BarChart3, Shield, Building2, AlertTriangle, Leaf, Scale, TrendingDown, Info } from 'lucide-react';
import { CITY_PROFILES, type CityLeader, type CityProfile } from '../data/globalLocationProfiles';
import { getCityProfiles, searchCityProfiles } from '../services/globalLocationService';
import { multiSourceResearch, type ResearchProgress, type MultiSourceResult, type SourceCitation, type SimilarCity } from '../services/multiSourceResearchService_v2';
import { fetchGovernmentLeaders, getRegionalComparisons, type GovernmentLeader, type RegionalComparisonSet } from '../services/governmentDataService';

// Helper components declared outside main component to avoid re-creation on render
const ScoreBar: React.FC<{ label: string; value: number; max?: number }> = ({ label, value, max = 100 }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[11px]">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-200">{value}/{max}</span>
    </div>
    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: 'connected' | 'pending' | 'offline' }> = ({ status }) => {
  const colors = {
    connected: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    pending: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    offline: 'bg-red-500/20 text-red-300 border-red-500/40'
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ProjectBadge: React.FC<{ status: 'completed' | 'ongoing' | 'planned' }> = ({ status }) => {
  const colors = {
    completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    ongoing: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    planned: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
  };
  return (
    <span className={`text-[9px] px-2 py-0.5 rounded-full border ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const SectionHeader: React.FC<{ icon: React.ElementType; title: string; color?: string }> = ({ icon: Icon, title, color = 'text-amber-400' }) => (
  <div className="flex items-center gap-3 mb-4">
    <Icon className={`w-5 h-5 ${color}`} />
    <h3 className="text-sm font-semibold uppercase tracking-wider">{title}</h3>
  </div>
);

const buildNarrative = (profile: CityProfile) => {
  // Check if we have live Wikipedia data (stored in _rawWikiExtract) - reserved for future use
  const _wikiExtract = (profile as unknown as { _rawWikiExtract?: string })._rawWikiExtract;
  void _wikiExtract; // Will be used for enhanced narratives
  
  const knownFor = profile.knownFor?.slice(0, 3).join(', ') || 'strategic trade and regional services';
  const sectors = profile.keySectors?.slice(0, 4).join(', ') || 'diversified commerce and services';
  const access = profile.globalMarketAccess || 'regional corridors and maritime routes';
  const established = profile.established || 'historical settlement period';
  const climate = profile.climate || 'regional climate zone';
  const population = profile.demographics?.population || 'verified population baseline';
  const gdp = profile.economics?.gdpLocal || 'local GDP baseline';
  const trade = profile.economics?.tradePartners?.slice(0, 3).join(', ') || 'regional trade partners';

  const overview = [
    `${profile.city} anchors ${profile.region} as a strategic urban node within ${profile.country}. Established ${established}, the city evolved around ${knownFor}, creating a durable economic base that continues to shape investment priorities and governance focus today.`,
    `The city's modern economy is driven by ${sectors}, supported by access to ${access}. This access underpins trade and logistics viability, while the local climate (${climate}) influences infrastructure resilience planning and long-term development sequencing.`,
    `Current macro indicators - including population ${population} and GDP ${gdp}a"frame the capacity of the local market and workforce, while trade relationships with ${trade} provide external demand signals that validate opportunity sizing.`
  ];

  const historical = [
    `Historically, ${profile.city} grew as a regional interchange point, shaped by governance reforms, commercial expansion, and infrastructure investments that tied it to wider national priorities. These historical phases created today's institutional footprint across ports, trade corridors, and civic administration.`,
    `The city's evolution has produced layered administrative capabilities that now influence permitting speed, public-private partnership readiness, and the reliability of long-term policy execution. This history matters because it explains why present-day outcomes are feasible within existing local institutions.`,
    `Taken together, the historical arc supports a defensible thesis: ${profile.city} has repeatedly converted strategic geography into sustained economic utility - a core prerequisite for regional investment and partnership alignment.`
  ];

  return { overview, historical };
};

const buildStaticMapUrl = (lat: number, lon: number, zoom: number, width = 650, height = 450) =>
  `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=${zoom}&size=${width}x${height}&markers=${lat},${lon},red-pushpin`;

interface GlobalLocationIntelligenceProps {
  onBack?: () => void;
  onOpenCommandCenter?: () => void;
}

const GlobalLocationIntelligence: React.FC<GlobalLocationIntelligenceProps> = ({ onBack, onOpenCommandCenter }) => {
  // Core state - starts EMPTY, no pre-selection
  const [profiles, setProfiles] = useState<CityProfile[]>(CITY_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [activeLeader, setActiveLeader] = useState<CityLeader | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityProfile[]>([]);
  const [hasSelection, setHasSelection] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  // Live research state
  const [isResearching, setIsResearching] = useState(false);
  const [researchProgress, setResearchProgress] = useState<ResearchProgress | null>(null);
  const [liveProfile, setLiveProfile] = useState<CityProfile | null>(null);
  const [researchResult, setResearchResult] = useState<MultiSourceResult | null>(null);
  
  // Government data state
  const [governmentLeaders, setGovernmentLeaders] = useState<GovernmentLeader[]>([]);
  const [isLoadingGovernmentData, setIsLoadingGovernmentData] = useState(false);
  const [regionalComparisons, setRegionalComparisons] = useState<RegionalComparisonSet | null>(null);
  const [isLoadingComparisons, setIsLoadingComparisons] = useState(false);
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    economy: true,
    infrastructure: true,
    demographics: true,
    leadership: true,
    live: true,
    sources: true,
    similar: true,
    narratives: true,
    regional: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Handle search results filtering
  useEffect(() => {
    const runSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      const results = await searchCityProfiles(searchQuery);
      setSearchResults(results);
    };
    runSearch();
  }, [searchQuery]);

  // Get active profile (either from existing data or live research)
  const activeProfile = useMemo(() => {
    if (liveProfile && hasSelection && !activeProfileId) {
      return liveProfile;
    }
    if (!activeProfileId) return null;
    return profiles.find(profile => profile.id === activeProfileId) || null;
  }, [activeProfileId, profiles, liveProfile, hasSelection]);

  const leadershipRanking = useMemo(() => {
    if (!activeProfile?.leaders?.length) return [];
    return [...activeProfile.leaders].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [activeProfile]);

  const internationalLead = useMemo(() => {
    if (!leadershipRanking.length) return null;
    return leadershipRanking.find(l => l.internationalEngagementFocus) || leadershipRanking[0];
  }, [leadershipRanking]);

  const keyOfficials = useMemo(() => {
    const officials: Array<{
      name: string;
      role: string;
      tenure?: string;
      sourceUrl?: string;
      verified?: boolean;
      sourceLabel?: string;
    }> = [];

    if (governmentLeaders?.length) {
      governmentLeaders.forEach((leader) => {
        if (!leader?.name || !leader?.role) return;
        officials.push({
          name: leader.name,
          role: leader.role,
          tenure: leader.tenure,
          sourceUrl: leader.sourceUrl,
          verified: leader.verified,
          sourceLabel: leader.website
        });
      });
    }

    if (activeProfile?.leaders?.length) {
      activeProfile.leaders.forEach((leader) => {
        if (!leader?.name || !leader?.role) return;
        officials.push({
          name: leader.name,
          role: leader.role,
          tenure: leader.tenure,
          sourceUrl: leader.sourceUrl,
          verified: leader.photoVerified
        });
      });
    }

    const priorityRoles = ['mayor', 'governor', 'senator', 'president', 'premier', 'minister', 'secretary', 'chair', 'commissioner'];
    const seen = new Set<string>();

    const normalized = officials
      .map((o) => ({
        ...o,
        roleLower: o.role?.toLowerCase() || ''
      }))
      .filter((o) => {
        const key = `${o.name}-${o.role}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    const prioritized = normalized.filter((o) =>
      priorityRoles.some((role) => o.roleLower.includes(role))
    );

    return (prioritized.length ? prioritized : normalized).slice(0, 6);
  }, [governmentLeaders, activeProfile]);

  const safetyProxyScore = useMemo(() => {
    if (!activeProfile) return null;
    const stability = activeProfile.politicalStability ?? 50;
    const reg = activeProfile.regulatoryFriction ?? 50;
    return Math.round((stability * 0.6) + ((100 - reg) * 0.4));
  }, [activeProfile]);

  const outlookLabel = useMemo(() => {
    if (!activeProfile) return 'Not available';
    const momentum = activeProfile.investmentMomentum ?? 0;
    if (momentum >= 70) return 'Accelerating';
    if (momentum >= 55) return 'Stable';
    return 'Developing';
  }, [activeProfile]);

  // Handle search submission - LIVE SEARCH
  const handleSearchSubmit = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // ALWAYS do live research - never use static placeholder data
    setHasSelection(true);
    setActiveProfileId(null);
    setLiveProfile(null);
    setResearchResult(null);
    setSearchQuery('');
    setSearchResults([]);
    setLoadingError(null);
    setIsResearching(true);
    setResearchProgress({ stage: 'Initializing', progress: 0, message: 'Starting multi-source research...' });
    
    try {
      // Use multi-source research - WORLD BANK, GOVERNMENT SOURCES
      const result = await multiSourceResearch(trimmedQuery, (progress) => {
        setResearchProgress(progress);
      });
      
      if (result) {
        setLiveProfile(result.profile);
        setResearchResult(result);
        setResearchProgress({ stage: 'Complete', progress: 100, message: `Research complete! ${result.sources.length} sources compiled.` });
      } else {
        setLoadingError(`Could not find location "${trimmedQuery}". Please try a different search term.`);
        setHasSelection(false);
      }
    } catch (error) {
      console.error('Multi-source research error:', error);
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      if (isNetworkError || !navigator.onLine) {
        setLoadingError('Unable to connect to research services. Please check your internet connection.');
      } else {
        setLoadingError('Research failed. Please try again.');
      }
      setHasSelection(false);
    } finally {
      setIsResearching(false);
    }
  }, []);

  // Load existing profiles and check for cached research results
  useEffect(() => {
    const loadProfiles = async () => {
      const data = await getCityProfiles();
      setProfiles(data);
      
      // Check for CACHED research result FIRST (highest priority - prevents duplicate research)
      const cachedResearch = localStorage.getItem('gli-cached-research');
      const target = localStorage.getItem('gli-target');
      
      if (cachedResearch && target) {
        try {
          const result = JSON.parse(cachedResearch);
          if (result && result.profile) {
            // Use cached result - NO NEW RESEARCH NEEDED
            setHasSelection(true);
            setLiveProfile(result.profile);
            setResearchResult(result);
            setSearchQuery('');
            setSearchResults([]);
            setResearchProgress({ stage: 'Complete', progress: 100, message: `Report loaded from cache: ${result.sources.length} sources.` });
            
            // Clean up cache keys after using them
            localStorage.removeItem('gli-target');
            localStorage.removeItem('gli-cached-research');
            
            return; // EXIT - DON'T DO NEW RESEARCH
          }
        } catch (e) {
          console.warn('Failed to parse cached research:', e);
          // Fall through to normal search
        }
      }
      
      // Fallback: if no cached result, search using gli-target location name
      if (target) {
        localStorage.removeItem('gli-target');
        localStorage.removeItem('gli-cached-research');
        setTimeout(() => {
          handleSearchSubmit(target);
        }, 0);
      }
    };
    loadProfiles();
  }, [handleSearchSubmit]);


  // Clear selection and reset to global view
  const handleClearSelection = () => {
    setActiveProfileId(null);
    setHasSelection(false);
    setLiveProfile(null);
    setResearchResult(null);
    setIsResearching(false);
    setResearchProgress(null);
    setLoadingError(null);
    setGovernmentLeaders([]);
    setRegionalComparisons(null);
  };

  // Auto-scroll to top when a profile is selected
  useEffect(() => {
    if (hasSelection && activeProfile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hasSelection, activeProfile]);

  // Fetch real-time government data and regional comparisons when profile is selected
  useEffect(() => {
    if (!activeProfile) return;

    const fetchEnrichedData = async () => {
      try {
        // Fetch current government leaders
        setIsLoadingGovernmentData(true);
        const leaders = await fetchGovernmentLeaders(activeProfile.city, activeProfile.country);
        setGovernmentLeaders(leaders);
      } catch (error) {
        console.error('Error fetching government leaders:', error);
      } finally {
        setIsLoadingGovernmentData(false);
      }

      try {
        // Fetch regional comparisons
        setIsLoadingComparisons(true);
        const nearbyLocations = profiles.filter(
          p => p.region === activeProfile.region && p.id !== activeProfile.id
        );
        
        if (nearbyLocations.length > 0) {
          const comparisons = await getRegionalComparisons(activeProfile, nearbyLocations);
          setRegionalComparisons(comparisons);
        }
      } catch (error) {
        console.error('Error fetching regional comparisons:', error);
      } finally {
        setIsLoadingComparisons(false);
      }
    };

    fetchEnrichedData();
  }, [activeProfile, profiles]);

  const computeCompositeScore = (profile: CityProfile | Partial<CityProfile>) => {
    if (!profile.infrastructureScore) return 0;
    const normalizedCost = 100 - Math.min(profile.costOfDoing || 50, 100);
    const normalizedReg = 100 - Math.min(profile.regulatoryFriction || 50, 100);
    const score = (
      (profile.infrastructureScore || 50) * 0.2 +
      normalizedReg * 0.2 +
      (profile.politicalStability || 50) * 0.15 +
      (profile.laborPool || 50) * 0.15 +
      normalizedCost * 0.15 +
      (profile.investmentMomentum || 50) * 0.15
    );
    return Math.round(score);
  };

  const deriveNeeds = (profile: CityProfile) => {
    const needs: string[] = [];
    if (profile.infrastructureScore < 70) needs.push('Infrastructure modernization and utilities reliability upgrades');
    if (profile.regulatoryFriction > 50) needs.push('Permitting acceleration and regulatory simplification');
    if (profile.laborPool < 65) needs.push('Workforce development and vocational pipeline expansion');
    if (profile.investmentMomentum < 65) needs.push('Investor outreach, incentives packaging, and deal facilitation');
    if (profile.costOfDoing > 60) needs.push('Cost optimization offsets or targeted incentive relief');
    if (needs.length === 0) needs.push('Maintain momentum; prioritize strategic partnerships and regional expansion');
    return needs;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCityBrief = (profile: CityProfile) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${profile.city} Intelligence Brief</title>
<style>
body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
h1 { margin-bottom: 4px; }
h2 { margin-top: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
ul { margin: 0 0 12px 16px; }
.meta { color: #475569; font-size: 14px; }
.badge { display: inline-block; background: #fbbf24; color: #000; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: bold; }
.section { margin-bottom: 20px; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; }
th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 13px; }
th { background: #f1f5f9; }
</style>
</head>
<body>
  <h1>${profile.city} Intelligence Brief</h1>
  <div class="meta">${profile.region} * ${profile.country}</div>
  <div class="meta">Established: ${profile.established} | Timezone: ${profile.timezone || 'N/A'}</div>
  <p class="badge">Composite Score: ${computeCompositeScore(profile)} / 100</p>
  
  <h2>Quick Facts</h2>
  <table>
    <tr><th>Area</th><td>${profile.areaSize || 'N/A'}</td><th>Climate</th><td>${profile.climate || 'N/A'}</td></tr>
    <tr><th>Currency</th><td>${profile.currency || 'N/A'}</td><th>Business Hours</th><td>${profile.businessHours || 'N/A'}</td></tr>
  </table>

  <h2>Known For</h2>
  <ul>${profile.knownFor.map(item => `<li>${item}</li>`).join('')}</ul>
  
  <h2>Strategic Advantages</h2>
  <ul>${profile.strategicAdvantages.map(item => `<li>${item}</li>`).join('')}</ul>
  
  <h2>Key Sectors</h2>
  <ul>${profile.keySectors.map(item => `<li>${item}</li>`).join('')}</ul>
  
  <h2>Investment Programs</h2>
  <ul>${profile.investmentPrograms.map(item => `<li>${item}</li>`).join('')}</ul>
  
  <h2>Foreign Companies Present</h2>
  <ul>${profile.foreignCompanies.map(item => `<li>${item}</li>`).join('')}</ul>

  ${profile.economics ? `
  <h2>Economic Data</h2>
  <table>
    <tr><th>Local GDP</th><td>${profile.economics.gdpLocal || 'N/A'}</td></tr>
    <tr><th>GDP Growth</th><td>${profile.economics.gdpGrowthRate || 'N/A'}</td></tr>
    <tr><th>Employment Rate</th><td>${profile.economics.employmentRate || 'N/A'}</td></tr>
    <tr><th>Average Income</th><td>${profile.economics.avgIncome || 'N/A'}</td></tr>
    <tr><th>Export Volume</th><td>${profile.economics.exportVolume || 'N/A'}</td></tr>
    <tr><th>Top Exports</th><td>${profile.economics.topExports?.join(', ') || 'N/A'}</td></tr>
    <tr><th>Trade Partners</th><td>${profile.economics.tradePartners?.join(', ') || 'N/A'}</td></tr>
  </table>
  ` : ''}

  ${profile.demographics ? `
  <h2>Demographics</h2>
  <table>
    <tr><th>Population</th><td>${profile.demographics.population}</td></tr>
    <tr><th>Population Growth</th><td>${profile.demographics.populationGrowth || 'N/A'}</td></tr>
    <tr><th>Median Age</th><td>${profile.demographics.medianAge || 'N/A'}</td></tr>
    <tr><th>Literacy Rate</th><td>${profile.demographics.literacyRate || 'N/A'}</td></tr>
    <tr><th>Working Age Population</th><td>${profile.demographics.workingAgePopulation || 'N/A'}</td></tr>
    <tr><th>Universities/Colleges</th><td>${profile.demographics.universitiesColleges || 'N/A'}</td></tr>
    <tr><th>Graduates/Year</th><td>${profile.demographics.graduatesPerYear || 'N/A'}</td></tr>
  </table>
  ` : ''}

  <h2>Leadership</h2>
  <ul>${profile.leaders.map(leader => `<li><strong>${leader.role}:</strong> ${leader.name} (${leader.tenure}) - Rating: ${leader.rating.toFixed(1)}/10</li>`).join('')}</ul>

  ${profile.taxIncentives ? `
  <h2>Tax Incentives</h2>
  <ul>${profile.taxIncentives.map(item => `<li>${item}</li>`).join('')}</ul>
  ` : ''}

  <h2>Government Sources</h2>
  <ul>${profile.governmentLinks?.map(link => `<li><a href="${link.url}">${link.label}</a></li>`).join('') || 'N/A'}</ul>

  <hr style="margin-top: 40px;">
  <p style="font-size: 11px; color: #64748b;">Generated by BWGA Ai Global Location Intelligence | ${new Date().toISOString()}</p>
</body>
</html>`;
    downloadFile(html, `${profile.city}-intelligence-brief.html`, 'text/html');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-400">Global Location Intelligence</p>
            <h1 className="text-2xl font-semibold">Location Intelligence Report</h1>
          </div>
          <div className="flex gap-2">
            {onOpenCommandCenter && (
              <button
                onClick={onOpenCommandCenter}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-white/20 rounded-lg hover:border-amber-400 hover:text-amber-300"
              >
                Command Center
              </button>
            )}
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-200 border border-amber-500/40 rounded-lg hover:bg-amber-500/30"
              >
                <ArrowLeft className="inline w-3 h-3 mr-2" /> Back to OS
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search Bar */}
        <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <label className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold">
                <Search className="inline w-3 h-3 mr-1" />
                Search Any Location Worldwide
              </label>
              <div className="mt-2 relative">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSearchSubmit(searchQuery);
                    }
                  }}
                  placeholder="Enter any city, region, or country (e.g., Tokyo, Paris, Sydney, Manila)..."
                  className="w-full px-4 py-3 text-sm rounded-lg border border-white/10 bg-black/40 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  disabled={isResearching}
                />
                <button
                  onClick={() => handleSearchSubmit(searchQuery)}
                  disabled={!searchQuery.trim() || isResearching}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Research'}
                </button>
                {searchResults.length > 0 && !isResearching && (
                  <div className="absolute z-10 mt-2 w-full bg-[#0a0a0a] border border-white/10 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    <div className="px-3 py-2 text-[10px] uppercase text-slate-500 border-b border-white/10">
                      Matching Locations (Click to research live)
                    </div>
                    {searchResults.map(result => (
                      <button
                        key={result.id}
                        onClick={() => handleSearchSubmit(`${result.city}, ${result.country}`)}
                        className="w-full text-left px-4 py-3 hover:bg-amber-500/10 border-b border-white/5 last:border-b-0"
                      >
                        <div className="text-white font-semibold">{result.city}</div>
                        <div className="text-[11px] text-slate-400">{result.region} * {result.country}</div>
                      </button>
                    ))}
                    <button
                      onClick={() => handleSearchSubmit(searchQuery)}
                      className="w-full text-left px-4 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300"
                    >
                      <div className="font-semibold">📄 Research "{searchQuery}" with AI Agent</div>
                      <div className="text-[10px] text-purple-400">Search globally for any location not in database</div>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-slate-500">
              {isResearching
                ? <span className="text-purple-400 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> AI Agent researching...</span>
                : hasSelection && activeProfile
                  ? <span className="text-emerald-400">✓ Viewing: {activeProfile.city}, {activeProfile.country}</span>
                  : 'Enter any location worldwide to generate intelligence report'}
            </div>
          </div>
          {hasSelection && (
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={handleClearSelection}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Clear Selection & Search New Location
              </button>
            </div>
          )}
        </div>

        {/* Error Banner */}
        {loadingError && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-red-300 font-semibold mb-1">Connection Error</div>
              <div className="text-sm text-red-200/80">{loadingError}</div>
              {!navigator.onLine && (
                <div className="mt-2 text-xs text-red-300/60 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  You appear to be offline. Global Location Intelligence requires internet connection.
                </div>
              )}
            </div>
            <button
              onClick={() => setLoadingError(null)}
              className="text-red-400 hover:text-red-300 text-xs px-3 py-1 border border-red-500/40 rounded-lg hover:bg-red-500/20"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Map Section - Dynamic Focus */}
        <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold">
                {hasSelection && activeProfile 
                  ? `${activeProfile.city} - Regional View` 
                  : 'Global Map - Select or Search a Location'}
              </h2>
            </div>
            {hasSelection && activeProfile && (
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span><MapPin className="inline w-3 h-3 mr-1" />{activeProfile.latitude?.toFixed(4) || 'N/A'}, {activeProfile.longitude?.toFixed(4) || 'N/A'}</span>
                <span><Clock className="inline w-3 h-3 mr-1" />{activeProfile.timezone || 'N/A'}</span>
              </div>
            )}
          </div>
          {/* Static Map - Single Regional View */}
          <div className="mb-4">
            {activeProfile?.latitude && activeProfile?.longitude ? (
              <div className="h-[260px] rounded-xl border border-slate-800 overflow-hidden bg-slate-900 relative">
                <img
                  src={buildStaticMapUrl(activeProfile.latitude, activeProfile.longitude, 10, 900, 260)}
                  alt={`Map of ${activeProfile.city}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/900x260?text=Map+Unavailable';
                  }}
                />
                <div className="absolute top-3 left-3 bg-black/70 text-[10px] text-slate-200 px-2 py-1 rounded flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> {activeProfile.city}, {activeProfile.country}
                </div>
                <div className="absolute bottom-3 right-3 bg-black/70 text-[10px] text-slate-200 px-2 py-1 rounded">
                  {activeProfile.latitude?.toFixed(4)} degrees, {activeProfile.longitude?.toFixed(4)} degrees
                </div>
              </div>
            ) : (
              <div className="h-[180px] rounded-xl border border-slate-800 overflow-hidden bg-slate-900 flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Search for a location to view map</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Research Progress Panel */}
        {isResearching && researchProgress && (
          <div className="bg-[#0f0f0f] border border-purple-500/30 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Database className="w-5 h-5 text-purple-400" />
                  <Loader2 className="w-3 h-3 text-purple-300 absolute -bottom-1 -right-1 animate-spin" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-purple-300">Deep Research in Progress</h2>
                  <p className="text-xs text-slate-400">{researchProgress?.message || 'Researching...'}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">{Math.round(researchProgress?.progress || 0)}%</div>
                <div className="text-[10px] text-slate-400 uppercase">{researchProgress?.stage || 'initializing'}</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-300 rounded-full transition-all duration-500"
                style={{ width: `${researchProgress?.progress || 0}%` }}
              />
            </div>
            
            {/* Research Stages */}
            <div className="grid md:grid-cols-6 gap-2 mb-4">
              {['Initializing Research', 'Gathering Intelligence', 'Leadership Research', 'Economic Analysis', 'News & Developments', 'Compiling Report'].map((stage, idx) => {
                const stages = ['Initializing Research', 'Gathering Intelligence', 'Leadership Research', 'Economic Analysis', 'News & Developments', 'Compiling Report', 'Comparative Analysis', 'Complete'];
                const currentIdx = stages.findIndex(s => researchProgress?.stage?.includes(s.split(' ')[0]) || researchProgress?.stage === s);
                const stageStatus = idx < currentIdx ? 'complete' : idx === currentIdx ? 'active' : 'pending';
                return (
                  <div 
                    key={stage}
                    className={`p-2 rounded-lg border text-xs text-center ${
                      stageStatus === 'complete'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : stageStatus === 'active'
                          ? 'border-purple-500/30 bg-purple-500/10 text-purple-300'
                          : 'border-slate-700 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {stageStatus === 'complete' && <CheckCircle2 className="w-3 h-3" />}
                      {stageStatus === 'active' && <Loader2 className="w-3 h-3 animate-spin" />}
                      {stageStatus === 'pending' && <Clock className="w-3 h-3" />}
                      <span className="text-[10px]">{stage.split(' ')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Research Status */}
            <div className="bg-black/40 rounded-lg p-3 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">a - </span>
                <span>Searching government websites, World Bank, and official sources...</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-blue-400">a - </span>
                <span>Cross-referencing data from international organizations</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-amber-400">a - </span>
                <span>Compiling verified economic data and leadership profiles</span>
              </div>
              {researchProgress?.substage && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-purple-400">a'</span>
                  <span className="text-purple-300">Currently: {researchProgress.substage}</span>
                </div>
              )}
              {researchProgress?.sourcesFound && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-cyan-400">✓</span>
                  <span className="text-cyan-300">{researchProgress.sourcesFound} authoritative sources found</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State - No Selection */}
        {!hasSelection && !isResearching && (
          <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-12 mb-6 text-center">
            <Globe className="w-16 h-16 text-amber-400/30 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">Global Location Intelligence</h2>
            <p className="text-slate-400 max-w-lg mx-auto mb-6">
              Search for any location worldwide to generate a comprehensive intelligence report. 
              Our AI agent will research leadership, economy, infrastructure, demographics, and more.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <span className="text-[11px] px-3 py-1.5 bg-slate-800 rounded-full text-slate-300">🇵🇭 Philippines</span>
              <span className="text-[11px] px-3 py-1.5 bg-slate-800 rounded-full text-slate-300">🇦🇺 Australia</span>
              <span className="text-[11px] px-3 py-1.5 bg-slate-800 rounded-full text-slate-300">🇯🇵 Japan</span>
              <span className="text-[11px] px-3 py-1.5 bg-slate-800 rounded-full text-slate-300">🇺🇸 USA</span>
              <span className="text-[11px] px-3 py-1.5 bg-slate-800 rounded-full text-slate-300">🇬🇧 UK</span>
              <span className="text-[11px] px-3 py-1.5 bg-slate-800 rounded-full text-slate-300">🇩🇪 Germany</span>
              <span className="text-[11px] px-3 py-1.5 bg-slate-800 rounded-full text-slate-300">🌍 Any Location</span>
            </div>
            
            {/* Quick Access to Existing Profiles */}
            {profiles.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-4">Quick Access: Search Locations</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {profiles.slice(0, 6).map(profile => (
                    <button
                      key={profile.id}
                      onClick={() => handleSearchSubmit(`${profile.city}, ${profile.country}`)}
                      className="px-4 py-2 text-sm bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 text-amber-300"
                    >
                      {profile.city}, {profile.country}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {hasSelection && activeProfile ? (
          <div className="space-y-6">
            {/* Report Header Banner */}
            <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-amber-600/20 border border-amber-500/30 rounded-2xl px-6 py-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="text-sm font-semibold uppercase tracking-wider text-amber-200">Location Intelligence Report</span>
                    <p className="text-xs text-slate-400">Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                <button
                  onClick={() => exportCityBrief(activeProfile)}
                  className="px-4 py-2 text-xs font-semibold bg-amber-500/20 border border-amber-400/50 text-amber-200 rounded-lg hover:bg-amber-500/30 flex items-center gap-2"
                >
                  <Download className="w-3 h-3" /> Export PDF
                </button>
              </div>
            </div>

            {/* City Header with Quick Facts */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-white">{activeProfile.city}</h1>
                  <p className="text-slate-400 text-lg">{activeProfile.region} * {activeProfile.country}</p>
                  <p className="text-xs text-slate-500 mt-1">Est. {activeProfile.established} * {activeProfile.timezone}</p>
                  {researchResult?.dataQuality && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] px-2 py-1 rounded-full ${
                        researchResult.dataQuality.completeness >= 70 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        researchResult.dataQuality.completeness >= 40 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        Data Quality: {researchResult.dataQuality.completeness}%
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {researchResult.dataQuality.governmentSourcesUsed + researchResult.dataQuality.internationalSourcesUsed + researchResult.dataQuality.newsSourcesUsed} sources
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        researchResult.dataQuality.primarySourcePercentage >= 60 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {researchResult.dataQuality.primarySourcePercentage}% primary
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-amber-400">{computeCompositeScore(activeProfile)}</div>
                  <div className="text-[10px] text-slate-400 uppercase">Composite Score</div>
                </div>
              </div>

              {/* Quick Navigation / Table of Contents */}
              <div className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 mb-6">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                  <span className="font-semibold text-slate-300 mr-2">Sections:</span>
                  <span className="text-amber-400">Executive Summary</span>
                  <span className="text-slate-600">a'</span>
                  <span className="hover:text-amber-400 cursor-pointer">Government</span>
                  <span className="text-slate-600">a'</span>
                  <span className="hover:text-amber-400 cursor-pointer">Economy</span>
                  <span className="text-slate-600">a'</span>
                  <span className="hover:text-amber-400 cursor-pointer">Demographics</span>
                  <span className="text-slate-600">a'</span>
                  <span className="hover:text-amber-400 cursor-pointer">Infrastructure</span>
                  <span className="text-slate-600">a'</span>
                  <span className="hover:text-amber-400 cursor-pointer">Contact Directory</span>
                </div>
              </div>

              {/* ===================== EXECUTIVE SUMMARY ===================== */}
              <div className="bg-gradient-to-br from-amber-500/10 via-slate-900/50 to-purple-500/10 border border-amber-500/30 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Executive Summary</h3>
                      <p className="text-xs text-slate-400">AI-Generated Intelligence Brief</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-400">Report Generated</div>
                    <div className="text-xs text-amber-300">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
                  <div className="bg-black/40 rounded-xl p-3 text-center border border-amber-500/20">
                    <div className="text-2xl font-bold text-amber-400">{computeCompositeScore(activeProfile)}</div>
                    <div className="text-[10px] text-slate-400 uppercase mt-1">Overall Score</div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-3 text-center border border-slate-700">
                    <div className="text-2xl font-bold text-white">{activeProfile.infrastructureScore || 'N/A'}</div>
                    <div className="text-[10px] text-slate-400 uppercase mt-1">Infrastructure</div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-3 text-center border border-slate-700">
                    <div className="text-2xl font-bold text-white">{activeProfile.politicalStability || 'N/A'}</div>
                    <div className="text-[10px] text-slate-400 uppercase mt-1">Stability</div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-3 text-center border border-slate-700">
                    <div className="text-2xl font-bold text-white">{activeProfile.laborPool || 'N/A'}</div>
                    <div className="text-[10px] text-slate-400 uppercase mt-1">Labor Pool</div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-3 text-center border border-slate-700">
                    <div className="text-2xl font-bold text-white">{activeProfile.investmentMomentum || 'N/A'}</div>
                    <div className="text-[10px] text-slate-400 uppercase mt-1">Momentum</div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-3 text-center border border-slate-700">
                    <div className="text-2xl font-bold text-white">{100 - (activeProfile.regulatoryFriction || 50)}</div>
                    <div className="text-[10px] text-slate-400 uppercase mt-1">Reg. Ease</div>
                  </div>
                </div>

                {/* Neutrality & Purpose */}
                <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 mb-4">
                  <div className="text-[11px] uppercase tracking-wider text-slate-300 mb-2 font-semibold flex items-center gap-2">
                    <Info className="w-4 h-4" /> Neutrality & Purpose
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    This report compiles publicly available data for location research. It does not express system opinions or endorsements,
                    and it is not a recommendation. Verify all critical details with official sources.
                  </p>
                </div>

                {/* Current Leadership - PROMINENT */}
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-4">
                  <div className="text-[11px] uppercase tracking-wider text-purple-300 mb-3 font-semibold flex items-center gap-2">
                    <Landmark className="w-4 h-4" /> Current Government Leadership
                  </div>
                  {activeProfile.leaders && activeProfile.leaders.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-3">
                      {activeProfile.leaders.slice(0, 4).map((leader, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/40 to-purple-600/40 flex items-center justify-center text-lg font-bold text-white">
                            {leader.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white truncate">{leader.name || 'Not verified'}</div>
                            <div className="text-xs text-purple-300">{leader.role}</div>
                            <div className="text-[10px] text-slate-500">{leader.tenure}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 p-3 bg-black/30 rounded-lg">
                      Leadership data being compiled from official government sources...
                    </div>
                  )}
                </div>

                {/* Key Officials & Points of Contact */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                  <div className="text-[11px] uppercase tracking-wider text-blue-300 mb-3 font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Key Officials (Mayor / Governor / Senator / Reference)
                  </div>
                  {keyOfficials.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-3">
                      {keyOfficials.map((official, idx) => (
                        <div key={`${official.name}-${idx}`} className="p-3 bg-black/30 rounded-lg border border-blue-500/20">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-white truncate">{official.name}</div>
                              <div className="text-xs text-blue-300">{official.role}</div>
                              {official.tenure && <div className="text-[10px] text-slate-500">{official.tenure}</div>}
                            </div>
                            {official.verified && (
                              <div className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded border border-emerald-500/40">
                                ✓ Verified
                              </div>
                            )}
                          </div>
                          {official.sourceUrl && (
                            <div className="text-[10px] text-slate-400 mt-2">
                              Source: <a href={official.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{new URL(official.sourceUrl).hostname}</a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400">Key official roles not yet available for this location.</div>
                  )}
                </div>

                {/* Quick Facts Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="p-3 bg-black/30 rounded-lg">
                    <div className="text-[10px] text-slate-400 uppercase">Population</div>
                    <div className="text-sm font-semibold text-white mt-1">{activeProfile.demographics?.population || 'See census data'}</div>
                  </div>
                  <div className="p-3 bg-black/30 rounded-lg">
                    <div className="text-[10px] text-slate-400 uppercase">GDP/Economic Output</div>
                    <div className="text-sm font-semibold text-white mt-1">{activeProfile.economics?.gdpLocal || 'See economic reports'}</div>
                  </div>
                  <div className="p-3 bg-black/30 rounded-lg">
                    <div className="text-[10px] text-slate-400 uppercase">Key Sectors</div>
                    <div className="text-sm font-semibold text-white mt-1">{activeProfile.keySectors?.slice(0, 2).join(', ') || 'Diversified'}</div>
                  </div>
                  <div className="p-3 bg-black/30 rounded-lg">
                    <div className="text-[10px] text-slate-400 uppercase">Coordinates</div>
                    <div className="text-sm font-semibold text-white mt-1">{activeProfile.latitude?.toFixed(2)} degrees, {activeProfile.longitude?.toFixed(2)} degrees</div>
                  </div>
                </div>

                {/* Government Departments & Ease of Doing Business */}
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-black/30 rounded-lg">
                    <div className="text-[10px] text-slate-400 uppercase">Government Departments</div>
                    <div className="text-sm font-semibold text-white mt-1">
                      {activeProfile.departments?.join(', ') || 'See official government portals'}
                    </div>
                  </div>
                  <div className="p-3 bg-black/30 rounded-lg">
                    <div className="text-[10px] text-slate-400 uppercase">Ease of Doing Business</div>
                    <div className="text-sm font-semibold text-white mt-1">
                      {activeProfile.easeOfDoingBusiness || 'See World Bank or official investment authority'}
                    </div>
                  </div>
                </div>

                {/* Data Quality Indicator */}
                {researchResult?.dataQuality && (
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                      <Shield className={`w-5 h-5 ${researchResult.dataQuality.completeness >= 70 ? 'text-emerald-400' : researchResult.dataQuality.completeness >= 40 ? 'text-amber-400' : 'text-red-400'}`} />
                      <div>
                        <div className="text-sm font-semibold text-white">Data Quality: {researchResult.dataQuality.completeness}%</div>
                        <div className="text-xs text-slate-400">
                          {researchResult.dataQuality.governmentSourcesUsed} govt * {researchResult.dataQuality.internationalSourcesUsed} int'l * {researchResult.dataQuality.newsSourcesUsed} news sources
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      Freshness: {researchResult.dataQuality.dataFreshness || 'Current'}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Overview Narrative - Use research result if available */}
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed mb-6">
                {researchResult?.narratives?.overview ? (
                  <>
                    {((researchResult.narratives.overview as unknown as Record<string, unknown>)?.paragraphs as Array<Record<string, unknown>>)?.map((p, idx) => (
                      <p key={`overview-${idx}`}>{(p.text as string)}</p>
                    )) || <p>{((researchResult.narratives.overview as unknown as Record<string, unknown>)?.introduction as string)}</p>}
                  </>
                ) : (
                  <>
                    <p>
                      {activeProfile.city} is known for {activeProfile.knownFor.slice(0, 3).join(', ')} and serves as a strategic hub in {activeProfile.region}. 
                      With direct access via {activeProfile.globalMarketAccess.toLowerCase()}, the city focuses on {activeProfile.keySectors.slice(0, 4).join(', ')}.
                    </p>
                    {buildNarrative(activeProfile).overview.map((paragraph, idx) => (
                      <p key={`overview-${idx}`}>{paragraph}</p>
                    ))}
                  </>
                )}
              </div>

              {/* Historical Context */}
              <div className="bg-black/30 border border-white/10 rounded-xl p-4 mb-6">
                <div className="text-[11px] uppercase tracking-wider text-amber-400 mb-2 font-semibold flex items-center gap-2">
                  <History className="w-4 h-4" /> Historical Context
                </div>
                <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
                  {researchResult?.narratives?.history ? (
                    <>
                      {((researchResult.narratives.history as unknown as Record<string, unknown>)?.paragraphs as Array<Record<string, unknown>>)?.map((p, idx) => (
                        <p key={`history-${idx}`}>{(p.text as string)}</p>
                      )) || <p>{((researchResult.narratives.history as unknown as Record<string, unknown>)?.introduction as string)}</p>}
                    </>
                  ) : (
                    buildNarrative(activeProfile).historical.map((paragraph, idx) => (
                      <p key={`history-${idx}`}>{paragraph}</p>
                    ))
                  )}
                </div>
              </div>

              {/* Economic Analysis */}
              {researchResult?.narratives?.economy && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 mb-6">
                  <div className="text-[11px] uppercase tracking-wider text-emerald-400 mb-2 font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Economic Analysis
                  </div>
                  <div className="text-sm text-slate-300 leading-relaxed space-y-3">
                    {((researchResult.narratives.economy as unknown as Record<string, unknown>)?.paragraphs as Array<Record<string, unknown>>)?.map((p, idx) => (
                      <p key={`econ-${idx}`}>{(p.text as string)}</p>
                    )) || <p>{((researchResult.narratives.economy as unknown as Record<string, unknown>)?.introduction as string)}</p>}
                  </div>
                </div>
              )}

              {/* Governance Context */}
              {researchResult?.narratives?.governance && (
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 mb-6">
                  <div className="text-[11px] uppercase tracking-wider text-purple-400 mb-2 font-semibold flex items-center gap-2">
                    <Landmark className="w-4 h-4" /> Governance Overview
                  </div>
                  <div className="text-sm text-slate-300 leading-relaxed space-y-3">
                    {((researchResult.narratives.governance as unknown as Record<string, unknown>)?.paragraphs as Array<Record<string, unknown>>)?.map((p, idx) => (
                      <p key={`gov-${idx}`}>{(p.text as string)}</p>
                    )) || <p>{((researchResult.narratives.governance as unknown as Record<string, unknown>)?.introduction as string)}</p>}
                  </div>
                </div>
              )}

              {/* Investment Case */}
              {researchResult?.narratives?.investment && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6">
                  <div className="text-[11px] uppercase tracking-wider text-amber-400 mb-2 font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4" /> Investment Case
                  </div>
                  <div className="text-sm text-slate-300 leading-relaxed space-y-3">
                    {((researchResult.narratives.investment as unknown as Record<string, unknown>)?.paragraphs as Array<Record<string, unknown>>)?.map((p, idx) => (
                      <p key={`inv-${idx}`}>{(p.text as string)}</p>
                    )) || <p>{((researchResult.narratives.investment as unknown as Record<string, unknown>)?.introduction as string)}</p>}
                  </div>
                </div>
              )}

              {/* Infrastructure */}
              {researchResult?.narratives?.infrastructure && (
                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4 mb-6">
                  <div className="text-[11px] uppercase tracking-wider text-cyan-400 mb-2 font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Infrastructure & Connectivity
                  </div>
                  <div className="text-sm text-slate-300 leading-relaxed space-y-3">
                    {((researchResult.narratives.infrastructure as unknown as Record<string, unknown>)?.paragraphs as Array<Record<string, unknown>>)?.map((p, idx) => (
                      <p key={`infra-${idx}`}>{(p.text as string)}</p>
                    )) || <p>{((researchResult.narratives.infrastructure as unknown as Record<string, unknown>)?.introduction as string)}</p>}
                  </div>
                </div>
              )}

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
                <div className="text-[11px] uppercase tracking-wider text-emerald-300 mb-2 font-semibold">Evidence & Verification</div>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  {researchResult?.dataQuality?.leaderDataVerified 
                    ? 'Leadership data has been verified against government and official sources. '
                    : 'Leadership data is being compiled from official sources. '}
                  {researchResult?.sources?.length 
                    ? `This report cites ${researchResult.sources.length} sources including ${researchResult.dataQuality?.governmentSourcesUsed || 0} government and ${researchResult.dataQuality?.internationalSourcesUsed || 0} international organizations (World Bank, etc.).`
                    : 'Evidence is derived from official government portals, World Bank data, and verified updates.'}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 border border-slate-800 rounded-lg">
                  <div className="text-slate-400">Area</div>
                  <div className="text-sm font-semibold mt-1">{activeProfile.areaSize || 'N/A'}</div>
                </div>
                <div className="p-3 border border-slate-800 rounded-lg">
                  <div className="text-slate-400">Climate</div>
                  <div className="text-sm font-semibold mt-1">{activeProfile.climate || 'N/A'}</div>
                </div>
                <div className="p-3 border border-slate-800 rounded-lg">
                  <div className="text-slate-400">Currency</div>
                  <div className="text-sm font-semibold mt-1">{activeProfile.currency || 'N/A'}</div>
                </div>
                <div className="p-3 border border-slate-800 rounded-lg">
                  <div className="text-slate-400">Business Hours</div>
                  <div className="text-sm font-semibold mt-1">{activeProfile.businessHours || 'N/A'}</div>
                </div>
              </div>

              {/* One-Stop Intelligence Snapshot */}
              <div className="mt-6 bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                <SectionHeader icon={Database} title="One-Stop Intelligence Snapshot" color="text-amber-400" />
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/50">
                    <div className="text-[11px] uppercase tracking-wider text-purple-300 mb-2 flex items-center gap-2">
                      <Landmark className="w-4 h-4" /> Government & Leadership
                    </div>
                    {leadershipRanking.length > 0 ? (
                      <div className="space-y-2 text-xs text-slate-300">
                        <div className="text-slate-400">Current leadership (top roles):</div>
                        {leadershipRanking.slice(0, 3).map(leader => (
                          <div key={leader.id} className="flex items-center justify-between">
                            <span>{leader.role}: <span className="text-white">{leader.name}</span></span>
                            <span className="text-[10px] text-slate-500">Influence {leader.rating.toFixed(1)}/10</span>
                          </div>
                        ))}
                        <div className="mt-2 text-[11px] text-slate-400">
                          International lead: <span className="text-white">{internationalLead?.name || 'Not verified'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Government sources: {researchResult?.dataQuality?.governmentSourcesUsed ?? 0}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Departments: {activeProfile.departments?.slice(0, 4).join(', ') || 'See official government portals'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Ease of doing business: {activeProfile.easeOfDoingBusiness || 'See World Bank or investment authority'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Official portals: {activeProfile.governmentLinks?.length || 0}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">Leadership data not verified yet.</div>
                    )}
                  </div>

                  <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/50">
                    <div className="text-[11px] uppercase tracking-wider text-emerald-300 mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Business Ecosystem
                    </div>
                    <div className="text-xs text-slate-300 space-y-2">
                      <div>
                        <span className="text-slate-400">Key sectors:</span> {activeProfile.keySectors?.slice(0, 5).join(', ') || 'Not verified'}
                      </div>
                      <div>
                        <span className="text-slate-400">Anchor companies:</span> {activeProfile.foreignCompanies?.slice(0, 4).join(', ') || 'Not verified'}
                      </div>
                      <div>
                        <span className="text-slate-400">Investment programs:</span> {activeProfile.investmentPrograms?.slice(0, 3).join(', ') || 'Not verified'}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/50">
                    <div className="text-[11px] uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Safety & Stability (Proxy)
                    </div>
                    <div className="text-xs text-slate-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Stability proxy</span>
                        <span className="text-white font-semibold">{safetyProxyScore ?? 'N/A'}/100</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Political stability</span>
                        <span className="text-white">{activeProfile.politicalStability ?? 'N/A'}/100</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Regulatory friction</span>
                        <span className="text-white">{activeProfile.regulatoryFriction ?? 'N/A'}/100</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Proxy score derived from available indicators, not crime data.</div>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/50">
                    <div className="text-[11px] uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-2">
                      <Rocket className="w-4 h-4" /> Current State & Outlook
                    </div>
                    <div className="text-xs text-slate-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Momentum</span>
                        <span className="text-white">{activeProfile.investmentMomentum ?? 'N/A'}/100</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Outlook</span>
                        <span className="text-white">{outlookLabel}</span>
                      </div>
                      {activeProfile.recentNews?.length ? (
                        <div className="mt-2">
                          <div className="text-[10px] text-slate-400 uppercase">Latest signals</div>
                          <ul className="mt-1 space-y-1">
                            {activeProfile.recentNews.slice(0, 3).map(item => (
                              <li key={item.title} className="text-[11px] text-slate-300">* {item.title}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400">No verified recent signals yet.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid md:grid-cols-3 gap-4">
                  <ScoreBar label="Evidence completeness" value={researchResult?.dataQuality?.completeness ?? 0} />
                  <ScoreBar label="Government sources" value={Math.min(((researchResult?.dataQuality?.governmentSourcesUsed ?? 0) * 10), 100)} />
                  <ScoreBar label="International sources" value={Math.min(((researchResult?.dataQuality?.internationalSourcesUsed ?? 0) * 10), 100)} />
                </div>
              </div>
            </div>

            {/* ===================== 10-STEP PROTOCOL ALIGNMENT ===================== */}
            <div className="bg-gradient-to-br from-purple-500/5 via-[#0f0f0f] to-amber-500/5 border border-purple-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <SectionHeader icon={Target} title="10-Step Protocol Alignment" color="text-purple-400" />
                <span className="text-[10px] px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/40">
                  Investment Readiness Framework
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                How this location data maps to your investment due diligence and partnership development process.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                {/* Step 3 - Market & Context */}
                <div className="p-4 border border-emerald-500/30 bg-emerald-500/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-emerald-500/30 rounded-full flex items-center justify-center text-xs font-bold text-emerald-300">3</div>
                    <span className="text-xs font-semibold text-emerald-300">Market & Context</span>
                  </div>
                  <div className="text-[10px] text-emerald-200 mb-2">✓ Fully Covered</div>
                  <ul className="text-[10px] text-slate-400 space-y-1">
                    <li>* GDP & economic data</li>
                    <li>* Regulatory friction</li>
                    <li>* Demographics</li>
                    <li>* Trade partners</li>
                  </ul>
                </div>

                {/* Step 4 - Partners & Ecosystem */}
                <div className="p-4 border border-amber-500/30 bg-amber-500/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-amber-500/30 rounded-full flex items-center justify-center text-xs font-bold text-amber-300">4</div>
                    <span className="text-xs font-semibold text-amber-300">Partners & Ecosystem</span>
                  </div>
                  <div className="text-[10px] text-amber-200 mb-2">a -  Partially Covered</div>
                  <ul className="text-[10px] text-slate-400 space-y-1">
                    <li>* Major employers</li>
                    <li>* Foreign companies</li>
                    <li>* Key sectors</li>
                    <li>* Gov't contacts</li>
                  </ul>
                </div>

                {/* Step 5 - Financial Model */}
                <div className="p-4 border border-cyan-500/30 bg-cyan-500/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-cyan-500/30 rounded-full flex items-center justify-center text-xs font-bold text-cyan-300">5</div>
                    <span className="text-xs font-semibold text-cyan-300">Financial Model</span>
                  </div>
                  <div className="text-[10px] text-cyan-200 mb-2">a -  Inputs Available</div>
                  <ul className="text-[10px] text-slate-400 space-y-1">
                    <li>* Investment programs</li>
                    <li>* Tax incentives</li>
                    <li>* Cost indicators</li>
                    <li>* Economic zones</li>
                  </ul>
                </div>

                {/* Step 6 - Risk & Mitigation */}
                <div className="p-4 border border-emerald-500/30 bg-emerald-500/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-emerald-500/30 rounded-full flex items-center justify-center text-xs font-bold text-emerald-300">6</div>
                    <span className="text-xs font-semibold text-emerald-300">Risk & Mitigation</span>
                  </div>
                  <div className="text-[10px] text-emerald-200 mb-2">✓ Fully Covered</div>
                  <ul className="text-[10px] text-slate-400 space-y-1">
                    <li>* Political risk</li>
                    <li>* Economic risk</li>
                    <li>* Natural hazards</li>
                    <li>* Regulatory risk</li>
                  </ul>
                </div>

                {/* Step 10 - Scoring & Readiness */}
                <div className="p-4 border border-emerald-500/30 bg-emerald-500/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-emerald-500/30 rounded-full flex items-center justify-center text-xs font-bold text-emerald-300">10</div>
                    <span className="text-xs font-semibold text-emerald-300">Scoring & Readiness</span>
                  </div>
                  <div className="text-[10px] text-emerald-200 mb-2">✓ Fully Covered</div>
                  <ul className="text-[10px] text-slate-400 space-y-1">
                    <li>* Composite score</li>
                    <li>* Investment readiness</li>
                    <li>* Comparison analysis</li>
                    <li>* Data quality</li>
                  </ul>
                </div>
              </div>

              {/* Market Entry Considerations */}
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 border border-slate-700 rounded-xl bg-slate-900/30">
                  <div className="text-[11px] uppercase tracking-wider text-blue-300 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Entry Timeline Considerations
                  </div>
                  <ul className="text-[10px] text-slate-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">1.</span>
                      <span>Regulatory approval: {(activeProfile.regulatoryFriction || 50) > 50 ? '3-6 months' : '1-3 months'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">2.</span>
                      <span>Entity setup: {activeProfile.country?.includes('Singapore') || activeProfile.country?.includes('Hong Kong') ? '1-2 weeks' : '2-4 weeks'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">3.</span>
                      <span>Operational readiness: 1-3 months post-approval</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">4.</span>
                      <span>Full market engagement: 6-12 months</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 border border-slate-700 rounded-xl bg-slate-900/30">
                  <div className="text-[11px] uppercase tracking-wider text-emerald-300 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Talent & Resources
                  </div>
                  <ul className="text-[10px] text-slate-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">*</span>
                      <span>Labor pool quality: {activeProfile.laborPool || 60}/100</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">*</span>
                      <span>Universities: {activeProfile.demographics?.universitiesColleges || 'See education data'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">*</span>
                      <span>Literacy: {activeProfile.demographics?.literacyRate || 'See demographics'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">*</span>
                      <span>Languages: {activeProfile.demographics?.languages?.slice(0, 2).join(', ') || 'See language data'}</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 border border-slate-700 rounded-xl bg-slate-900/30">
                  <div className="text-[11px] uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Cost Factors
                  </div>
                  <ul className="text-[10px] text-slate-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400">*</span>
                      <span>Cost index: {activeProfile.costOfDoing || 50}/100 (lower is better)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400">*</span>
                      <span>Avg income: {activeProfile.economics?.avgIncome || 'See economic data'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400">*</span>
                      <span>Tax incentives: {activeProfile.taxIncentives?.length || 0} programs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400">*</span>
                      <span>Economic zones: {activeProfile.infrastructure?.specialEconomicZones?.length || 0} zones</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Protocol Integration Summary */}
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-amber-500/10 border border-purple-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-semibold text-white">Location Data Coverage Summary</span>
                  <span className="ml-auto text-2xl font-bold text-amber-400">{computeCompositeScore(activeProfile)}/100</span>
                </div>
                <p className="text-[10px] text-slate-400 mb-3">
                  Derived from available indicators only; not an opinion, endorsement, or recommendation.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-[11px]">
                  <div>
                    <div className="text-slate-400 mb-1">Coverage Highlights:</div>
                    <ul className="text-emerald-300 space-y-1">
                      <li>✓ Market context indicators present</li>
                      <li>✓ Risk indicators present</li>
                      <li>✓ Scoring inputs present</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">Verification Checklist:</div>
                    <ul className="text-blue-300 space-y-1">
                      <li>a' Confirm leadership via official portals</li>
                      <li>a' Validate incentives with investment authority</li>
                      <li>a' Verify current regulations and timelines</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">Known Data Gaps:</div>
                    <ul className="text-amber-300 space-y-1">
                      {!activeProfile.leaders?.length && <li>* Leadership verification needed</li>}
                      {(activeProfile.laborPool || 0) < 50 && <li>* Workforce assessment recommended</li>}
                      {!activeProfile.taxIncentives?.length && <li>* Incentive details to confirm</li>}
                      {activeProfile.leaders?.length && (activeProfile.laborPool || 0) >= 50 && activeProfile.taxIncentives?.length && <li>* Data largely complete</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* ===================== CURRENT GOVERNMENT DATA SECTION ===================== */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
              <button
                onClick={() => toggleSection('government')}
                className="w-full flex items-center justify-between"
              >
                <SectionHeader icon={Building2} title="Current Government Leadership" color="text-blue-400" />
                {expandedSections.government ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
              {expandedSections.government && (
                <div className="mt-4 space-y-3">
                  {isLoadingGovernmentData ? (
                    <div className="py-8 text-center">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
                      <p className="text-sm text-slate-400">Fetching current government information...</p>
                    </div>
                  ) : governmentLeaders.length > 0 ? (
                    governmentLeaders.map((leader, idx) => (
                      <div key={idx} className="p-4 border border-blue-500/20 bg-blue-500/5 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-white">{leader.name}</div>
                            <div className="text-sm text-blue-300">{leader.role}</div>
                            <div className="text-xs text-slate-500 mt-1">{leader.tenure}</div>
                            {leader.party && <div className="text-xs text-purple-300 mt-1">Party: {leader.party}</div>}
                            {leader.office && <div className="text-xs text-slate-400 mt-1">Office: {leader.office}</div>}
                            {leader.email && (
                              <div className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                                📊 {leader.email}
                              </div>
                            )}
                            {leader.website && (
                              <a href={leader.website} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline mt-1 block">
                                🌍 Official Website a'
                              </a>
                            )}
                          </div>
                          {leader.verified && (
                            <div className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded border border-emerald-500/40">
                              ✓ Verified
                            </div>
                          )}
                        </div>
                        {leader.sourceUrl && (
                          <div className="mt-2 text-[10px] text-slate-500">
                            Source: <a href={leader.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                              {new URL(leader.sourceUrl).hostname}
                            </a> | Last updated: {new Date(leader.lastUpdated).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 py-4">Government leadership data not yet available for this location.</p>
                  )}
                </div>
              )}
            </div>

            {/* ===================== REGIONAL COMPARISON METRICS SECTION ===================== */}
            {(regionalComparisons || isLoadingComparisons) && (
              <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                <button
                  onClick={() => toggleSection('regional')}
                  className="w-full flex items-center justify-between"
                >
                  <SectionHeader icon={BarChart3} title="Regional Comparison Metrics" color="text-cyan-400" />
                  {expandedSections.regional ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {expandedSections.regional && (
                  <div className="mt-4 space-y-6">
                    {isLoadingComparisons ? (
                      <div className="py-8 text-center">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                        <p className="text-sm text-slate-400">Analyzing regional comparisons...</p>
                      </div>
                    ) : regionalComparisons ? (
                      <>
                        {/* Nearby Locations Reference */}
                        <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-lg">
                          <div className="text-xs uppercase tracking-wider text-slate-400 mb-3">Comparison Locations (within region)</div>
                          <div className="space-y-2">
                            {regionalComparisons.nearbyLocations.slice(0, 5).map((loc, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-white">{loc.city}, {loc.country}</span>
                                <span className="text-slate-500 text-xs">{loc.distance_km} km</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Comparison Metrics */}
                        {regionalComparisons.comparisons.map((comparison, idx) => (
                          <div key={idx} className="p-4 border border-cyan-500/20 bg-cyan-500/5 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-white">{comparison.metric}</h4>
                              {comparison.percentilRank !== undefined && (
                                <span className="text-sm font-bold text-cyan-400">
                                  {comparison.percentilRank}th percentile
                                </span>
                              )}
                            </div>

                            <div className="space-y-3">
                              {/* Current Location Performance */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-black/30 rounded border border-cyan-500/30">
                                  <div className="text-xs text-slate-400 uppercase mb-1">{activeProfile?.city}</div>
                                  <div className="text-lg font-bold text-cyan-300">
                                    {typeof comparison.currentLocation.value === 'number'
                                      ? comparison.currentLocation.value.toFixed(0)
                                      : comparison.currentLocation.value}
                                  </div>
                                  {comparison.currentLocation.rank && (
                                    <div className="text-xs text-slate-500 mt-1">
                                      Rank: #{comparison.currentLocation.rank}
                                    </div>
                                  )}
                                </div>

                                <div className="p-3 bg-black/30 rounded border border-slate-700">
                                  <div className="text-xs text-slate-400 uppercase mb-1">Regional Avg</div>
                                  <div className="text-lg font-bold text-white">
                                    {typeof comparison.regionalAverage === 'number'
                                      ? comparison.regionalAverage.toFixed(0)
                                      : comparison.regionalAverage}
                                  </div>
                                </div>
                              </div>

                              {/* Best & Worst */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-emerald-500/10 rounded border border-emerald-500/30">
                                  <div className="text-xs text-emerald-300 uppercase mb-1">Regional Best</div>
                                  <div className="text-sm font-semibold text-emerald-200">{comparison.regionalBest.location}</div>
                                  <div className="text-xs text-emerald-300 mt-1">
                                    {typeof comparison.regionalBest.value === 'number'
                                      ? comparison.regionalBest.value.toFixed(0)
                                      : comparison.regionalBest.value}
                                  </div>
                                </div>

                                <div className="p-3 bg-red-500/10 rounded border border-red-500/30">
                                  <div className="text-xs text-red-300 uppercase mb-1">Regional Worst</div>
                                  <div className="text-sm font-semibold text-red-200">{comparison.regionalWorst.location}</div>
                                  <div className="text-xs text-red-300 mt-1">
                                    {typeof comparison.regionalWorst.value === 'number'
                                      ? comparison.regionalWorst.value.toFixed(0)
                                      : comparison.regionalWorst.value}
                                  </div>
                                </div>
                              </div>

                              {/* Visual comparison bar */}
                              <div className="mt-3 space-y-1">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <span className="w-16">Relative</span>
                                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                    {typeof comparison.currentLocation.value === 'number' && typeof comparison.regionalAverage === 'number' ? (
                                      <div
                                        className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full"
                                        style={{
                                          width: `${Math.min(
                                            (comparison.currentLocation.value / (comparison.regionalAverage * 1.5)) * 100,
                                            100
                                          )}%`
                                        }}
                                      />
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-lg text-xs text-slate-400">
                          <strong>Data freshness:</strong> {new Date(regionalComparisons.dataFreshness).toLocaleDateString()}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-slate-400 py-4">No regional comparison data available.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ===================== POLITICAL LEADERSHIP SECTION ===================== */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
              <button
                onClick={() => toggleSection('leadership')}
                className="w-full flex items-center justify-between"
              >
                <SectionHeader icon={Landmark} title="Political Leadership" color="text-purple-400" />
                {expandedSections.leadership ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
              {expandedSections.leadership && (
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  {activeProfile.leaders.map(leader => (
                    <button
                      key={leader.id}
                      onClick={() => setActiveLeader(leader)}
                      className="text-left p-4 border border-white/10 rounded-xl hover:border-purple-400/50 transition-all bg-slate-900/50"
                    >
                      <div className="flex items-start gap-4">
                        {(leader.imageUrl || leader.photoUrl) ? (
                          <img
                            src={leader.imageUrl || leader.photoUrl}
                            alt={leader.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/30"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/40 to-purple-600/40 flex items-center justify-center text-lg font-bold">
                            {leader.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white">{leader.name}</div>
                          <div className="text-xs text-slate-400">{leader.role}</div>
                          <div className="text-[10px] text-slate-500">{leader.tenure}</div>
                          {leader.party && (
                            <div className="text-[10px] text-purple-300 mt-1">{leader.party}</div>
                          )}
                          {leader.photoVerified && (
                            <div className="text-[10px] text-emerald-300 mt-1 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Photo verified
                            </div>
                          )}
                          {!leader.imageUrl && !leader.photoUrl && (
                            <div className="text-[10px] text-amber-300 mt-1">Official photo pending</div>
                          )}
                          {leader.sourceUrl && (
                            <a href={leader.sourceUrl} target="_blank" rel="noreferrer" 
                               className="text-[10px] text-blue-400 hover:underline mt-1 block truncate"
                               onClick={(e) => e.stopPropagation()}>
                              Source: {new URL(leader.sourceUrl).hostname}
                            </a>
                          )}
                          {leader.internationalEngagementFocus && (
                            <div className="text-[10px] text-purple-300 mt-1">🌍 Int'l Engagement Focus</div>
                          )}
                        </div>
                      </div>
                      {/* Full Bio Preview */}
                      {leader.fullBio && (
                        <div className="mt-3 p-2 bg-black/30 rounded-lg">
                          <p className="text-[11px] text-slate-400 line-clamp-3">{leader.fullBio}</p>
                        </div>
                      )}
                      {/* Achievements Preview */}
                      {leader.achievements && leader.achievements.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {leader.achievements.slice(0, 2).map((ach, idx) => (
                            <span key={idx} className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded-full">
                              ✓ {ach.substring(0, 40)}{ach.length > 40 ? '...' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 text-[10px] text-purple-300 flex items-center gap-1">
                        Click for full bio, news & projects a'
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ===================== ECONOMY & TRADE SECTION ===================== */}
            {activeProfile.economics && (
              <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                <button
                  onClick={() => toggleSection('economy')}
                  className="w-full flex items-center justify-between"
                >
                  <SectionHeader icon={TrendingUp} title="Economy & Trade" color="text-emerald-400" />
                  {expandedSections.economy ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {expandedSections.economy && (
                  <div className="mt-4 space-y-6">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="p-4 border border-slate-800 rounded-lg text-center">
                        <div className="text-[10px] text-slate-400 uppercase">Local GDP</div>
                        <div className="text-xl font-bold text-white mt-1">{activeProfile.economics.gdpLocal}</div>
                      </div>
                      <div className="p-4 border border-slate-800 rounded-lg text-center">
                        <div className="text-[10px] text-slate-400 uppercase">GDP Growth</div>
                        <div className="text-xl font-bold text-emerald-400 mt-1">{activeProfile.economics.gdpGrowthRate}</div>
                      </div>
                      <div className="p-4 border border-slate-800 rounded-lg text-center">
                        <div className="text-[10px] text-slate-400 uppercase">Employment Rate</div>
                        <div className="text-xl font-bold text-white mt-1">{activeProfile.economics.employmentRate}</div>
                      </div>
                      <div className="p-4 border border-slate-800 rounded-lg text-center">
                        <div className="text-[10px] text-slate-400 uppercase">Avg Income</div>
                        <div className="text-xl font-bold text-white mt-1">{activeProfile.economics.avgIncome}</div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-slate-400 mb-3">Major Industries</h4>
                        <div className="flex flex-wrap gap-2">
                          {activeProfile.economics.majorIndustries.map(industry => (
                            <span key={industry} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs text-emerald-300">
                              {industry}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-slate-400 mb-3">Trade Partners</h4>
                        <div className="flex flex-wrap gap-2">
                          {activeProfile.economics.tradePartners?.map(partner => (
                            <span key={partner} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs text-blue-300">
                              {partner}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 border border-slate-800 rounded-lg">
                        <h4 className="text-xs uppercase tracking-wider text-amber-400 mb-3">Top Exports</h4>
                        <ul className="space-y-2 text-xs text-slate-300">
                          {activeProfile.economics.topExports?.map(item => (
                            <li key={item} className="flex items-center gap-2">
                              <Ship className="w-3 h-3 text-slate-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 pt-3 border-t border-slate-800">
                          <span className="text-[10px] text-slate-400">Export Volume: </span>
                          <span className="text-sm font-semibold">{activeProfile.economics.exportVolume}</span>
                        </div>
                      </div>
                      <div className="p-4 border border-slate-800 rounded-lg">
                        <h4 className="text-xs uppercase tracking-wider text-amber-400 mb-3">Foreign Companies Present</h4>
                        <div className="space-y-2">
                          {activeProfile.foreignCompanies.slice(0, 6).map(company => (
                            <div key={company} className="flex items-center gap-2 text-xs">
                              <Briefcase className="w-3 h-3 text-slate-500" />
                              {company}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===================== INFRASTRUCTURE SECTION ===================== */}
            {activeProfile.infrastructure && (
              <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                <button
                  onClick={() => toggleSection('infrastructure')}
                  className="w-full flex items-center justify-between"
                >
                  <SectionHeader icon={Factory} title="Infrastructure" color="text-orange-400" />
                  {expandedSections.infrastructure ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {expandedSections.infrastructure && (
                  <div className="mt-4 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 border border-slate-800 rounded-lg">
                        <h4 className="text-xs uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                          <Plane className="w-4 h-4" /> Airports
                        </h4>
                        <div className="space-y-3">
                          {activeProfile.infrastructure.airports?.map(airport => (
                            <div key={airport.name} className="p-3 bg-slate-800/50 rounded-lg">
                              <div className="font-semibold text-sm">{airport.name}</div>
                              <div className="text-[10px] text-slate-400">{airport.type}</div>
                              {airport.routes && <div className="text-xs text-slate-300 mt-1">Routes: {airport.routes}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 border border-slate-800 rounded-lg">
                        <h4 className="text-xs uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                          <Ship className="w-4 h-4" /> Seaports
                        </h4>
                        <div className="space-y-3">
                          {activeProfile.infrastructure.seaports?.map(port => (
                            <div key={port.name} className="p-3 bg-slate-800/50 rounded-lg">
                              <div className="font-semibold text-sm">{port.name}</div>
                              <div className="text-[10px] text-slate-400">{port.type}</div>
                              {port.capacity && <div className="text-xs text-slate-300 mt-1">Capacity: {port.capacity}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 border border-slate-800 rounded-lg">
                        <h4 className="text-xs uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4" /> Power & Connectivity
                        </h4>
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between p-2 bg-slate-800/50 rounded">
                            <span className="text-slate-400">Power Capacity</span>
                            <span className="font-semibold">{activeProfile.infrastructure.powerCapacity}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-slate-800/50 rounded">
                            <span className="text-slate-400">Internet Penetration</span>
                            <span className="font-semibold">{activeProfile.infrastructure.internetPenetration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border border-slate-800 rounded-lg">
                        <h4 className="text-xs uppercase tracking-wider text-amber-400 mb-3">Economic Zones</h4>
                        <ul className="space-y-2 text-xs">
                          {activeProfile.infrastructure.specialEconomicZones?.map(zone => (
                            <li key={zone} className="text-emerald-300">{zone}</li>
                          ))}
                          {activeProfile.infrastructure.industrialParks?.map(park => (
                            <li key={park} className="text-slate-400">{park}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===================== DEMOGRAPHICS SECTION ===================== */}
            {activeProfile.demographics && (
              <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                <button
                  onClick={() => toggleSection('demographics')}
                  className="w-full flex items-center justify-between"
                >
                  <SectionHeader icon={Users} title="Demographics" color="text-cyan-400" />
                  {expandedSections.demographics ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {expandedSections.demographics && (
                  <div className="mt-4 space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 border border-slate-800 rounded-lg text-center">
                        <div className="text-2xl font-bold text-white">{activeProfile.demographics.population}</div>
                        <div className="text-[10px] text-slate-400 uppercase mt-1">Total Population</div>
                      </div>
                      <div className="p-4 border border-slate-800 rounded-lg text-center">
                        <div className="text-2xl font-bold text-emerald-400">{activeProfile.demographics.populationGrowth}</div>
                        <div className="text-[10px] text-slate-400 uppercase mt-1">Growth Rate</div>
                      </div>
                      <div className="p-4 border border-slate-800 rounded-lg text-center">
                        <div className="text-2xl font-bold text-white">{activeProfile.demographics.medianAge}</div>
                        <div className="text-[10px] text-slate-400 uppercase mt-1">Median Age</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 border border-slate-800 rounded-lg">
                        <h4 className="text-xs uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" /> Education & Workforce
                        </h4>
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between p-2 bg-slate-800/50 rounded">
                            <span className="text-slate-400">Literacy Rate</span>
                            <span className="font-semibold text-emerald-400">{activeProfile.demographics.literacyRate}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-slate-800/50 rounded">
                            <span className="text-slate-400">Working Age Population</span>
                            <span className="font-semibold">{activeProfile.demographics.workingAgePopulation}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-slate-800/50 rounded">
                            <span className="text-slate-400">Universities/Colleges</span>
                            <span className="font-semibold">{activeProfile.demographics.universitiesColleges}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-slate-800/50 rounded">
                            <span className="text-slate-400">Graduates/Year</span>
                            <span className="font-semibold">{activeProfile.demographics.graduatesPerYear}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border border-slate-800 rounded-lg">
                        <h4 className="text-xs uppercase tracking-wider text-amber-400 mb-3">Languages & Culture</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {activeProfile.demographics.languages?.map(lang => (
                            <span key={lang} className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs text-purple-300">
                              {lang}
                            </span>
                          ))}
                        </div>
                        <div className="p-2 bg-slate-800/50 rounded">
                          <span className="text-[10px] text-slate-400">Urbanization: </span>
                          <span className="text-sm font-semibold">{activeProfile.demographics.urbanization}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===================== ENVIRONMENTAL MANAGEMENT SECTION ===================== */}
            <div className="bg-[#0f0f0f] border border-emerald-500/20 rounded-2xl p-6">
              <SectionHeader icon={Leaf} title="Environmental Management" color="text-emerald-400" />
              <p className="text-xs text-slate-400 mb-4">
                Natural resources, sustainability initiatives, and environmental factors affecting operations and quality of life.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Natural Resources & Climate */}
                <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-semibold text-cyan-300">Natural Resources & Climate</h4>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between p-2 bg-slate-800/50 rounded">
                      <span className="text-slate-400">Climate Zone</span>
                      <span className="font-semibold text-white">{activeProfile.climate || 'See climate data'}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-800/50 rounded">
                      <span className="text-slate-400">Geographic Area</span>
                      <span className="font-semibold text-white">{activeProfile.areaSize || 'See geographic data'}</span>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded">
                      <div className="text-slate-400 mb-1">Coordinates</div>
                      <div className="font-mono text-white">{activeProfile.latitude?.toFixed(4)} degrees, {activeProfile.longitude?.toFixed(4)} degrees</div>
                    </div>
                  </div>
                </div>

                {/* Sustainability & Green Infrastructure */}
                <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Leaf className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-semibold text-emerald-300">Sustainability Indicators</h4>
                  </div>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">*</span>
                      <span>Power infrastructure: {activeProfile.infrastructure?.powerCapacity || 'See utilities data'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">*</span>
                      <span>Internet connectivity: {activeProfile.infrastructure?.internetPenetration || 'High connectivity'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">*</span>
                      <span>Special economic zones support sustainable development initiatives</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">*</span>
                      <span>Urban planning aligns with regional sustainability frameworks</span>
                    </div>
                  </div>
                </div>

                {/* Environmental Risks */}
                <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-semibold text-amber-300">Environmental Considerations</h4>
                  </div>
                  <div className="space-y-2 text-[11px] text-slate-400">
                    {researchResult?.narratives?.risks ? (
                      <p>{((researchResult.narratives.risks as unknown as Record<string, unknown>)?.paragraphs as Array<Record<string, unknown>>)?.[0]?.text as string || 'Environmental assessment data being compiled.'}</p>
                    ) : (
                      <>
                        <p>* Assess local weather patterns and seasonal variations for operational planning</p>
                        <p>* Review disaster preparedness and infrastructure resilience measures</p>
                        <p>* Consider water availability and resource management policies</p>
                        <p>* Evaluate air quality and environmental compliance requirements</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Waste & Resource Management */}
                <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Factory className="w-4 h-4 text-slate-400" />
                    <h4 className="text-sm font-semibold text-slate-300">Infrastructure Quality</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Infrastructure Score</span>
                      <span className={`font-semibold ${(activeProfile.infrastructureScore || 50) >= 70 ? 'text-emerald-400' : (activeProfile.infrastructureScore || 50) >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {activeProfile.infrastructureScore || 50}/100
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${(activeProfile.infrastructureScore || 50) >= 70 ? 'bg-emerald-500' : (activeProfile.infrastructureScore || 50) >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${activeProfile.infrastructureScore || 50}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      {(activeProfile.infrastructureScore || 50) >= 70 
                        ? 'Well-developed infrastructure supporting sustainable operations.' 
                        : (activeProfile.infrastructureScore || 50) >= 50 
                          ? 'Moderate infrastructure development. Improvements ongoing.'
                          : 'Infrastructure development in progress. Factor in upgrade timelines.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ===================== INVESTMENT READINESS SCORES ===================== */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
              <SectionHeader icon={Target} title="Investment Readiness Scores" />
              <div className="grid md:grid-cols-2 gap-4">
                <ScoreBar label="Infrastructure" value={activeProfile.infrastructureScore} />
                <ScoreBar label="Political Stability" value={activeProfile.politicalStability} />
                <ScoreBar label="Labor Pool Quality" value={activeProfile.laborPool} />
                <ScoreBar label="Investment Momentum" value={activeProfile.investmentMomentum} />
                <ScoreBar label="Regulatory Ease" value={100 - activeProfile.regulatoryFriction} />
                <ScoreBar label="Cost Competitiveness" value={100 - activeProfile.costOfDoing} />
              </div>
            </div>

            {/* ===================== RISK ASSESSMENT SECTION ===================== */}
            <div className="bg-[#0f0f0f] border border-red-500/20 rounded-2xl p-6">
              <SectionHeader icon={AlertTriangle} title="Risk Assessment" color="text-red-400" />
              <p className="text-xs text-slate-400 mb-4">
                Comprehensive risk analysis based on political, economic, environmental, and regulatory factors.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Political Risk */}
                <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Landmark className="w-4 h-4 text-purple-400" />
                    <h4 className="text-sm font-semibold text-purple-300">Political Risk</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Stability Score</span>
                      <span className={`font-semibold ${(activeProfile.politicalStability || 50) >= 60 ? 'text-emerald-400' : (activeProfile.politicalStability || 50) >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                        {activeProfile.politicalStability || 50}/100
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${(activeProfile.politicalStability || 50) >= 60 ? 'bg-emerald-500' : (activeProfile.politicalStability || 50) >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${activeProfile.politicalStability || 50}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      {(activeProfile.politicalStability || 50) >= 70 
                        ? 'Stable political environment with consistent policy direction.' 
                        : (activeProfile.politicalStability || 50) >= 50 
                          ? 'Moderate political risk. Monitor policy changes and elections.'
                          : 'Higher political volatility. Consider political risk insurance.'}
                    </p>
                  </div>
                </div>

                {/* Economic Risk */}
                <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-semibold text-amber-300">Economic Risk</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Economic Health</span>
                      <span className={`font-semibold ${(activeProfile.investmentMomentum || 50) >= 60 ? 'text-emerald-400' : (activeProfile.investmentMomentum || 50) >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                        {activeProfile.investmentMomentum || 50}/100
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${(activeProfile.investmentMomentum || 50) >= 60 ? 'bg-emerald-500' : (activeProfile.investmentMomentum || 50) >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${activeProfile.investmentMomentum || 50}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      GDP Growth: {activeProfile.economics?.gdpGrowthRate || 'See economic data'}<br/>
                      Unemployment: {activeProfile.economics?.employmentRate ? `${100 - parseFloat(activeProfile.economics.employmentRate)}% unemployment` : 'See labor data'}
                    </p>
                  </div>
                </div>

                {/* Natural/Environmental Risk */}
                <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Leaf className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-semibold text-emerald-300">Natural & Environmental</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-slate-300">
                      <span className="text-slate-400">Climate Zone:</span> {activeProfile.climate || 'Regional climate'}
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-1 mt-2">
                      {researchResult?.narratives?.risks ? (
                        <p>{((researchResult.narratives.risks as unknown as Record<string, unknown>)?.paragraphs as Array<Record<string, unknown>>)?.[0]?.text as string || 'Environmental risk data being compiled.'}</p>
                      ) : (
                        <>
                          <p>* Consider local weather patterns and seasonal variations</p>
                          <p>* Review disaster preparedness and infrastructure resilience</p>
                          <p>* Assess water and resource availability</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Regulatory Risk */}
                <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Scale className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-semibold text-blue-300">Regulatory Risk</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Regulatory Friction</span>
                      <span className={`font-semibold ${(activeProfile.regulatoryFriction || 50) <= 40 ? 'text-emerald-400' : (activeProfile.regulatoryFriction || 50) <= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                        {activeProfile.regulatoryFriction || 50}/100
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${(activeProfile.regulatoryFriction || 50) <= 40 ? 'bg-emerald-500' : (activeProfile.regulatoryFriction || 50) <= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${100 - (activeProfile.regulatoryFriction || 50)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      {(activeProfile.regulatoryFriction || 50) <= 30 
                        ? 'Business-friendly regulatory environment with streamlined processes.' 
                        : (activeProfile.regulatoryFriction || 50) <= 50 
                          ? 'Moderate regulatory complexity. Standard compliance processes.'
                          : 'Higher regulatory burden. Factor in additional compliance costs and timelines.'}
                    </p>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Ease of Business: {activeProfile.easeOfDoingBusiness || 'See World Bank data'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Risk Summary */}
              <div className="mt-4 p-4 bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-white">Risk Mitigation Recommendations</span>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1">
                  {(activeProfile.politicalStability || 50) < 60 && (
                    <li>* Consider political risk insurance for long-term investments</li>
                  )}
                  {(activeProfile.regulatoryFriction || 50) > 50 && (
                    <li>* Engage local legal counsel for regulatory navigation</li>
                  )}
                  {(activeProfile.investmentMomentum || 50) < 50 && (
                    <li>* Monitor economic indicators and maintain flexible exit strategies</li>
                  )}
                  <li>* Conduct due diligence with local partners and government offices</li>
                  <li>* Review bilateral investment treaties and investor protections</li>
                </ul>
              </div>
            </div>

            {/* ===================== STRATEGIC ADVANTAGES & NEEDS ===================== */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                <SectionHeader icon={Award} title="Strategic Advantages" color="text-emerald-400" />
                <ul className="space-y-2 text-xs text-slate-300">
                  {activeProfile.strategicAdvantages.map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                <SectionHeader icon={Rocket} title="Development Needs" color="text-amber-400" />
                <ul className="space-y-2 text-xs text-slate-300">
                  {deriveNeeds(activeProfile).map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">a'</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ===================== ACTIVE PROGRAMS & TAX INCENTIVES ===================== */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                <SectionHeader icon={Target} title="Active Programs" />
                <div className="space-y-3">
                  {activeProfile.currentPrograms?.map(program => (
                    <div key={program.name} className="p-3 border border-slate-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold">{program.name}</div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                          program.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' :
                          program.status === 'Under construction' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {program.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">{program.focus}</div>
                    </div>
                  ))}
                </div>
              </div>
              {activeProfile.taxIncentives && (
                <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                  <SectionHeader icon={DollarSign} title="Tax Incentives" color="text-emerald-400" />
                  <ul className="space-y-2 text-xs text-slate-300">
                    {activeProfile.taxIncentives.map(incentive => (
                      <li key={incentive} className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">$</span>
                        {incentive}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ===================== GOVERNMENT & CONTACT DIRECTORY ===================== */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
              <SectionHeader icon={ExternalLink} title="Government & Contact Directory" color="text-blue-400" />
              <p className="text-xs text-slate-400 mb-4">
                Consolidated government portals, departments, and contact points to reduce research time.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/50">
                  <div className="text-[11px] uppercase tracking-wider text-blue-300 mb-2">Departments</div>
                  {activeProfile.departments?.length ? (
                    <ul className="text-xs text-slate-300 space-y-1">
                      {activeProfile.departments.map((dept) => (
                        <li key={dept}>* {dept}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-slate-400">Departments not yet available.</div>
                  )}
                </div>

                <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/50">
                  <div className="text-[11px] uppercase tracking-wider text-blue-300 mb-2">Ease of Doing Business</div>
                  <div className="text-sm text-white">
                    {activeProfile.easeOfDoingBusiness || 'See World Bank or official investment authority'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-2">
                    Reference official sources for licensing, permits, and timelines.
                  </div>
                </div>
              </div>

              {activeProfile.governmentLinks?.length ? (
                <div className="mb-6">
                  <div className="text-[11px] uppercase tracking-wider text-blue-300 mb-2">Official Portals</div>
                  <div className="grid md:grid-cols-3 gap-3">
                    {activeProfile.governmentLinks.map(link => (
                      <a 
                        key={link.url}
                        href={link.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-3 border border-blue-500/30 rounded-lg hover:border-blue-400 hover:bg-blue-500/10 transition-all text-xs text-blue-300 flex items-center gap-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 mb-6">Official portals not yet available for this location.</div>
              )}

              {activeProfile.investmentLeads?.length ? (
                <div className="mb-6">
                  <div className="text-[11px] uppercase tracking-wider text-emerald-300 mb-2">Investment / Trade Contacts</div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {activeProfile.investmentLeads.map((lead) => (
                      <div key={lead.name} className="p-3 border border-emerald-500/20 bg-emerald-500/5 rounded-lg">
                        <div className="text-xs font-semibold text-white">{lead.name}</div>
                        <div className="text-[11px] text-emerald-300">{lead.role}</div>
                        <div className="text-[10px] text-slate-400">{lead.focus}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {activeProfile.governmentOffices?.length ? (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-blue-300 mb-2">Contact Directory</div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {activeProfile.governmentOffices.map((office, idx) => (
                      <div key={`${office.name}-${idx}`} className="p-3 border border-blue-500/20 bg-blue-500/5 rounded-lg">
                        <div className="text-xs font-semibold text-white">{office.name}</div>
                        <div className="text-[11px] text-blue-300 capitalize">{office.type}</div>
                        {office.website && (
                          <a href={office.website} target="_blank" rel="noreferrer" className="text-[11px] text-blue-400 hover:underline block mt-1">
                            {office.website}
                          </a>
                        )}
                        {office.email && <div className="text-[11px] text-slate-300 mt-1">Email: {office.email}</div>}
                        {office.phone && <div className="text-[11px] text-slate-300">Phone: {office.phone}</div>}
                        {office.address && <div className="text-[11px] text-slate-400 mt-1">{office.address}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400">Contact directory not yet available for this location.</div>
              )}
            </div>

            {/* ===================== LIVE DATA SECTION ===================== */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
              <button
                onClick={() => toggleSection('live')}
                className="w-full flex items-center justify-between"
              >
                <SectionHeader icon={Activity} title="Live Data & News" color="text-red-400" />
                {expandedSections.live ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
              {expandedSections.live && (
                <div className="mt-4 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-slate-400 mb-3">Data Feeds</h4>
                      <div className="space-y-2">
                        {activeProfile.realTimeIndicators?.liveFeeds?.map(feed => (
                          <div key={feed.name} className="flex items-center justify-between p-2 border border-slate-800 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Database className="w-3 h-3 text-slate-500" />
                              <span className="text-xs">{feed.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={feed.status} />
                              {feed.url && (
                                <a href={feed.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-amber-400">
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-slate-400 mb-3">Recent News</h4>
                      <div className="space-y-2">
                        {activeProfile.realTimeIndicators?.newsAlerts?.map(alert => (
                          <div key={alert.headline} className="p-3 border border-slate-800 rounded-lg">
                            <div className="font-semibold text-xs">{alert.headline}</div>
                            <div className="text-[10px] text-slate-400 mt-1">{alert.date} * {alert.source}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Upcoming Events
                    </h4>
                    <div className="grid md:grid-cols-3 gap-3">
                      {activeProfile.realTimeIndicators?.upcomingEvents?.map(event => (
                        <div key={event.name} className="p-3 border border-slate-800 rounded-lg">
                          <div className="font-semibold text-xs">{event.name}</div>
                          <div className="text-[10px] text-slate-400">{event.date}</div>
                          <span className="mt-2 inline-block px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded text-[10px] text-blue-300">
                            {event.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-200">
                    <strong>Data Source:</strong> {activeProfile.realTimeIndicators?.dataSource} | Last Updated: {activeProfile.realTimeIndicators?.lastUpdated}
                  </div>
                </div>
              )}
            </div>

            {/* ===================== SOURCES & CITATIONS SECTION ===================== */}
            {researchResult?.sources && researchResult.sources.length > 0 && (
              <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                <button
                  onClick={() => toggleSection('sources')}
                  className="w-full flex items-center justify-between"
                >
                  <SectionHeader icon={BookOpen} title="Research Sources & Citations" color="text-blue-400" />
                  {expandedSections.sources ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {expandedSections.sources && (
                  <div className="mt-4 space-y-3">
                    {/* Data Quality Summary */}
                    {researchResult.dataQuality && (
                      <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="w-5 h-5 text-emerald-400" />
                          <span className="text-sm font-semibold text-emerald-300">Source Verification Summary</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div className="p-2 bg-black/30 rounded-lg">
                            <div className="text-lg font-bold text-emerald-400">{researchResult.dataQuality.governmentSourcesUsed}</div>
                            <div className="text-[10px] text-slate-400">Government Sources</div>
                          </div>
                          <div className="p-2 bg-black/30 rounded-lg">
                            <div className="text-lg font-bold text-blue-400">{researchResult.dataQuality.internationalSourcesUsed}</div>
                            <div className="text-[10px] text-slate-400">World Bank / Int'l Orgs</div>
                          </div>
                          <div className="p-2 bg-black/30 rounded-lg">
                            <div className="text-lg font-bold text-amber-400">{researchResult.dataQuality.newsSourcesUsed}</div>
                            <div className="text-[10px] text-slate-400">News Sources</div>
                          </div>
                          <div className="p-2 bg-black/30 rounded-lg">
                            <div className="text-lg font-bold text-cyan-400">{researchResult.dataQuality.primarySourcePercentage}%</div>
                            <div className="text-[10px] text-slate-400">Primary Source %</div>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-slate-400">
                          <span className="text-emerald-300">✓</span> Primary sources (government, World Bank, int'l organizations) prioritized over secondary sources.
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-slate-400 mb-4">
                      Data sourced from official government websites, World Bank, international organizations, and verified news outlets. 
                      Each source is rated for reliability. Click any source to view the original.
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {researchResult.sources.map((source: SourceCitation, idx: number) => (
                        <a
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 border border-slate-800 rounded-lg hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs font-bold ${
                              source.type === 'government' ? 'bg-emerald-500/20 text-emerald-300' :
                              source.type === 'worldbank' ? 'bg-blue-500/20 text-blue-300' :
                              source.type === 'international' ? 'bg-cyan-500/20 text-cyan-300' :
                              source.type === 'statistics' ? 'bg-purple-500/20 text-purple-300' :
                              source.type === 'news' ? 'bg-amber-500/20 text-amber-300' :
                              source.type === 'research' ? 'bg-pink-500/20 text-pink-300' :
                              'bg-slate-700 text-white'
                            }`}>
                              {source.type === 'government' ? <Building2 className="w-4 h-4" /> :
                               source.type === 'worldbank' ? <Globe className="w-4 h-4" /> :
                               source.type === 'international' ? <Globe className="w-4 h-4" /> :
                               source.type === 'statistics' ? <BarChart3 className="w-4 h-4" /> :
                               source.type === 'news' ? <Newspaper className="w-4 h-4" /> :
                               <FileText className="w-4 h-4" />}
                              <span className="text-[8px] mt-0.5">
                                {source.reliability === 'high' ? 'a~...a~...a~...' : source.reliability === 'medium' ? 'a~...a~...' : 'a~...'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
                                  {source.title}
                                </div>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                                  source.reliability === 'high' ? 'bg-emerald-500/20 text-emerald-300' :
                                  source.reliability === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                                  'bg-slate-700 text-slate-300'
                                }`}>
                                  {source.reliability?.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-300 mt-0.5 capitalize">
                                {source.type === 'worldbank' ? 'World Bank' : source.type}
                                {source.organization ? ` * ${source.organization}` : ''}
                              </div>
                              {source.dataExtracted && (
                                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{source.dataExtracted}</div>
                              )}
                              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                                <Link2 className="w-3 h-3" />
                                <span className="truncate">{new URL(source.url).hostname}</span>
                                <span>* {source.accessDate}</span>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-blue-400" />
                          </div>
                        </a>
                      ))}
                    </div>
                    
                    {/* Research Summary */}
                    {researchResult.researchSummary && (
                      <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
                        <div className="text-xs text-slate-400">{researchResult.researchSummary}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ===================== SIMILAR CITIES COMPARISON ===================== */}
            {researchResult?.similarCities && researchResult.similarCities.length > 0 && (
              <div className="bg-[#0f0f0f] border border-cyan-500/20 rounded-2xl p-6">
                <button
                  onClick={() => toggleSection('similar')}
                  className="w-full flex items-center justify-between"
                >
                  <SectionHeader icon={Globe} title="Comparable Locations Analysis" color="text-cyan-400" />
                  {expandedSections.similar ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {expandedSections.similar && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-400 mb-4">
                      Cities with similar economic profiles, demographics, or strategic characteristics. Use this analysis to evaluate alternatives or understand competitive positioning.
                    </p>

                    {/* Comparison Table */}
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-3 px-2 text-slate-400 font-semibold">Location</th>
                            <th className="text-left py-3 px-2 text-slate-400 font-semibold">Country</th>
                            <th className="text-center py-3 px-2 text-slate-400 font-semibold">Similarity</th>
                            <th className="text-left py-3 px-2 text-slate-400 font-semibold">Why Similar</th>
                            <th className="text-left py-3 px-2 text-slate-400 font-semibold">Key Difference</th>
                            <th className="text-center py-3 px-2 text-slate-400 font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Current Location Row */}
                          <tr className="border-b border-amber-500/30 bg-amber-500/10">
                            <td className="py-3 px-2">
                              <div className="font-semibold text-amber-300">{activeProfile?.city}</div>
                            </td>
                            <td className="py-3 px-2 text-white">{activeProfile?.country}</td>
                            <td className="py-3 px-2 text-center">
                              <span className="text-amber-400 font-bold">Current</span>
                            </td>
                            <td className="py-3 px-2 text-slate-300">Base comparison location</td>
                            <td className="py-3 px-2 text-slate-400">a"</td>
                            <td className="py-3 px-2 text-center">
                              <span className="text-[10px] text-amber-300">Selected</span>
                            </td>
                          </tr>
                          {/* Similar Cities Rows */}
                          {researchResult.similarCities.map((similar: SimilarCity, idx: number) => (
                            <tr key={idx} className="border-b border-slate-800 hover:bg-cyan-500/5 transition-colors">
                              <td className="py-3 px-2">
                                <div className="font-semibold text-white">{similar.city}</div>
                                <div className="text-[10px] text-slate-500">{similar.region}</div>
                              </td>
                              <td className="py-3 px-2 text-slate-300">{similar.country}</td>
                              <td className="py-3 px-2 text-center">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${
                                  (similar.similarity || 0) >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                                  (similar.similarity || 0) >= 60 ? 'bg-cyan-500/20 text-cyan-400' :
                                  'bg-slate-700 text-slate-300'
                                }`}>
                                  <span className="text-lg font-bold">{similar.similarity || 'a"'}%</span>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-slate-300 max-w-[200px]">
                                <p className="line-clamp-2">{similar.reason}</p>
                              </td>
                              <td className="py-3 px-2 text-cyan-300 max-w-[150px]">
                                <p className="line-clamp-2">{similar.keyMetric}</p>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <button
                                  onClick={() => handleSearchSubmit(`${similar.city}, ${similar.country}`)}
                                  className="px-3 py-1.5 text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg hover:bg-cyan-500/30"
                                >
                                  Research a'
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Visual Comparison Cards */}
                    <div className="grid md:grid-cols-3 gap-4">
                      {researchResult.similarCities.slice(0, 3).map((similar: SimilarCity, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleSearchSubmit(`${similar.city}, ${similar.country}`)}
                          className="text-left p-4 border border-slate-800 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                              <Globe className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div className={`text-xl font-bold ${
                              (similar.similarity || 0) >= 80 ? 'text-emerald-400' :
                              (similar.similarity || 0) >= 60 ? 'text-cyan-400' :
                              'text-slate-400'
                            }`}>
                              {similar.similarity || 'a"'}%
                            </div>
                          </div>
                          <div className="text-lg font-semibold text-white group-hover:text-cyan-300">
                            {similar.city}
                          </div>
                          <div className="text-xs text-slate-400 mb-2">{similar.country}</div>
                          <div className="text-[11px] text-slate-300 line-clamp-2 mb-2">{similar.reason}</div>
                          <div className="p-2 bg-black/30 rounded-lg">
                            <div className="text-[10px] text-slate-500 uppercase">Key Difference</div>
                            <div className="text-[11px] text-cyan-300 mt-1">{similar.keyMetric}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Comparison Methodology Note */}
                    <div className="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-slate-500 mt-0.5" />
                        <div className="text-[11px] text-slate-400">
                          <strong>Methodology:</strong> Similarity scores are calculated based on population size, economic output, key industries, 
                          geographic location, and development stage. Higher scores indicate stronger alignment for comparison purposes.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===================== DATA METHODOLOGY SECTION ===================== */}
            <div className="bg-[#0f0f0f] border border-slate-500/20 rounded-2xl p-6">
              <SectionHeader icon={Database} title="Data Collection Methodology" color="text-slate-400" />
              <p className="text-xs text-slate-400 mb-6">
                Understanding how this intelligence report was compiled and the sources used to verify information.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Primary Data Sources */}
                <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-semibold text-emerald-300">Primary Sources (High Reliability)</h4>
                  </div>
                  <ul className="space-y-2 text-[11px] text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span><strong>Government Portals:</strong> Official .gov websites, census bureaus, statistical offices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span><strong>World Bank:</strong> GDP, population, economic indicators, development data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span><strong>International Organizations:</strong> IMF, UN, OECD, ADB, regional development banks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span><strong>Investment Authorities:</strong> Trade offices, investment promotion agencies</span>
                    </li>
                  </ul>
                </div>

                {/* Secondary Data Sources */}
                <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-semibold text-amber-300">Secondary Sources (Medium Reliability)</h4>
                  </div>
                  <ul className="space-y-2 text-[11px] text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400">a - </span>
                      <span><strong>News Media:</strong> Major news outlets, business publications, local newspapers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400">a - </span>
                      <span><strong>Academic Sources:</strong> Research papers, university studies, think tanks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400">a - </span>
                      <span><strong>Encyclopedias:</strong> Wikipedia (cross-referenced with primary sources)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400">a - </span>
                      <span><strong>Industry Reports:</strong> Market research, sector analyses</span>
                    </li>
                  </ul>
                </div>

                {/* Data Collection Methods */}
                <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Search className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-semibold text-blue-300">Collection Methods</h4>
                  </div>
                  <ul className="space-y-2 text-[11px] text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">1.</span>
                      <span><strong>API Integration:</strong> Direct data feeds from World Bank, OpenStreetMap, REST Countries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">2.</span>
                      <span><strong>AI Synthesis:</strong> AI processes and synthesizes data from multiple sources</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">3.</span>
                      <span><strong>Cross-Verification:</strong> Data points verified against multiple authoritative sources</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">4.</span>
                      <span><strong>Caching:</strong> Results cached locally for faster access and reduced API calls</span>
                    </li>
                  </ul>
                </div>

                {/* Data Quality Scoring */}
                <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <h4 className="text-sm font-semibold text-purple-300">Quality Scoring System</h4>
                  </div>
                  <div className="space-y-3 text-[11px]">
                    <div className="flex items-center justify-between p-2 bg-emerald-500/10 border border-emerald-500/30 rounded">
                      <span className="text-emerald-300">a~...a~...a~... High Reliability</span>
                      <span className="text-emerald-400">Government, World Bank, Int'l Orgs</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-amber-500/10 border border-amber-500/30 rounded">
                      <span className="text-amber-300">a~...a~... Medium Reliability</span>
                      <span className="text-amber-400">News, Research, Academia</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-700/50 border border-slate-600 rounded">
                      <span className="text-slate-300">a~... Lower Reliability</span>
                      <span className="text-slate-400">User content, unverified sources</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Process */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-semibold text-white">Verification Process</span>
                </div>
                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div className="p-2">
                    <div className="w-8 h-8 mx-auto mb-2 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold">1</div>
                    <div className="text-[10px] text-slate-300">Query submitted to multi-source research engine</div>
                  </div>
                  <div className="p-2">
                    <div className="w-8 h-8 mx-auto mb-2 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold">2</div>
                    <div className="text-[10px] text-slate-300">Data fetched from APIs & authoritative sources</div>
                  </div>
                  <div className="p-2">
                    <div className="w-8 h-8 mx-auto mb-2 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold">3</div>
                    <div className="text-[10px] text-slate-300">AI synthesizes & cross-references information</div>
                  </div>
                  <div className="p-2">
                    <div className="w-8 h-8 mx-auto mb-2 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold">4</div>
                    <div className="text-[10px] text-slate-300">Quality score assigned & report generated</div>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                  <div className="text-[11px] text-amber-200">
                    <strong>Important:</strong> This report is for informational purposes only. Data accuracy depends on source availability 
                    and freshness. Always verify critical information with official government sources before making business or investment 
                    decisions. Leadership information should be confirmed with official government websites.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Leader Detail Modal - Comprehensive */}
      {activeLeader && (
        <div className="fixed inset-0 z-30 bg-black/80 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setActiveLeader(null)}>
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-4xl w-full my-8" onClick={(event) => event.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {activeLeader.imageUrl ? (
                    <img src={activeLeader.imageUrl} alt={activeLeader.name} className="w-24 h-24 rounded-full object-cover border-2 border-purple-500/40" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/40 to-purple-600/40 flex items-center justify-center text-3xl font-bold">
                      {activeLeader.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold">{activeLeader.name}</h3>
                    <p className="text-slate-400">{activeLeader.role}</p>
                    <p className="text-sm text-slate-500">{activeLeader.tenure}</p>
                    {activeLeader.imageUrl && (
                      <p className="text-[10px] text-amber-300 mt-1">
                        {activeLeader.photoSourceUrl ? (
                          <a href={activeLeader.photoSourceUrl} target="_blank" rel="noreferrer" className="hover:underline">Official photo source</a>
                        ) : (
                          'Official photo source pending verification'
                        )}
                      </p>
                    )}
                    {activeLeader.politicalParty && (
                      <span className="inline-block mt-2 px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-full text-xs text-purple-300">
                        {activeLeader.politicalParty}
                      </span>
                    )}
                    {activeLeader.internationalEngagementFocus && (
                      <span className="inline-block ml-2 mt-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs text-amber-300">
                        🌍 Int'l Engagement Lead
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-amber-400">{activeLeader.rating.toFixed(1)}</div>
                  <div className="text-[10px] text-slate-400 uppercase">Performance Rating</div>
                  <button onClick={() => setActiveLeader(null)} className="mt-4 px-4 py-2 text-xs font-semibold border border-white/20 rounded-lg hover:bg-white/10">
                    Close
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Biography */}
              {(activeLeader.bio || activeLeader.fullBio) && (
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Biography
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{activeLeader.fullBio || activeLeader.bio}</p>
                </div>
              )}

              {/* Education & Previous Positions */}
              <div className="grid md:grid-cols-2 gap-4">
                {activeLeader.education && activeLeader.education.length > 0 && (
                  <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" /> Education
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {activeLeader.education.map((edu, i) => (
                        <li key={i}>* {edu}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {activeLeader.previousPositions && activeLeader.previousPositions.length > 0 && (
                  <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Previous Positions
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {activeLeader.previousPositions.map((pos, i) => (
                        <li key={i}>* {pos}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Key Achievements */}
              <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" /> Key Achievements
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeLeader.achievements.map(item => (
                    <span key={item} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs text-emerald-300">
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* News Reports */}
              {activeLeader.newsReports && activeLeader.newsReports.length > 0 && (
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-2">
                    <Newspaper className="w-4 h-4" /> Recent News Reports
                  </h4>
                  <div className="space-y-3">
                    {activeLeader.newsReports.map((news, i) => (
                      <div key={i} className="p-3 border border-slate-800 rounded-lg">
                        <div className="font-semibold text-sm text-white">{news.headline}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{news.date} * {news.source}</div>
                        {news.summary && <p className="text-xs text-slate-300 mt-2">{news.summary}</p>}
                        {news.url && (
                          <a href={news.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300">
                            Read more <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Projects */}
              {activeLeader.pastProjects && activeLeader.pastProjects.length > 0 && (
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                    <History className="w-4 h-4" /> Past Projects (Completed)
                  </h4>
                  <div className="space-y-3">
                    {activeLeader.pastProjects.map((project, i) => (
                      <div key={i} className="p-3 border border-emerald-500/20 rounded-lg bg-emerald-500/5">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-sm">{project.name}</div>
                          <ProjectBadge status={project.status} />
                        </div>
                        <div className="text-xs text-slate-300 mt-2">{project.description}</div>
                        <div className="flex flex-wrap gap-4 mt-2 text-[10px] text-slate-400">
                          {project.startDate && project.endDate && (
                            <span><Clock className="inline w-3 h-3 mr-1" />{project.startDate} - {project.endDate}</span>
                          )}
                          {project.budget && (
                            <span><DollarSign className="inline w-3 h-3 mr-1" />{project.budget}</span>
                          )}
                        </div>
                        {project.impact && (
                          <div className="mt-2 p-2 bg-emerald-500/10 rounded text-xs text-emerald-300">
                            <strong>Impact:</strong> {project.impact}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Projects */}
              {activeLeader.currentProjects && activeLeader.currentProjects.length > 0 && (
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2">
                    <Rocket className="w-4 h-4" /> Current & Planned Projects
                  </h4>
                  <div className="space-y-3">
                    {activeLeader.currentProjects.map((project, i) => (
                      <div key={i} className="p-3 border border-blue-500/20 rounded-lg bg-blue-500/5">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-sm">{project.name}</div>
                          <ProjectBadge status={project.status} />
                        </div>
                        <div className="text-xs text-slate-300 mt-2">{project.description}</div>
                        <div className="flex flex-wrap gap-4 mt-2 text-[10px] text-slate-400">
                          {project.startDate && (
                            <span><Clock className="inline w-3 h-3 mr-1" />Started: {project.startDate}</span>
                          )}
                          {project.budget && (
                            <span><DollarSign className="inline w-3 h-3 mr-1" />{project.budget}</span>
                          )}
                        </div>
                        {project.impact && (
                          <div className="mt-2 p-2 bg-blue-500/10 rounded text-xs text-blue-300">
                            <strong>Expected Impact:</strong> {project.impact}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Government Links */}
              {activeLeader.governmentLinks && activeLeader.governmentLinks.length > 0 && (
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Official Government Links
                  </h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {activeLeader.governmentLinks.map((link, i) => (
                      <a 
                        key={i}
                        href={link.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-2 border border-blue-500/30 rounded-lg hover:bg-blue-500/10 text-xs text-blue-300 flex items-center gap-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact & Social Media */}
              <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Contact Information</h4>
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  {activeLeader.officeAddress && (
                    <div className="flex items-start gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                      <span>{activeLeader.officeAddress}</span>
                    </div>
                  )}
                  {activeLeader.contactEmail && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-slate-500">📊</span>
                      <a href={`mailto:${activeLeader.contactEmail}`} className="text-blue-400 hover:underline">{activeLeader.contactEmail}</a>
                    </div>
                  )}
                  {activeLeader.socialMedia?.facebook && (
                    <a href={activeLeader.socialMedia.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline">
                      Facebook Profile
                    </a>
                  )}
                  {activeLeader.socialMedia?.twitter && (
                    <a href={activeLeader.socialMedia.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline">
                      Twitter/X Profile
                    </a>
                  )}
                  {activeLeader.socialMedia?.website && (
                    <a href={activeLeader.socialMedia.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline">
                      Official Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalLocationIntelligence;

