import React from 'react';
import { ShieldCheck } from 'lucide-react';

const RegionalComfortIndex = ({ region, country }: { region: string, country: string }) => (
    <div className="p-8 bg-stone-50 rounded-xl border border-stone-200 text-center">
        <ShieldCheck className="w-12 h-12 text-stone-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-stone-700">Regional Comfort Index</h3>
        <p className="text-sm text-stone-500">Analyzing psychological and operational safety for {country}...</p>
    </div>
);

export default RegionalComfortIndex;

