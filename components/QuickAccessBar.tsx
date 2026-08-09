import React, { useState } from 'react';
import { 
  Sparkles, Database, Brain, Map, FileText, TrendingUp, 
  AlertTriangle, Zap, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickAccessBarProps {
  onFeatureClick: (feature: string) => void;
  onDiscoverClick: () => void;
}

export const QuickAccessBar: React.FC<QuickAccessBarProps> = ({ 
  onFeatureClick, 
  onDiscoverClick 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const quickFeatures = [
    { 
      id: 'intelligence-library', 
      icon: <Database className="w-5 h-5" />, 
      label: 'Intelligence Library',
      description: '100+ reference deals',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'deep-reasoning', 
      icon: <Brain className="w-5 h-5" />, 
      label: 'Deep Reasoning',
      description: 'AI-powered analysis',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      id: 'cultural-intelligence', 
      icon: <Map className="w-5 h-5" />, 
      label: 'Cultural Intel',
      description: 'Business norms by country',
      color: 'from-emerald-500 to-emerald-600'
    },
    { 
      id: 'document-suite', 
      icon: <FileText className="w-5 h-5" />, 
      label: 'Documents',
      description: '20+ types available',
      color: 'from-amber-500 to-amber-600'
    },
    { 
      id: 'scenario-planning', 
      icon: <TrendingUp className="w-5 h-5" />, 
      label: 'Scenarios',
      description: 'Best/worst/likely',
      color: 'from-indigo-500 to-indigo-600'
    },
    { 
      id: 'risk-scoring', 
      icon: <AlertTriangle className="w-5 h-5" />, 
      label: 'Risk Scores',
      description: 'Real-time alerts',
      color: 'from-red-500 to-red-600'
    }
  ];

  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 flex flex-col gap-2">
      {/* Discover Button - Always Visible */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDiscoverClick}
        className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
        title="Discover Hidden Features"
      >
        <Sparkles className="w-6 h-6" />
        
        {/* Pulsing Badge */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse">
          <span className="absolute inset-0 bg-red-500 rounded-full animate-ping" />
        </span>

        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-stone-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Unlock Hidden Features
          <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 w-0 h-0 border-l-8 border-l-stone-900 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
        </div>
      </motion.button>

      {/* Toggle Expand Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white border-2 border-stone-300 text-stone-600 p-3 rounded-full shadow-lg hover:shadow-xl hover:border-indigo-400 transition-all"
        title={isExpanded ? 'Hide Quick Access' : 'Show Quick Access'}
      >
        <Zap className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Quick Feature Buttons */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-2"
          >
            {quickFeatures.map((feature, index) => (
              <motion.button
                key={feature.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onFeatureClick(feature.id)}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`group relative bg-gradient-to-r ${feature.color} text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all`}
                title={feature.label}
              >
                {feature.icon}

                {/* Expanded Tooltip */}
                <AnimatePresence>
                  {hoveredFeature === feature.id && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-stone-900 text-white px-4 py-3 rounded-lg shadow-xl whitespace-nowrap"
                    >
                      <div className="font-bold text-sm mb-1">{feature.label}</div>
                      <div className="text-xs text-stone-300">{feature.description}</div>
                      <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 w-0 h-0 border-l-8 border-l-stone-900 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.open('https://github.com/yourusername/bw-nexus-ai', '_blank')}
        className="bg-white border-2 border-stone-300 text-stone-600 p-3 rounded-full shadow-lg hover:shadow-xl hover:border-blue-400 transition-all"
        title="Documentation"
      >
        <HelpCircle className="w-5 h-5" />
      </motion.button>
    </div>
  );
};

export default QuickAccessBar;

