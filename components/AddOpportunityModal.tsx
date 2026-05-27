import React, { useState } from 'react';
import { LiveOpportunityItem } from '../types';
import useEscapeKey from '../hooks/useEscapeKey';
import { X, PlusCircle, Briefcase } from 'lucide-react';
import { COUNTRIES, INDUSTRIES } from '../constants';

interface AddOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<LiveOpportunityItem, 'isUserAdded' | 'ai_feasibility_score' | 'ai_risk_assessment'>) => void;
}

export const AddOpportunityModal: React.FC<AddOpportunityModalProps> = ({ isOpen, onClose, onSave }) => {
    useEscapeKey(onClose);

    const [projectName, setProjectName] = useState('');
    const [country, setCountry] = useState(COUNTRIES[0]);
    const [sector, setSector] = useState(INDUSTRIES[0].id);
    const [value, setValue] = useState('');
    const [summary, setSummary] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!projectName.trim() || !summary.trim()) {
            setError('Project Name and Summary are required.');
            return;
        }
        onSave({
            project_name: projectName,
            country: country,
            sector: sector,
            value: value,
            summary: summary,
            source_url: sourceUrl,
        });
        // Clear form for next time
        setProjectName('');
        setCountry(COUNTRIES[0]);
        setSector(INDUSTRIES[0].id);
        setValue('');
        setSummary('');
        setSourceUrl('');
    };
    
    if (!isOpen) return null;

    const inputStyles = "w-full p-3 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-stone-800 outline-none transition-all duration-200 placeholder:text-stone-400 text-stone-800 shadow-sm text-sm";
    const labelStyles = "block text-xs font-bold uppercase mb-2";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose} role="dialog">
            <div 
                className="bg-white border border-stone-200 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-5 flex justify-between items-center border-b border-stone-100 flex-shrink-0 bg-stone-50">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-lg border border-stone-200">
                             <PlusCircle className="w-6 h-6 text-stone-800" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold" style={{color:'#1C1C1C', fontFamily:'Inter, Arial, sans-serif'}}>Add Target Opportunity</h2>
                            <p className="text-xs" style={{color:'#808080', fontFamily:'Inter, Arial, sans-serif'}}>Inject a specific project into the analysis engine.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-200 transition-colors" style={{color:'#808080'}}><X className="w-5 h-5"/></button>
                </header>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <main className="p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
                        <div>
                            <label htmlFor="projectName" className={labelStyles} style={{color:'#1C1C1C', fontFamily:'Inter, Arial, sans-serif'}}>Project Name *</label>
                            <input type="text" id="projectName" value={projectName} onChange={e => setProjectName(e.target.value)} className={inputStyles} placeholder="e.g., National Fiber Optic Backbone Expansion" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="country" className={labelStyles} style={{color:'#1C1C1C', fontFamily:'Inter, Arial, sans-serif'}}>Country *</label>
                                <select id="country" value={country} onChange={e => setCountry(e.target.value)} className={inputStyles} required>
                                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="sector" className={labelStyles} style={{color:'#1C1C1C', fontFamily:'Inter, Arial, sans-serif'}}>Sector *</label>
                                <select id="sector" value={sector} onChange={e => setSector(e.target.value)} className={inputStyles} required>
                                    {INDUSTRIES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                </select>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="value" className={labelStyles} style={{color:'#1C1C1C', fontFamily:'Inter, Arial, sans-serif'}}>Est. Value (Optional)</label>
                            <input type="text" id="value" value={value} onChange={e => setValue(e.target.value)} className={inputStyles} placeholder="e.g., $250 Million" />
                        </div>
                        <div>
                            <label htmlFor="summary" className={labelStyles} style={{color:'#1C1C1C', fontFamily:'Inter, Arial, sans-serif'}}>Context / Notes *</label>
                            <textarea id="summary" value={summary} onChange={e => setSummary(e.target.value)} rows={4} className={`${inputStyles} resize-none`} placeholder="Provide a brief overview of the project, its goals, and current status." required />
                        </div>
                         <div>
                            <label htmlFor="sourceUrl" className={labelStyles} style={{color:'#1C1C1C', fontFamily:'Inter, Arial, sans-serif'}}>Source URL (Optional)</label>
                            <input type="url" id="sourceUrl" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} className={inputStyles} placeholder="https://example.gov/project-details" />
                        </div>
                        {error && <p className="text-red-600 text-xs text-center bg-red-50 p-2 rounded border border-red-100 font-bold">{error}</p>}
                                        {error && <p className="text-red-600 text-xs text-center bg-red-50 p-2 rounded border border-red-100 font-bold">{error}</p>}
                    </main>

                    <footer className="p-4 bg-stone-50 border-t border-stone-200 flex-shrink-0 flex justify-end items-center gap-4">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-xs font-bold uppercase" style={{color:'#808080', fontFamily:'Inter, Arial, sans-serif'}}>
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2.5 bg-stone-900 text-white text-xs font-bold uppercase rounded-lg hover:bg-black transition-colors shadow-sm flex items-center gap-2">
                            <Briefcase size={14} /> Save to Matrix
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};
