import React, { useState } from 'react';
import { 
  Sparkles, Database, Brain, Globe, TrendingUp, Shield, 
  FileText, Zap, Target, Map, Search,
  BarChart3, AlertTriangle, Briefcase, ChevronRight, X
} from 'lucide-react';
import { motion } from 'framer-motion';

interface FeatureDiscoveryPanelProps {
  onFeatureSelect: (feature: string) => void;
  onClose: () => void;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'intelligence' | 'analysis' | 'documents' | 'strategy';
  badge?: string;
  available: boolean;
}

export const FeatureDiscoveryPanel: React.FC<FeatureDiscoveryPanelProps> = ({ 
  onFeatureSelect, 
  onClose 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const features: Feature[] = [
    // Intelligence Features
    {
      id: 'intelligence-library',
      title: 'Intelligence Library',
      description: 'Deep reference library of patterns, precedents, and proven strategies across domains',
      icon: <Database className="w-5 h-5" />,
      category: 'intelligence',
      badge: 'HIGH VALUE',
      available: true
    },
    {
      id: 'deep-reasoning',
      title: 'Five Independent AI Minds',
      description: 'Skeptic, Advocate, Regulator, Accountant, Operator - five personas debate every conclusion',
      icon: <Brain className="w-5 h-5" />,
      category: 'intelligence',
      badge: 'CORE',
      available: true
    },
    {
      id: 'cultural-intelligence',
      title: '54+ Proprietary Formulas',
      description: 'Every dimension scored by proprietary indices: SPI, IVAS, SCF, RROI, SEAM, and more',
      icon: <Globe className="w-5 h-5" />,
      category: 'intelligence',
      available: true
    },
    {
      id: 'competitive-map',
      title: 'Competitive Intelligence Map',
      description: 'Visual landscape analysis with white space identification',
      icon: <Map className="w-5 h-5" />,
      category: 'analysis',
      available: true
    },
    {
      id: 'alternative-locations',
      title: 'Alternative Location Matcher',
      description: 'Suggest backup markets if primary choice is risky',
      icon: <Target className="w-5 h-5" />,
      category: 'analysis',
      available: true
    },
    {
      id: 'ethics-panel',
      title: 'ESG & Ethics Analyzer',
      description: 'Compliance checking, human rights, environmental impact',
      icon: <Shield className="w-5 h-5" />,
      category: 'analysis',
      available: true
    },
    
    // Strategy Features
    {
      id: 'scenario-planning',
      title: 'Monte Carlo Stress Testing',
      description: '10,000-iteration simulations producing probabilistic outcome distributions with VaR and regret analysis',
      icon: <TrendingUp className="w-5 h-5" />,
      category: 'strategy',
      badge: 'CORE',
      available: true
    },
    {
      id: 'risk-scoring',
      title: 'Real-Time Risk Scoring',
      description: 'Live risk scores with country heat maps',
      icon: <AlertTriangle className="w-5 h-5" />,
      category: 'strategy',
      available: true
    },
    {
      id: 'benchmark-comparison',
      title: 'Automated Benchmarking',
      description: 'Compare your deal to 100+ similar historical deals',
      icon: <BarChart3 className="w-5 h-5" />,
      category: 'strategy',
      available: true
    },
    
    // Document Features
    {
      id: 'document-suite',
      title: '240+ Document Types',
      description: 'LOI, MOU, NDA, SLA, Term Sheets, proposals, mandates, and 230+ more generated on demand',
      icon: <FileText className="w-5 h-5" />,
      category: 'documents',
      available: true
    },
    {
      id: 'deal-marketplace',
      title: 'Deal Marketplace',
      description: 'Browse opportunities, match with potential partners',
      icon: <Briefcase className="w-5 h-5" />,
      category: 'intelligence',
      badge: 'REVENUE',
      available: true
    },
    {
      id: 'command-center',
      title: 'Executive Command Center',
      description: 'Portfolio dashboard with all KPIs and team tracking',
      icon: <Zap className="w-5 h-5" />,
      category: 'strategy',
      available: true
    }
  ];

  const categories = [
    { id: 'all', label: 'All Features', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'intelligence', label: 'Intelligence', icon: <Database className="w-4 h-4" /> },
    { id: 'analysis', label: 'Analysis', icon: <Brain className="w-4 h-4" /> },
    { id: 'strategy', label: 'Strategy', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> }
  ];

  const filteredFeatures = features.filter(feature => {
    const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory;
    const matchesSearch = feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Unlock Hidden Features</h2>
                <p className="text-indigo-100 text-sm">Discover $5M worth of built-in intelligence</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-200" />
            <input
              type="text"
              placeholder="Search features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-stone-200 bg-stone-50 px-6 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-stone-600 hover:bg-stone-100'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeatures.map(feature => (
              <motion.div
                key={feature.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-stone-200 rounded-xl p-5 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => onFeatureSelect(feature.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-stone-900">{feature.title}</h3>
                      {feature.badge && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded">
                          {feature.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-600 mb-3">{feature.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${
                        feature.available ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {feature.available ? '✓ Available Now' : 'Coming Soon'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredFeatures.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500">No features found matching your search</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 bg-stone-50 p-4 flex items-center justify-between">
          <div className="text-sm text-stone-600">
            <span className="font-semibold">{filteredFeatures.length}</span> features available
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FeatureDiscoveryPanel;

