import React from 'react';
import type { GenerativeModel } from '../types';

export const GenerativeModelResultDisplay: React.FC<{ model: GenerativeModel }> = ({ model }) => (
    <div className="space-y-3">
        <h4 className="font-bold text-md text-orange-800">{model.modelName}</h4>
        <p className="text-sm italic text-stone-600">{model.description || model.summary}</p>
        {model.corePrinciples.map(p => (
            <div key={p.principle} className="p-2 border-l-2 border-stone-200">
                <p className="font-semibold text-sm text-stone-900">{p.principle}: <span className="font-normal text-xs text-stone-500">{p.rationale}</span></p>
            </div>
        ))}
    </div>
);
