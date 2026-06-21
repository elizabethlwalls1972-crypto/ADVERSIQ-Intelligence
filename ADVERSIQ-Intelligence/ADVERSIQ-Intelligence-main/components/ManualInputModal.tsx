import React, { useState, useEffect } from 'react';
import useEscapeKey from '../hooks/useEscapeKey';
import { X, Save } from 'lucide-react';

interface ManualInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (value: string) => void;
    title: string;
    label: string;
    initialValue?: string;
}

export const ManualInputModal: React.FC<ManualInputModalProps> = ({
    isOpen, onClose, onSave, title, label, initialValue = ''
}) => {
    useEscapeKey(onClose);
    const [value, setValue] = useState(() => isOpen ? initialValue : '');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <h3 className="font-bold text-stone-900">{title}</h3>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-800 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6">
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">{label}</label>
                    <input 
                        className="w-full p-3 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-stone-900 focus:outline-none transition-shadow"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Enter custom value..."
                        autoFocus
                    />
                </div>

                <div className="p-5 border-t border-stone-100 flex justify-end gap-3 bg-stone-50">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => { onSave(value); onClose(); }}
                        disabled={!value.trim()}
                        className="px-6 py-2 bg-stone-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={16} /> Save Input
                    </button>
                </div>
            </div>
        </div>
    );
};
