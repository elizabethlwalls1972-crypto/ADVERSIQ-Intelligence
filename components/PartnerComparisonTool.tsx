import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Plus, Trash2, TrendingUp,
  AlertTriangle, CheckCircle, Globe, Building2,
  Scale, History, BarChart3, Target, Loader2, X
} from 'lucide-react';
import { 
  PartnerComparisonEngine, 
  PartnershipHistoryTracker,
  ExistingPartner,
  PartnerComparisonResult
} from '../services/PartnerComparisonEngine';
import { ReportParameters } from '../types';

interface PartnerComparisonToolProps {
  context?: Partial<ReportParameters>;
}

export default function PartnerComparisonTool({ context = {} }: PartnerComparisonToolProps) {
  const [partners, setPartners] = useState<ExistingPartner[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<ExistingPartner | null>(null);
  const [comparisonResult, setComparisonResult] = useState<PartnerComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [activeTab, setActiveTab] = useState<'partners' | 'comparison' | 'history'>('partners');

  // Load partners on mount
  useEffect(() => {
    setPartners(PartnershipHistoryTracker.getAllPartners());
  }, []);

  const handleAddPartner = (partner: ExistingPartner) => {
    PartnershipHistoryTracker.addPartner(partner);
    setPartners(PartnershipHistoryTracker.getAllPartners());
    setShowAddForm(false);
  };

  const handleDeletePartner = (partnerId: string) => {
    if (confirm('Are you sure you want to remove this partner?')) {
      PartnershipHistoryTracker.removePartner(partnerId);
      setPartners(PartnershipHistoryTracker.getAllPartners());
      if (selectedPartner?.id === partnerId) {
        setSelectedPartner(null);
        setComparisonResult(null);
      }
    }
  };

  const handleCompare = async (partner: ExistingPartner) => {
    setSelectedPartner(partner);
    setIsComparing(true);
    setActiveTab('comparison');
    
    try {
      const result = await PartnerComparisonEngine.comparePartner(partner, context);
      setComparisonResult(result);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setIsComparing(false);
    }
  };

  const metrics = PartnershipHistoryTracker.getPartnershipMetrics();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-stone-100 bg-gradient-to-r from-blue-50 to-white">
        <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          <Scale className="w-6 h-6 text-blue-600" />
          Partner Comparison Engine
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          Compare your existing partners against global alternatives. Find better deals.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        {[
          { id: 'partners', label: 'My Partners', icon: Users },
          { id: 'comparison', label: 'Compare', icon: BarChart3 },
          { id: 'history', label: 'History', icon: History }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'partners' && (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-stone-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-stone-900">{metrics.totalPartners}</div>
                <div className="text-xs text-stone-500">Partners</div>
              </div>
              <div className="bg-stone-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${(metrics.totalValue / 1000000).toFixed(1)}M
                </div>
                <div className="text-xs text-stone-500">Total Value</div>
              </div>
              <div className="bg-stone-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.averageRelationshipLength.toFixed(1)}y
                </div>
                <div className="text-xs text-stone-500">Avg Length</div>
              </div>
              <div className="bg-stone-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(metrics.byRegion).length}
                </div>
                <div className="text-xs text-stone-500">Regions</div>
              </div>
            </div>

            {/* Add Partner Button */}
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 border-2 border-dashed border-stone-300 rounded-lg text-stone-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Existing Partner
            </button>

            {/* Partner List */}
            {partners.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No partners added yet. Add your existing partners to compare them.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {partners.map(partner => (
                  <PartnerCard
                    key={partner.id}
                    partner={partner}
                    onCompare={() => handleCompare(partner)}
                    onDelete={() => handleDeletePartner(partner.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-6">
            {!selectedPartner ? (
              <div className="text-center py-12 text-stone-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a partner from the Partners tab to compare.</p>
              </div>
            ) : isComparing ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                <p className="text-stone-500">Analyzing global alternatives...</p>
              </div>
            ) : comparisonResult ? (
              <ComparisonResultView result={comparisonResult} />
            ) : null}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="text-center py-8 text-stone-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="mb-2">Partnership history tracking is active.</p>
              <p className="text-sm">Events are automatically logged when you add, update, or remove partners.</p>
            </div>

            {/* Type Distribution */}
            <div className="bg-stone-50 rounded-lg p-4">
              <h4 className="font-bold text-stone-700 mb-3">Partner Type Distribution</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(metrics.byType).filter(([, count]) => count > 0).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="text-stone-600 capitalize">{type}</span>
                    <span className="font-bold text-stone-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Region Distribution */}
            <div className="bg-stone-50 rounded-lg p-4">
              <h4 className="font-bold text-stone-700 mb-3">Geographic Distribution</h4>
              <div className="space-y-2">
                {Object.entries(metrics.byRegion).map(([region, count]) => (
                  <div key={region} className="flex justify-between text-sm">
                    <span className="text-stone-600">{region}</span>
                    <span className="font-bold text-stone-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Partner Modal */}
      {showAddForm && (
        <AddPartnerModal
          onAdd={handleAddPartner}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function PartnerCard({ 
  partner, 
  onCompare, 
  onDelete 
}: { 
  partner: ExistingPartner; 
  onCompare: () => void; 
  onDelete: () => void;
}) {
  // useMemo to prevent recalculation on every render while still being deterministic
  const yearsActive = useMemo(() => {
    const now = new Date();
    const start = new Date(partner.relationshipStart);
    return ((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
  }, [partner.relationshipStart]);

  return (
    <div className="border border-stone-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-stone-900">{partner.name}</h4>
          <div className="flex items-center gap-2 text-sm text-stone-500 mt-1">
            <Globe className="w-3 h-3" />
            {partner.country}
            <span className="text-stone-300">*</span>
            <Building2 className="w-3 h-3" />
            <span className="capitalize">{partner.type}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-600">
            {partner.dealValue ? `$${(partner.dealValue / 1000000).toFixed(1)}M` : 'N/A'}
          </div>
          <div className="text-xs text-stone-400">{yearsActive} years</div>
        </div>
      </div>

      {/* Performance Metrics */}
      {partner.performanceMetrics && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-stone-50 rounded p-2 text-center">
            <div className="text-sm font-bold text-stone-700">
              {partner.performanceMetrics.deliveryReliability || '--'}%
            </div>
            <div className="text-[10px] text-stone-400">Reliability</div>
          </div>
          <div className="bg-stone-50 rounded p-2 text-center">
            <div className="text-sm font-bold text-stone-700">
              {partner.performanceMetrics.valueDelivered || '--'}%
            </div>
            <div className="text-[10px] text-stone-400">Value</div>
          </div>
          <div className="bg-stone-50 rounded p-2 text-center">
            <div className="text-sm font-bold text-stone-700">
              {partner.performanceMetrics.renewalLikelihood || '--'}%
            </div>
            <div className="text-[10px] text-stone-400">Renewal</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onCompare}
          className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Target className="w-4 h-4" />
          Find Better Matches
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ComparisonResultView({ result }: { result: PartnerComparisonResult }) {
  const { alternatives, overallAssessment, marketBenchmark } = result;

  return (
    <div className="space-y-6">
      {/* Overall Assessment */}
      <div className={`p-4 rounded-lg border-2 ${
        overallAssessment.recommendation === 'actively-seek-change' 
          ? 'bg-red-50 border-red-200'
          : overallAssessment.recommendation === 'explore-alternatives'
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center gap-3 mb-2">
          {overallAssessment.recommendation === 'stay' ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : overallAssessment.recommendation === 'explore-alternatives' ? (
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          ) : (
            <TrendingUp className="w-6 h-6 text-red-600" />
          )}
          <h3 className="font-bold text-lg">
            {overallAssessment.recommendation === 'stay' 
              ? 'Current Partner is Competitive'
              : overallAssessment.recommendation === 'explore-alternatives'
              ? 'Alternatives Worth Exploring'
              : 'Strongly Consider Switching'}
          </h3>
        </div>
        <p className="text-sm text-stone-600">{overallAssessment.reasoning}</p>

        {/* Score Comparison */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-stone-900">
              {overallAssessment.currentPartnerScore}
            </div>
            <div className="text-xs text-stone-500">Current Score</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              overallAssessment.improvementPotential > 10 ? 'text-green-600' : 'text-stone-400'
            }`}>
              +{overallAssessment.improvementPotential}
            </div>
            <div className="text-xs text-stone-500">Potential Gain</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {marketBenchmark.yourPercentile}th
            </div>
            <div className="text-xs text-stone-500">Percentile</div>
          </div>
        </div>
      </div>

      {/* Alternatives */}
      <div>
        <h4 className="font-bold text-stone-700 mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Top Alternatives Found
        </h4>
        
        {alternatives.length === 0 ? (
          <div className="text-center py-8 bg-stone-50 rounded-lg text-stone-500">
            No significantly better alternatives found globally.
          </div>
        ) : (
          <div className="space-y-3">
            {alternatives.map((alt, idx) => (
              <div
                key={alt.id}
                className="border border-stone-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h5 className="font-bold text-stone-900">{alt.name}</h5>
                    </div>
                    <div className="text-sm text-stone-500 mt-1">
                      {alt.country} * {alt.region}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${
                      alt.matchScore > overallAssessment.currentPartnerScore 
                        ? 'text-green-600' 
                        : 'text-stone-600'
                    }`}>
                      {alt.matchScore}
                    </div>
                    <div className={`text-xs ${
                      alt.recommendation === 'strongly-consider-switch' 
                        ? 'text-green-600'
                        : alt.recommendation === 'consider-switch'
                        ? 'text-yellow-600'
                        : 'text-stone-400'
                    }`}>
                      {alt.recommendation.replace(/-/g, ' ')}
                    </div>
                  </div>
                </div>

                {/* Improvement Areas */}
                {alt.improvementAreas.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-bold text-stone-500 mb-1">IMPROVEMENTS</div>
                    <div className="flex flex-wrap gap-2">
                      {alt.improvementAreas.map((area, i) => (
                        <span
                          key={i}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                        >
                          {area.area}: +{area.improvement}pts
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Switching Info */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-bold text-stone-500">Switching Cost: </span>
                    <span className={`font-medium ${
                      alt.switchingCost === 'low' ? 'text-green-600' :
                      alt.switchingCost === 'medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {alt.switchingCost.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-500">Est. Revenue Share: </span>
                    <span className="text-stone-700">{alt.estimatedDealTerms.revenueShare}%</span>
                  </div>
                </div>

                {/* Rationale */}
                <div className="mt-3 text-xs text-stone-600 bg-stone-50 p-2 rounded">
                  {alt.rationale}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AddPartnerModal({ 
  onAdd, 
  onClose 
}: { 
  onAdd: (partner: ExistingPartner) => void; 
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'corporation' as ExistingPartner['type'],
    country: '',
    region: '',
    dealValue: '',
    revenueShare: '',
    exclusivity: false,
    duration: '',
    deliveryReliability: '',
    communicationQuality: '',
    valueDelivered: '',
    renewalLikelihood: '',
    strengths: '',
    weaknesses: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const partner: ExistingPartner = {
      id: `partner-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      country: formData.country,
      region: formData.region,
      relationshipStart: new Date(),
      dealValue: formData.dealValue ? parseFloat(formData.dealValue) : undefined,
      dealTerms: {
        revenueShare: formData.revenueShare ? parseFloat(formData.revenueShare) : undefined,
        exclusivity: formData.exclusivity,
        duration: formData.duration || undefined
      },
      performanceMetrics: {
        deliveryReliability: formData.deliveryReliability ? parseFloat(formData.deliveryReliability) : undefined,
        communicationQuality: formData.communicationQuality ? parseFloat(formData.communicationQuality) : undefined,
        valueDelivered: formData.valueDelivered ? parseFloat(formData.valueDelivered) : undefined,
        renewalLikelihood: formData.renewalLikelihood ? parseFloat(formData.renewalLikelihood) : undefined
      },
      strengths: formData.strengths ? formData.strengths.split(',').map(s => s.trim()) : undefined,
      weaknesses: formData.weaknesses ? formData.weaknesses.split(',').map(s => s.trim()) : undefined,
      notes: formData.notes || undefined
    };

    onAdd(partner);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-stone-200 flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-lg font-bold text-stone-900">Add Existing Partner</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">Partner Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., Acme Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">Partner Type *</label>
              <select
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as ExistingPartner['type'] }))}
                className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="government">Government</option>
                <option value="corporation">Corporation</option>
                <option value="investor">Investor</option>
                <option value="supplier">Supplier</option>
                <option value="distributor">Distributor</option>
                <option value="technology">Technology Partner</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">Country *</label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., Vietnam"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">Region</label>
              <input
                type="text"
                value={formData.region}
                onChange={e => setFormData(prev => ({ ...prev, region: e.target.value }))}
                className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., Asia-Pacific"
              />
            </div>
          </div>

          {/* Deal Terms */}
          <div className="border-t pt-4">
            <h4 className="font-bold text-stone-700 mb-3">Deal Terms</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Deal Value ($)</label>
                <input
                  type="number"
                  value={formData.dealValue}
                  onChange={e => setFormData(prev => ({ ...prev, dealValue: e.target.value }))}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="1000000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Revenue Share (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.revenueShare}
                  onChange={e => setFormData(prev => ({ ...prev, revenueShare: e.target.value }))}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="15"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="3 years"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.exclusivity}
                  onChange={e => setFormData(prev => ({ ...prev, exclusivity: e.target.checked }))}
                  className="w-4 h-4 rounded border-stone-300"
                />
                <span className="text-sm text-stone-700">Exclusivity Agreement</span>
              </label>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="border-t pt-4">
            <h4 className="font-bold text-stone-700 mb-3">Performance Metrics (0-100)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Delivery Reliability</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.deliveryReliability}
                  onChange={e => setFormData(prev => ({ ...prev, deliveryReliability: e.target.value }))}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="75"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Communication Quality</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.communicationQuality}
                  onChange={e => setFormData(prev => ({ ...prev, communicationQuality: e.target.value }))}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="80"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Value Delivered</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.valueDelivered}
                  onChange={e => setFormData(prev => ({ ...prev, valueDelivered: e.target.value }))}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="70"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Renewal Likelihood</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.renewalLikelihood}
                  onChange={e => setFormData(prev => ({ ...prev, renewalLikelihood: e.target.value }))}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="60"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t pt-4">
            <h4 className="font-bold text-stone-700 mb-3">Additional Info</h4>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">Strengths (comma-separated)</label>
              <input
                type="text"
                value={formData.strengths}
                onChange={e => setFormData(prev => ({ ...prev, strengths: e.target.value }))}
                className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Local knowledge, Strong network, Fast response"
              />
            </div>
            <div className="mt-3">
              <label className="block text-sm font-bold text-stone-700 mb-1">Weaknesses (comma-separated)</label>
              <input
                type="text"
                value={formData.weaknesses}
                onChange={e => setFormData(prev => ({ ...prev, weaknesses: e.target.value }))}
                className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="High costs, Limited capacity, Slow decision-making"
              />
            </div>
            <div className="mt-3">
              <label className="block text-sm font-bold text-stone-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                rows={3}
                placeholder="Any additional context..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Partner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

