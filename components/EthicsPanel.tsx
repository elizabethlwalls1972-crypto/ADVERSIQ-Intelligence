import React from "react";
import { ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';

export default function EthicsPanel({ ethics }: any) {
  if (!ethics) return <div className="text-sm text-stone-500 italic">No ethics data generated yet.</div>;
  
  const flagColor = ethics.overallFlag === "BLOCK" ? "red" : ethics.overallFlag === "CAUTION" ? "orange" : "emerald";
  const borderColor = ethics.overallFlag === "BLOCK" ? "border-red-200 bg-red-50" : ethics.overallFlag === "CAUTION" ? "border-orange-200 bg-orange-50" : "border-emerald-200 bg-emerald-50";
  const textColor = ethics.overallFlag === "BLOCK" ? "text-red-800" : ethics.overallFlag === "CAUTION" ? "text-orange-800" : "text-emerald-800";

  return (
    <div className={`rounded-lg border ${borderColor} p-5 mt-6`}>
      <div className="flex justify-between items-start mb-4">
        <div>
            <h3 className={`text-lg font-bold ${textColor} flex items-center gap-2`}>
                {ethics.overallFlag === "BLOCK" && <AlertTriangle className="w-5 h-5" />}
                {ethics.overallFlag === "CAUTION" && <AlertTriangle className="w-5 h-5" />}
                {ethics.overallFlag === "OK" && <CheckCircle className="w-5 h-5" />}
                Ethics Engine: {ethics.overallFlag}
            </h3>
            <p className="text-sm text-stone-600">Overall Safeguard Score: <span className="font-bold">{ethics.overallScore}/100</span></p>
        </div>
        <div className="text-xs text-stone-400 font-mono">{ethics.version}</div>
      </div>

      <div className="space-y-4">
        {ethics.flags.length > 0 && (
            <div className="bg-white rounded border border-stone-200 p-3">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Detected Flags</h4>
                <ul className="space-y-2">
                    {ethics.flags.map((f: any, i: number) => (
                    <li key={i} className="text-sm">
                        <div className="flex justify-between">
                            <span className="font-bold text-stone-800">{f.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${f.flag === 'BLOCK' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{f.flag}</span>
                        </div>
                        <div className="text-stone-600 italic">{f.reason}</div>
                        {f.evidence && f.evidence.length > 0 && (
                            <ul className="ml-2 mt-1 border-l-2 border-stone-200 pl-2 text-xs text-stone-500">
                                {f.evidence.map((e: string, idx: number) => <li key={idx}>{e}</li>)}
                            </ul>
                        )}
                    </li>
                    ))}
                </ul>
            </div>
        )}

        <div>
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Mitigation & Next Steps</h4>
            <div className="space-y-2">
                {ethics.mitigation.map((m: any, i: number) => (
                    <div key={i} className="flex gap-3 items-start">
                        <div className="bg-stone-200 text-stone-700 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</div>
                        <div>
                            <span className="block font-bold text-stone-900 text-sm">{m.step}</span>
                            <span className="text-sm text-stone-600">{m.detail}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-stone-200/50 text-[10px] text-stone-400 text-right">
        Verified: {new Date(ethics.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
