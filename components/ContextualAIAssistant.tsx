import React from 'react';
import { 
  Sparkles, Brain, Database, Map, AlertTriangle, TrendingUp, 
  FileText, Scale, Target, DollarSign, Shield, Users 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  autoRun?: boolean;
  action: () => void;
}

interface ContextualAIAssistantProps {
  activeStep: string;
  onLaunchFeature: (featureId: string) => void;
  organizationName?: string;
  country?: string;
  city?: string;
}

// Map steps to relevant AI features
const STEP_FEATURES: Record<string, AIFeature[]> = {
  identity: [
    {
      id: 'cultural-intelligence',
      title: 'Cultural Intelligence',
      description: 'Business norms, etiquette, and negotiation tactics by country',
      icon: Map,
      badge: 'PREMIUM',
      action: () => {},
    },
    {
      id: 'competitive-map',
      title: 'Competitive Landscape',
      description: 'Visual analysis of competitors and white space',
      icon: Target,
      badge: 'HIGH VALUE',
      action: () => {},
    },
    {
      id: 'adversarial-shield',
      title: 'Adversarial Input Shield',
      description: 'Auto-validates claims against sanctions lists and macro data.',
      icon: Shield,
      badge: 'AUTO',
      autoRun: true,
      action: () => {},
    },
  ],
  mandate: [
    {
      id: 'deep-reasoning',
      title: 'Deep Reasoning Engine',
      description: 'Multi-step scenario analysis with cause-effect tracing',
      icon: Brain,
      badge: 'PREMIUM',
      action: () => {},
    },
    {
      id: 'intelligence-library',
      title: 'Intelligence Library',
      description: 'Learn from 100+ historical deals and proven patterns',
      icon: Database,
      badge: 'HIGH VALUE',
      action: () => {},
    },
    {
      id: 'multi-perspective',
      title: 'Multi-Perspective Reasoner',
      description: 'Runs skeptic/advocate/regulator personas automatically.',
      icon: Users,
      badge: 'AUTO',
      autoRun: true,
      action: () => {},
    },
  ],
  market: [
    {
      id: 'alternative-locations',
      title: 'Alternative Locations',
      description: 'Suggests backup markets if primary choice is risky',
      icon: Map,
      badge: 'NEW',
      action: () => {},
    },
    {
      id: 'competitive-map',
      title: 'Market Analysis',
      description: 'Understand competitive positioning and opportunities',
      icon: Target,
      action: () => {},
    },
  ],
  'partner-personas': [
    {
      id: 'intelligence-library',
      title: 'Partnership Intelligence',
      description: '5+ years of reference deals for partner insights',
      icon: Database,
      badge: 'HIGH VALUE',
      action: () => {},
    },
    {
      id: 'deep-reasoning',
      title: 'Partner Fit Analysis',
      description: 'Analyze compatibility and hidden dependencies',
      icon: Brain,
      action: () => {},
    },
  ],
  financial: [
    {
      id: 'scenario-planning',
      title: 'Scenario Planning',
      description: 'Monte Carlo simulation for best/worst/likely outcomes',
      icon: TrendingUp,
      badge: 'PREMIUM',
      action: () => {},
    },
    {
      id: 'benchmark-comparison',
      title: 'Financial Benchmarking',
      description: 'Compare your deal to 100+ historical transactions',
      icon: DollarSign,
      action: () => {},
    },
    {
      id: 'counterfactual-lab',
      title: 'Counterfactual Lab',
      description: 'Auto-produces opposite-scenario outcomes & regret odds.',
      icon: Brain,
      badge: 'AUTO',
      autoRun: true,
      action: () => {},
    },
  ],
  risks: [
    {
      id: 'risk-scoring',
      title: 'Real-Time Risk Scoring',
      description: 'Live risk scores (1-10) with country heat maps',
      icon: AlertTriangle,
      badge: 'HIGH VALUE',
      action: () => {},
    },
    {
      id: 'ethics-panel',
      title: 'ESG & Ethics Analyzer',
      description: 'Compliance checking, human rights, environmental impact',
      icon: Scale,
      badge: 'NEW',
      action: () => {},
    },
    {
      id: 'bias-scanner',
      title: 'Motivation & Bias Scanner',
      description: 'Flags greed/overconfidence signals automatically.',
      icon: Shield,
      badge: 'AUTO',
      autoRun: true,
      action: () => {},
    },
  ],
  capabilities: [
    {
      id: 'intelligence-library',
      title: 'Capability Reference',
      description: 'See how others built similar capabilities',
      icon: Database,
      action: () => {},
    },
  ],
  execution: [
    {
      id: 'scenario-planning',
      title: 'Timeline Scenarios',
      description: 'Stress test your timeline assumptions',
      icon: TrendingUp,
      action: () => {},
    },
  ],
  governance: [
    {
      id: 'document-suite',
      title: 'Governance Documents',
      description: 'Generate 20+ document types (MOUs, LOIs, NDAs)',
      icon: FileText,
      badge: 'PREMIUM',
      action: () => {},
    },
    {
      id: 'intelligence-library',
      title: 'Governance Best Practices',
      description: 'Learn from proven governance structures',
      icon: Database,
      action: () => {},
    },
    {
      id: 'self-learning-memory',
      title: 'Self-Learning Memory Loop',
      description: 'Continuously recalibrates models based on live outcomes.',
      icon: Brain,
      badge: 'AUTO',
      autoRun: true,
      action: () => {},
    },
  ],
  'rate-liquidity': [
    {
      id: 'fx-shock-resilience',
      title: 'FX Shock Resilience',
      description: 'P&L deltas for +/-1/2/3If moves; hedge coverage and gaps.',
      icon: DollarSign,
      badge: 'HIGH VALUE',
      action: () => {},
    },
    {
      id: 'capital-stack-resilience',
      title: 'Capital Stack Resilience',
      description: 'DSCR/ICR under +100/+200 bps rate shocks; covenant headroom.',
      icon: Shield,
      badge: 'PREMIUM',
      action: () => {},
    },
    {
      id: 'inflation-rate-pass-through',
      title: 'Inflation & Rate Pass-through',
      description: 'Margin impact of rate/inflation moves given pricing power.',
      icon: TrendingUp,
      action: () => {},
    },
    {
      id: 'evidence-gating',
      title: 'ECS/TIS Gating',
      description: 'Clamps language and export actions when evidence is weak.',
      icon: AlertTriangle,
      badge: 'AUTO',
      autoRun: true,
      action: () => {},
    },
  ],
};

const AUTONOMOUS_MODULES: Record<string, { id: string; title: string; status: 'active' | 'monitoring'; summary: string }[]> = {
  identity: [
    {
      id: 'adversarial-shield',
      title: 'Adversarial Input Shield',
      status: 'active',
      summary: 'Cross-checking entity details vs sanctions + governance data.',
    },
    {
      id: 'motivation-graph',
      title: 'Motivation Graph',
      status: 'monitoring',
      summary: 'Watching for desperation, greed, or overconfidence signals.',
    },
  ],
  mandate: [
    {
      id: 'multi-perspective',
      title: 'Multi-Perspective Reasoner',
      status: 'active',
      summary: 'Running skeptic, advocate, regulator, operator personas.',
    },
  ],
  financial: [
    {
      id: 'counterfactual-lab',
      title: 'Counterfactual Lab',
      status: 'active',
      summary: 'Testing opposite strategies and computing regret odds.',
    },
  ],
  risks: [
    {
      id: 'bias-scanner',
      title: 'Bias Scanner',
      status: 'monitoring',
      summary: 'Scanning risk narratives for hidden motivations.',
    },
  ],
  governance: [
    {
      id: 'self-learning-memory',
      title: 'Self-Learning Memory',
      status: 'active',
      summary: 'Collecting outcome data to recalibrate playbooks.',
    },
  ],
  'rate-liquidity': [
    {
      id: 'evidence-gating',
      title: 'ECS/TIS Gating',
      status: 'active',
      summary: 'Clamping language and export until evidence quality is adequate.',
    },
  ],
};

const ContextualAIAssistant: React.FC<ContextualAIAssistantProps> = ({
  activeStep,
  onLaunchFeature,
  organizationName,
  country,
  city,
}) => {
  const features = STEP_FEATURES[activeStep] || [];
  const autoModules = AUTONOMOUS_MODULES[activeStep] || [];

  if (features.length === 0) return null;

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'HIGH VALUE':
        return 'bg-emerald-500 text-white';
      case 'PREMIUM':
        return 'bg-purple-500 text-white';
      case 'NEW':
        return 'bg-blue-500 text-white';
      case 'AUTO':
        return 'bg-indigo-600 text-white';
      default:
        return 'bg-stone-300 text-stone-700';
    }
  };

  const handleFeatureLaunch = (feature: AIFeature) => {
    if (feature.autoRun) return;
    onLaunchFeature(feature.id);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="fixed right-6 top-24 w-80 bg-white border border-blue-200 rounded-xl shadow-lg overflow-hidden z-60"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                AI Assistant
              </div>
              <div className="text-xs text-blue-600">
                Tools for this step
              </div>
            </div>
          </div>
        </div>

        {/* Context Info */}
        {(organizationName || country || city) && (
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
            <div className="text-[10px] uppercase tracking-wider text-blue-700 font-semibold mb-1">
              Working On:
            </div>
            <div className="text-xs text-blue-900 font-medium">
              {organizationName && <div>{organizationName}</div>}
              {(country || city) && (
                <div className="text-blue-600">
                  {city && city}{country && `, ${country}`}
                </div>
              )}
            </div>
          </div>
        )}

        {autoModules.length > 0 && (
          <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100">
            <div className="text-[10px] uppercase tracking-wider text-indigo-800 font-semibold mb-1">
              Autonomous Brain Status
            </div>
            <div className="space-y-1">
              {autoModules.map((module) => (
                <div key={module.id} className="flex items-start gap-2">
                  <Brain size={14} className="text-indigo-600 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-stone-900">
                      {module.title}
                      <span className={`ml-2 text-[9px] font-black uppercase tracking-wider ${module.status === 'active' ? 'text-green-600' : 'text-amber-600'}`}>
                        {module.status === 'active' ? 'Active' : 'Monitoring'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600">{module.summary}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-indigo-700 mt-2">Runs automatically - no action needed.</p>
          </div>
        )}

        {/* Feature Cards */}
        <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
          {features.map((feature) => (
            <motion.button
              key={feature.id}
              onClick={() => handleFeatureLaunch(feature)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={feature.autoRun}
              className={`w-full text-left p-3 rounded-lg border transition-all group ${
                feature.autoRun
                  ? 'border-indigo-200 bg-indigo-50 cursor-default'
                  : 'border-stone-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 group-hover:shadow-lg transition-shadow">
                  <feature.icon size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-stone-900 group-hover:text-blue-700">
                      {feature.title}
                    </span>
                    {feature.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${getBadgeStyle(
                          feature.badge
                        )}`}
                      >
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 leading-snug">
                    {feature.description}
                  </p>
                  {feature.autoRun && (
                    <p className="text-[10px] text-indigo-700 font-semibold mt-1">
                      Auto-run insight: refreshed continuously in this step.
                    </p>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-stone-50 border-t border-stone-200">
          <div className="text-[10px] text-stone-500 text-center">
            AI-powered insights to strengthen your {activeStep} strategy
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContextualAIAssistant;

