import React from 'react';
import { Layers, ChevronLeft, Ruler, PencilRuler } from 'lucide-react';

interface ArchitectPageProps {
  onBack: () => void;
}

export const ArchitectPage: React.FC<ArchitectPageProps> = ({ onBack }) => {
  return (
    <div className="h-full w-full bg-stone-50 flex flex-col">
       <div className="h-16 bg-white border-b border-stone-200 flex items-center px-6 justify-between shrink-0">
          <div className="flex items-center gap-3">
             <button onClick={onBack} className="p-2 hover:bg-stone-100 rounded-lg text-stone-500">
                <ChevronLeft size={20} />
             </button>
             <h2 className="font-bold text-stone-800 flex items-center gap-2">
                <Layers className="text-blue-600" /> System Architect
             </h2>
          </div>
       </div>
       
       <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 text-stone-300 border border-stone-100">
             <PencilRuler size={48} />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Blueprint Designer</h1>
          <p className="text-stone-500 max-w-md">
             The Architect module allows for custom agent definitions and prompt engineering. 
             This module is currently in closed beta.
          </p>
       </div>
    </div>
  );
};
