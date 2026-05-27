import { Building2, Target, Shield, Globe, BarChart3, Handshake, Zap, Sparkles, DollarSign, Activity, Layers, Network, TrendingUp, Plus, Users, Scale, Settings, GitBranch, History, CheckCircle, MessageCircle, Briefcase, BarChart, Cpu, MapPin, ArrowRight, Calculator, AlertCircle, ShieldCheck, Search, Database, PieChart } from 'lucide-react';
export const toolCategories = {
    identity: [
        { id: 'entity-profile', icon: Building2, label: 'Entity Profile', description: 'Legal structure & registration' },
        { id: 'capabilities', icon: Zap, label: 'Capabilities', description: 'Core competencies & resources' },
        { id: 'market-positioning', icon: Target, label: 'Market Positioning', description: 'Competitive positioning strategy' },
        { id: 'strategic-intent', icon: Sparkles, label: 'Strategic Intent', description: 'Vision, mission & objectives' },
        { id: 'risk-appetite', icon: Shield, label: 'Risk Appetite', description: 'Risk tolerance framework' },
        { id: 'financial-health', icon: DollarSign, label: 'Financial Health', description: 'Balance sheet & cash flow' },
        { id: 'operational-scale', icon: Activity, label: 'Operational Scale', description: 'Headcount & infrastructure' },
        { id: 'brand-assets', icon: Layers, label: 'Brand Assets', description: 'IP, trademarks & reputation' },
        { id: 'stakeholder-map', icon: Network, label: 'Stakeholder Map', description: 'Key relationships & influence' },
        { id: 'growth-metrics', icon: TrendingUp, label: 'Growth Metrics', description: 'Performance indicators' },
        { id: 'custom-identity', icon: Plus, label: 'Add Custom', description: 'Define custom identity aspect' }
    ],
    mandate: [
        { id: 'strategic-objectives', icon: Target, label: 'Strategic Objectives', description: 'Measurable goals & KPIs' },
        { id: 'partner-profiling', icon: Users, label: 'Partner Profiling', description: 'Ideal partner characteristics' },
        { id: 'value-proposition', icon: Handshake, label: 'Value Proposition', description: 'Mutual benefit framework' },
        { id: 'negotiation-strategy', icon: Scale, label: 'Negotiation Strategy', description: 'Terms & conditions approach' },
        { id: 'governance-model', icon: Settings, label: 'Governance Model', description: 'Decision-making structure' },
        { id: 'integration-plan', icon: GitBranch, label: 'Integration Plan', description: 'Post-deal execution roadmap' },
        { id: 'timeline-roadmap', icon: History, label: 'Timeline Roadmap', description: 'Key milestones & deadlines' },
        { id: 'success-criteria', icon: CheckCircle, label: 'Success Criteria', description: 'Win conditions & metrics' },
        { id: 'resource-allocation', icon: Briefcase, label: 'Resource Allocation', description: 'Budget & team assignment' },
        { id: 'communication-plan', icon: MessageCircle, label: 'Communication Plan', description: 'Stakeholder engagement' },
        { id: 'custom-mandate', icon: Plus, label: 'Add Custom', description: 'Define custom mandate element' }
    ],
    market: [
        { id: 'target-markets', icon: Globe, label: 'Target Markets', description: 'Geographic & demographic focus' },
        { id: 'competitive-analysis', icon: BarChart, label: 'Competitive Analysis', description: 'Market share & positioning' },
        { id: 'customer-segmentation', icon: Users, label: 'Customer Segmentation', description: 'Target customer profiles' },
        { id: 'regulatory-landscape', icon: ShieldCheck, label: 'Regulatory Landscape', description: 'Legal & compliance framework' },
        { id: 'economic-indicators', icon: DollarSign, label: 'Economic Indicators', description: 'Market size & growth rates' },
        { id: 'technology-trends', icon: Cpu, label: 'Technology Trends', description: 'Innovation & disruption factors' },
        { id: 'geopolitical-factors', icon: MapPin, label: 'Geopolitical Factors', description: 'Political & cultural risks' },
        { id: 'supply-chain', icon: Network, label: 'Supply Chain', description: 'Logistics & distribution networks' },
        { id: 'pricing-strategy', icon: Calculator, label: 'Pricing Strategy', description: 'Revenue models & margins' },
        { id: 'market-entry', icon: ArrowRight, label: 'Market Entry Strategy', description: 'Go-to-market approach' },
        { id: 'custom-market', icon: Plus, label: 'Add Custom', description: 'Define custom market factor' }
    ],
    risk: [
        { id: 'risk-assessment', icon: AlertCircle, label: 'Risk Assessment', description: 'Identify & evaluate risks' },
        { id: 'mitigation-strategies', icon: Shield, label: 'Mitigation Strategies', description: 'Risk reduction approaches' },
        { id: 'monitoring-framework', icon: Activity, label: 'Monitoring Framework', description: 'Ongoing risk tracking' },
        { id: 'contingency-planning', icon: History, label: 'Contingency Planning', description: 'Backup plans & scenarios' },
        { id: 'insurance-coverage', icon: ShieldCheck, label: 'Insurance Coverage', description: 'Risk transfer mechanisms' },
        { id: 'legal-liability', icon: Scale, label: 'Legal Liability', description: 'Contractual & regulatory risks' },
        { id: 'financial-exposure', icon: DollarSign, label: 'Financial Exposure', description: 'Capital at risk analysis' },
        { id: 'operational-risks', icon: Settings, label: 'Operational Risks', description: 'Process & execution risks' },
        { id: 'reputational-risks', icon: Users, label: 'Reputational Risks', description: 'Brand & stakeholder impact' },
        { id: 'cybersecurity', icon: Shield, label: 'Cybersecurity', description: 'Digital security assessment' },
        { id: 'custom-risk', icon: Plus, label: 'Add Custom', description: 'Define custom risk category' }
    ],
    analysis: [
        { id: 'predictive-growth', icon: TrendingUp, label: 'Predictive Growth', description: 'AI-driven market forecasting' },
        { id: 'scenario-planning', icon: Calculator, label: 'Scenario Planning', description: 'Multi-outcome modeling' },
        { id: 'partnership-analyzer', icon: Network, label: 'Partnership Analyzer', description: 'Existing relationship assessment' },
        { id: 'ai-recommendations', icon: Sparkles, label: 'AI Recommendations', description: 'Machine learning insights' },
        { id: 'roi-diagnostic', icon: Target, label: 'ROI Diagnostic', description: 'Return on investment analysis' },
        { id: 'global-comparison', icon: Globe, label: 'Global Comparison', description: 'Cross-market opportunity analysis' },
        { id: 'competitive-intelligence', icon: BarChart3, label: 'Competitive Intelligence', description: 'Market positioning analysis' },
        { id: 'real-time-monitoring', icon: Activity, label: 'Real-time Monitoring', description: 'Live market intelligence' },
        { id: 'financial-modeling', icon: PieChart, label: 'Financial Modeling', description: '5-year projections & valuations' },
        { id: 'due-diligence', icon: Briefcase, label: 'Due Diligence Engine', description: 'Automated background checks' },
        { id: 'custom-analysis', icon: Plus, label: 'Add Custom', description: 'Define custom analysis tool' }
    ],
    marketplace: [
        { id: 'deal-marketplace', icon: TrendingUp, label: 'Deal Marketplace', description: 'Live partnership opportunities' },
        { id: 'compatibility-engine', icon: Handshake, label: 'Compatibility Engine', description: 'Synergy scoring algorithm' },
        { id: 'global-comparison', icon: Globe, label: 'Global Comparison', description: 'Cross-market analytics' },
        { id: 'partnership-repository', icon: Database, label: 'Partnership Repository', description: 'Knowledge base management' },
        { id: 'partner-search', icon: Search, label: 'Partner Search', description: 'Advanced partner discovery' },
        { id: 'deal-pipeline', icon: Briefcase, label: 'Deal Pipeline', description: 'Track negotiation progress' },
        { id: 'network-mapping', icon: Network, label: 'Network Mapping', description: 'Visual relationship networks' },
        { id: 'valuation-engine', icon: DollarSign, label: 'Valuation Engine', description: 'Partnership valuation tools' },
        { id: 'negotiation-advisor', icon: Scale, label: 'Negotiation Advisor', description: 'Strategic negotiation support' },
        { id: 'success-metrics', icon: CheckCircle, label: 'Success Metrics', description: 'Partnership performance tracking' },
        { id: 'custom-marketplace', icon: Plus, label: 'Add Custom', description: 'Define custom marketplace tool' }
    ]
};
