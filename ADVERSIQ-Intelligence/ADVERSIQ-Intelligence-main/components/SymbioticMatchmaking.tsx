import React from 'react';
import { Users } from 'lucide-react';

export const SymbioticMatchmaking = ({ onPartnerSelect }: { onPartnerSelect: (p: any) => void }) => (
    <div className="p-8 bg-stone-50 rounded-xl border border-stone-200 text-center">
        <Users className="w-12 h-12 text-stone-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-stone-700">Symbiotic Discovery</h3>
        <p className="text-sm text-stone-500">Identifying mutual benefit partners...</p>
    </div>
);

