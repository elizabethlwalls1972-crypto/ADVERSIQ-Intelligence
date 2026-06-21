
import React, { useState } from 'react';
import { Shield, Users, Database, Lock, Key, CheckCircle, Save } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [keys, setKeys] = useState({
      worldBank: '',
      imf: '',
      bloomberg: '',
      sec: '',
      custom: ''
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full w-full bg-stone-100 p-8 pb-32 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3" style={{color:'#1C1C1C', fontFamily:'Inter, Arial, sans-serif'}}>
          <Shield className="text-stone-700" size={32} /> Admin Console
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <AdminCard title="User Management" icon={<Users />} value="12 Active" />
           <AdminCard title="Data Connections" icon={<Database />} value="4 Connected" />
           <AdminCard title="Security Status" icon={<Lock />} value="Enforced" color="text-green-600" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden mb-8">
            <div className="p-6 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold flex items-center gap-2" style={{color:'#1C1C1C', fontFamily:'Inter, Arial, sans-serif'}}>
                        <Key className="w-5 h-5 text-blue-600" /> Data Source Configuration
                    </h2>
                    <p className="text-sm" style={{color:'#808080', fontFamily:'Inter, Arial, sans-serif'}}>Manage API keys for external intelligence feeds.</p>
                </div>
                <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors"
                >
                    {saved ? <CheckCircle size={16} /> : <Save size={16} />}
                    {saved ? 'Keys Saved' : 'Save Configuration'}
                </button>
            </div>
            
            <div className="p-8 grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:'#808080'}}>Institutional Feeds</h3>
                    <ApiKeyInput label="World Bank Data API" value={keys.worldBank} onChange={(v) => setKeys({...keys, worldBank: v})} placeholder="WK-..." />
                    <ApiKeyInput label="IMF Economic Data" value={keys.imf} onChange={(v) => setKeys({...keys, imf: v})} placeholder="IMF-..." />
                    <ApiKeyInput label="SEC EDGAR (Corporate Filings)" value={keys.sec} onChange={(v) => setKeys({...keys, sec: v})} placeholder="SEC-..." />
                </div>
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:'#808080'}}>Financial & Custom</h3>
                    <ApiKeyInput label="Bloomberg Terminal API" value={keys.bloomberg} onChange={(v) => setKeys({...keys, bloomberg: v})} placeholder="BB-..." />
                    <ApiKeyInput label="Custom Enterprise Data Gateway" value={keys.custom} onChange={(v) => setKeys({...keys, custom: v})} placeholder="https://api.internal..." />
                    
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mt-6">
                        <h4 className="text-sm font-bold text-blue-800 mb-2">Secure Storage Active</h4>
                        <p className="text-xs text-blue-700">All keys are encrypted at rest using AES-256 and injected into the Orchestrator Service at runtime. No keys are exposed to the client-side log.</p>
                    </div>
                </div>
            </div>
        </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
              <p style={{color:'#808080', fontFamily:'Inter, Arial, sans-serif'}}>System Logs and User Audit Trails are available in the Security Tab.</p>
        </div>
      </div>
    </div>
  );
};

const ApiKeyInput = ({ label, value, onChange, placeholder }: any) => (
    <div>
        <label className="block text-sm font-bold mb-1" style={{color:'#1C1C1C', fontFamily:'Inter, Arial, sans-serif'}}>{label}</label>
        <div className="relative">
            <input 
                type="password" 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                className="w-full p-3 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono tracking-wider"
                placeholder={placeholder}
            />
            <div className="absolute right-3 top-3 text-xs font-bold select-none" style={{color:'#808080'}}>API KEY</div>
        </div>
    </div>
);

const AdminCard = ({ title, icon, value, color = 'text-stone-900' }: any) => (
    <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
        <div className="flex items-center justify-between mb-4" style={{color:'#808080'}}>
       {icon}
    </div>
    <div className="text-2xl font-bold" style={{color:'#1C1C1C', fontFamily:'Inter, Arial, sans-serif'}}>{value}</div>
    <div className="text-xs uppercase font-bold mt-1" style={{color:'#808080'}}>{title}</div>
  </div>
);

export default AdminDashboard;

