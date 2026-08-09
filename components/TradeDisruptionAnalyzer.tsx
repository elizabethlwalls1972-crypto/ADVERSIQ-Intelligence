import React from 'react';
import { Activity } from 'lucide-react';

export const TradeDisruptionWidget = ({ mode }: { mode: string }) => (
    <div className="p-8 bg-stone-50 rounded-xl border border-stone-200 text-center">
        <Activity className="w-12 h-12 text-stone-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-stone-700">Trade Simulation</h3>
        <p className="text-sm text-stone-500">Simulating supply chain shocks...</p>
    </div>
);

