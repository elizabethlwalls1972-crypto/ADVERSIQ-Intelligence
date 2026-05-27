import React from 'react';
import { NeuroSymbolicState, ChecklistItem } from '../types';
import { CheckCircle, Circle, AlertCircle, ListTodo } from 'lucide-react';

interface ChecklistGatekeeperProps {
    state: NeuroSymbolicState;
    onItemClick?: (itemId: string) => void;
}

export const ChecklistGatekeeper: React.FC<ChecklistGatekeeperProps> = ({ state, onItemClick }) => {
    const items = state.checklist;
    const completed = items.filter(i => i.status === 'satisfied' || i.status === 'skipped').length;
    const total = items.length;
    const progress = Math.round((completed / total) * 100);

    const categories = Array.from(new Set(items.map(i => i.category)));

    return (
        <div className="bg-stone-900 text-white rounded-xl overflow-hidden flex flex-col h-full shadow-xl">
            {/* Header */}
            <div className="p-5 border-b border-stone-800 bg-black/20">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <ListTodo className="w-5 h-5 text-bw-gold" />
                        Gatekeeper Protocol
                    </h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${progress === 100 ? 'bg-green-900 text-green-300' : 'bg-stone-800 text-stone-400'}`}>
                        {completed}/{total} Active
                    </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-700 ${progress === 100 ? 'bg-green-500' : 'bg-bw-gold'}`} 
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {categories.map(cat => (
                    <div key={cat}>
                        <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2 sticky top-0 bg-stone-900 py-1 z-10">
                            {cat} Layer
                        </h4>
                        <div className="space-y-1">
                            {items.filter(i => i.category === cat).map(item => (
                                <div 
                                    key={item.id}
                                    onClick={() => onItemClick && onItemClick(item.id)}
                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                        item.status === 'satisfied' ? 'bg-green-900/10 hover:bg-green-900/20' : 
                                        item.status === 'failed' ? 'bg-red-900/10 hover:bg-red-900/20' : 
                                        'hover:bg-stone-800'
                                    }`}
                                >
                                    {item.status === 'satisfied' ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> :
                                     item.status === 'failed' ? <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" /> :
                                     <Circle className="w-4 h-4 text-stone-600 flex-shrink-0" />}
                                    
                                    <div className="min-w-0 flex-1">
                                        <div className={`text-xs font-medium truncate ${item.status === 'satisfied' ? 'text-stone-300' : 'text-stone-100'}`}>
                                            {item.label}
                                        </div>
                                        {item.value && (
                                            <div className="text-[10px] text-stone-500 truncate">
                                                Val: {String(item.value)}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {item.required && item.status !== 'satisfied' && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" title="Required" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

