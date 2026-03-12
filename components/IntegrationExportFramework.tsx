import React, { useState } from 'react';
import { Download, Zap, Settings, FileJson, FileText, Share2, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface ExportTemplate {
  id: string;
  name: string;
  format: 'csv' | 'json' | 'pdf' | 'xml';
  description: string;
  fields: string[];
  lastUsed?: Date;
  enabled: boolean;
}

interface Integration {
  id: string;
  name: string;
  platform: string;
  status: 'connected' | 'disconnected' | 'error';
  config: {
    apiKey?: string;
    endpoint?: string;
    authentication: string;
  };
  lastSync?: Date;
  syncFrequency: 'manual' | 'hourly' | 'daily' | 'weekly';
}
interface ExportHistory {
  id: string;
  date: Date;
  format: string;
  destination: string;
  recordCount: number;
  status: 'success' | 'failed' | 'pending';
  size: string;
}

const IntegrationExportFramework: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'exports' | 'integrations' | 'templates' | 'history'>('exports');
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    exports: true,
    salesforce: true,
    templates: true,
    history: false,
    webhooks: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate dates once to avoid impure function calls during render
  const [now] = useState(() => Date.now());
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'sfdc',
      name: 'Salesforce CRM',
      platform: 'Salesforce',
      status: 'connected',
      config: {
        apiKey: '****-****-****-****',
        endpoint: 'https://api.salesforce.com/v57.0',
        authentication: 'OAuth 2.0'
      },
      lastSync: new Date(now - 2 * 60 * 60 * 1000),
      syncFrequency: 'daily'
    },
    {
      id: 'hubspot',
      name: 'HubSpot CRM',
      platform: 'HubSpot',
      status: 'disconnected',
      config: {
        apiKey: undefined,
        endpoint: 'https://api.hubapi.com',
        authentication: 'API Key'
      },
      syncFrequency: 'manual'
    },
    {
      id: 'sap',
      name: 'SAP ERP',
      platform: 'SAP',
      status: 'error',
      config: {
        apiKey: '****-****-****-****',
        endpoint: 'https://sap.company.com:8000',
        authentication: 'Basic Auth'
      },
      lastSync: new Date(now - 48 * 60 * 60 * 1000),
      syncFrequency: 'weekly'
    }
  ]);

  const [exportTemplates] = useState<ExportTemplate[]>([
    {
      id: 'exec-summary',
      name: 'Executive Summary Report',
      format: 'pdf',
      description: 'Full partnership analysis with key metrics and recommendations',
      fields: ['partnership_name', 'compatibility_score', 'financial_summary', 'risks', 'recommendations', 'timeline'],
      lastUsed: new Date(now - 1 * 60 * 60 * 1000),
      enabled: true
    },
    {
      id: 'salesforce-contact',
      name: 'Salesforce Account Format',
      format: 'json',
      description: 'Import-ready JSON for Salesforce Account object',
      fields: ['company_name', 'industry', 'country', 'revenue', 'employees', 'custom_fields'],
      lastUsed: new Date(now - 24 * 60 * 60 * 1000),
      enabled: true
    },
    {
      id: 'board-presentation',
      name: 'Board Presentation Deck',
      format: 'pdf',
      description: 'Formatted slides for C-suite presentation',
      fields: ['executive_summary', 'market_analysis', 'financial_projections', 'risk_assessment', 'recommendations'],
      enabled: true
    },
    {
      id: 'crm-leads',
      name: 'CRM Lead Import',
      format: 'csv',
      description: 'Comma-separated values for bulk CRM import',
      fields: ['company', 'contact_name', 'email', 'phone', 'industry', 'opportunity_size'],
      enabled: true
    },
    {
      id: 'erp-vendor',
      name: 'ERP Vendor Master',
      format: 'xml',
      description: 'XML format for ERP vendor master data',
      fields: ['vendor_code', 'name', 'country', 'payment_terms', 'contact_info', 'banking_details'],
      enabled: false
    }
  ]);

  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([
    {
      id: '1',
      date: new Date(now - 1 * 60 * 60 * 1000),
      format: 'PDF',
      destination: 'Email: CEO@company.com',
      recordCount: 1,
      status: 'success',
      size: '2.3 MB'
    },
    {
      id: '2',
      date: new Date(now - 6 * 60 * 60 * 1000),
      format: 'JSON',
      destination: 'Salesforce CRM',
      recordCount: 15,
      status: 'success',
      size: '156 KB'
    },
    {
      id: '3',
      date: new Date(now - 24 * 60 * 60 * 1000),
      format: 'CSV',
      destination: 'Excel Spreadsheet',
      recordCount: 42,
      status: 'success',
      size: '89 KB'
    },
    {
      id: '4',
      date: new Date(now - 48 * 60 * 60 * 1000),
      format: 'XML',
      destination: 'SAP ERP',
      recordCount: 8,
      status: 'failed',
      size: '156 KB'
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(exportTemplates[0]);
  const [webhookUrl, setWebhookUrl] = useState('https://your-webhook-endpoint.com/receive');

  const handleExport = (template: ExportTemplate) => {
    const csv = `Export: ${template.name}
Date: ${new Date().toLocaleString()}
Format: ${template.format}
Fields: ${template.fields.join(', ')}

--- Sample Data ---
partnership_id,name,country,compatibility_score
P001,Vietnam Tech Partner,Vietnam,87
P002,Mexico Manufacturing,Mexico,72
P003,Poland Services,Poland,91
    `;
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `export-${template.id}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    // Add to history
    const newExport: ExportHistory = {
      id: now.toString(),
      date: new Date(),
      format: template.format.toUpperCase(),
      destination: 'Local Download',
      recordCount: 3,
      status: 'success',
      size: '89 KB'
    };
    setExportHistory([newExport, ...exportHistory]);
  };

  const updateIntegration = (id: string, status: Integration['status']) => {
    setIntegrations(integrations.map(int => 
      int.id === id ? { ...int, status, lastSync: new Date() } : int
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-900 border-green-300';
      case 'disconnected':
        return 'bg-gray-100 text-gray-900 border-gray-300';
      case 'error':
        return 'bg-red-100 text-red-900 border-red-300';
      default:
        return 'bg-slate-100 text-slate-900 border-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <RefreshCw className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full bg-slate-50 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Share2 className="w-8 h-8 text-blue-600" />
            Integration & Export Framework
          </h2>
          <p className="text-slate-600">Seamlessly export analyses to external systems (CRM, ERP) and configure API integrations for real-time data sync</p>
        </div>

        {/* TABS */}
        <div className="flex gap-2 border-b border-slate-300 bg-white rounded-t-lg">
          {(['exports', 'integrations', 'templates', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'exports' && <Download className="w-4 h-4 inline mr-2" />}
              {tab === 'integrations' && <Zap className="w-4 h-4 inline mr-2" />}
              {tab === 'templates' && <FileJson className="w-4 h-4 inline mr-2" />}
              {tab === 'history' && <Clock className="w-4 h-4 inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* EXPORTS TAB */}
        {activeTab === 'exports' && (
          <div className="space-y-6">
            {/* EXPORT OPTIONS */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Quick Export Options
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {/* CSV Export */}
                <div className="border-2 border-slate-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer" onClick={() => handleExport(exportTemplates[3])}>
                  <div className="flex items-start gap-3">
                    <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-slate-900">CSV Export</h4>
                      <p className="text-sm text-slate-600 mt-1">Import to Excel, Google Sheets, or any spreadsheet application</p>
                      <div className="text-xs text-slate-500 mt-2">Format: Comma-separated values</div>
                    </div>
                  </div>
                </div>

                {/* JSON Export */}
                <div className="border-2 border-slate-300 rounded-lg p-4 hover:border-green-400 hover:bg-green-50 transition-all cursor-pointer" onClick={() => handleExport(exportTemplates[1])}>
                  <div className="flex items-start gap-3">
                    <FileJson className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-slate-900">JSON Export</h4>
                      <p className="text-sm text-slate-600 mt-1">Structured data format for API integration and webhooks</p>
                      <div className="text-xs text-slate-500 mt-2">Format: JavaScript Object Notation</div>
                    </div>
                  </div>
                </div>

                {/* PDF Export */}
                <div className="border-2 border-slate-300 rounded-lg p-4 hover:border-red-400 hover:bg-red-50 transition-all cursor-pointer" onClick={() => handleExport(exportTemplates[0])}>
                  <div className="flex items-start gap-3">
                    <FileText className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-slate-900">PDF Report</h4>
                      <p className="text-sm text-slate-600 mt-1">Professional formatted report for presentations and distribution</p>
                      <div className="text-xs text-slate-500 mt-2">Format: Portable Document Format</div>
                    </div>
                  </div>
                </div>

                {/* Email Export */}
                <div className="border-2 border-slate-300 rounded-lg p-4 hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Share2 className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-slate-900">Email Distribution</h4>
                      <p className="text-sm text-slate-600 mt-1">Send reports directly to stakeholders with custom recipients</p>
                      <div className="text-xs text-slate-500 mt-2">Recipients: Configurable list</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DESTINATION ROUTING */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                Export Destinations
              </h3>

              <div className="space-y-3">
                {[
                  { name: 'Salesforce CRM', icon: '', desc: 'Sync partnership data to Salesforce accounts' },
                  { name: 'HubSpot', icon: '', desc: 'Import records as HubSpot companies and deals' },
                  { name: 'SAP ERP', icon: '', desc: 'Push data to SAP vendor master and contract modules' },
                  { name: 'Local Storage', icon: '', desc: 'Download to your local machine' },
                  { name: 'Cloud Storage', icon: '', desc: 'Upload to Google Drive, OneDrive, or Dropbox' }
                ].map((dest, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{dest.icon}</span>
                      <div>
                        <div className="font-bold text-slate-900">{dest.name}</div>
                        <div className="text-xs text-slate-600">{dest.desc}</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-colors">
                      Configure
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INTEGRATIONS TAB */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            {integrations.map(integration => (
              <div 
                key={integration.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => toggleSection(integration.id)}
              >
                <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{integration.name}</h3>
                      <div className={`text-xs font-bold mt-1 inline-flex items-center gap-1 px-2 py-1 rounded border ${getStatusColor(integration.status)}`}>
                        {getStatusIcon(integration.status)}
                        {integration.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl">{expandedSections[integration.id] ? '▾' : '▸'}</div>
                </div>

                {expandedSections[integration.id] && (
                  <div className="p-6 space-y-4 border-t border-slate-200">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">Platform</label>
                        <input type="text" value={integration.platform} className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-slate-50" disabled />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">Sync Frequency</label>
                        <select value={integration.syncFrequency} className="w-full px-3 py-2 border border-slate-300 rounded text-sm">
                          <option>manual</option>
                          <option>hourly</option>
                          <option>daily</option>
                          <option>weekly</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">API Endpoint</label>
                      <input type="text" value={integration.config.endpoint} className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">Authentication Method</label>
                      <input type="text" value={integration.config.authentication} className="w-full px-3 py-2 border border-slate-300 rounded text-sm" disabled />
                    </div>

                    {integration.lastSync && (
                      <div className="text-xs text-slate-600">
                        Last synced: {integration.lastSync.toLocaleString()}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => updateIntegration(integration.id, integration.status === 'connected' ? 'disconnected' : 'connected')}
                        className={`flex-1 px-3 py-2 rounded font-bold text-sm transition-colors ${
                          integration.status === 'connected'
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                      </button>
                      <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded font-bold text-sm hover:bg-blue-700 transition-colors">
                        Test Sync
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* WEBHOOK CONFIGURATION */}
            <div 
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => toggleSection('webhooks')}
            >
              <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Webhook Configuration
                </h3>
                <div className="text-2xl">{expandedSections.webhooks ? '▾' : '▸'}</div>
              </div>

              {expandedSections.webhooks && (
                <div className="p-6 space-y-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">Configure webhooks to receive real-time notifications when partnership data changes</p>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Webhook URL</label>
                    <input 
                      type="text" 
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-2 block">Events to Subscribe</label>
                    <div className="space-y-2">
                      {['partnership_created', 'partnership_updated', 'analysis_completed', 'export_generated', 'sync_failed'].map(event => (
                        <label key={event} className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                          <span className="text-sm text-slate-700">{event.replace(/_/g, ' ').toUpperCase()}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button className="w-full px-4 py-2 bg-purple-600 text-white rounded font-bold hover:bg-purple-700 transition-colors">
                    Save Webhook Configuration
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            {exportTemplates.map(template => (
              <div 
                key={template.id}
                className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-400 bg-blue-50 shadow-md'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900">{template.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        template.format === 'pdf' ? 'bg-red-100 text-red-900' :
                        template.format === 'json' ? 'bg-green-100 text-green-900' :
                        template.format === 'csv' ? 'bg-blue-100 text-blue-900' :
                        'bg-purple-100 text-purple-900'
                      }`}>
                        {template.format.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.fields.map(field => (
                        <span key={field} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded">
                          {field}
                        </span>
                      ))}
                    </div>
                    {template.lastUsed && (
                      <div className="text-xs text-slate-500 mt-2">
                        Last used: {template.lastUsed.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button 
                      onClick={() => handleExport(template)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-colors"
                    >
                      Export
                    </button>
                    <button className="px-3 py-1 bg-slate-200 text-slate-900 rounded text-xs font-bold hover:bg-slate-300 transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-600" />
                Export History ({exportHistory.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-300 bg-slate-50">
                    <th className="text-left py-3 px-4 font-bold text-slate-900">Date</th>
                    <th className="text-left py-3 px-4 font-bold text-slate-900">Format</th>
                    <th className="text-left py-3 px-4 font-bold text-slate-900">Destination</th>
                    <th className="text-center py-3 px-4 font-bold text-slate-900">Records</th>
                    <th className="text-left py-3 px-4 font-bold text-slate-900">Size</th>
                    <th className="text-center py-3 px-4 font-bold text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {exportHistory.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-700">{exp.date.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{exp.format}</td>
                      <td className="py-3 px-4 text-slate-700">{exp.destination}</td>
                      <td className="text-center py-3 px-4 text-slate-700">{exp.recordCount}</td>
                      <td className="py-3 px-4 text-slate-700">{exp.size}</td>
                      <td className="text-center py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                          exp.status === 'success' ? 'bg-green-100 text-green-900' :
                          exp.status === 'failed' ? 'bg-red-100 text-red-900' :
                          'bg-yellow-100 text-yellow-900'
                        }`}>
                          {exp.status === 'success' && <CheckCircle className="w-3 h-3" />}
                          {exp.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                          {exp.status.charAt(0).toUpperCase() + exp.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default IntegrationExportFramework;

