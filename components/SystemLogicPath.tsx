import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';

const LOG_STEPS = [
    { time: '[00:01]', label: 'DETECTED INTENT:', value: 'Logistics Risk / Supply Chain', color: 'text-emerald-400' },
    { time: '[00:01]', label: 'CONTEXT:', value: 'Vietnam Region', color: 'text-blue-400' },
    { time: '[00:02]', label: 'ACTIVATING:', value: 'Trade Disruption Simulator', color: 'text-purple-400' },
    { time: '[00:02]', label: 'LOADING:', value: 'Historical Port Congestion Index', color: 'text-yellow-400' },
    { time: '[00:03]', label: 'RETRIEVING:', value: 'Vietnam Port Throughput Data (2024)', color: 'text-cyan-400' },
    { time: '[00:03]', label: 'ANALYZING:', value: 'Wait times > 48hrs...', color: 'text-red-400' },
    { time: '[00:04]', label: 'GENERATING:', value: 'Mitigation Strategy Beta...', color: 'text-orange-400' },
    { time: '[00:05]', label: '>>', value: 'STRATEGY READY FOR REVIEW', color: 'text-green-500 font-bold' }
];

const SystemLogicPath: React.FC = () => {
    const [visibleLines, setVisibleLines] = useState<number>(0);

    useEffect(() => {
        const totalSteps = LOG_STEPS.length;
        
        // If we haven't shown all lines yet
        if (visibleLines < totalSteps) {
            const timeout = setTimeout(() => {
                setVisibleLines(prev => prev + 1);
            }, 800); // 800ms per line
            return () => clearTimeout(timeout);
        } 
        // If all lines are shown, wait then reset to loop
        else {
            const resetTimeout = setTimeout(() => {
                setVisibleLines(0);
            }, 3000); // Wait 3 seconds at the end before looping
            return () => clearTimeout(resetTimeout);
        }
    }, [visibleLines]);

    return (
        <div className="w-full bg-slate-950 py-12 border-y border-slate-800">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center gap-2 mb-6 text-slate-400 border-b border-slate-800 pb-2">
                    <Terminal className="w-5 h-5" />
                    <span className="font-mono font-bold text-sm tracking-wider uppercase">System Logic Path</span>
                </div>
                
                <div className="font-mono text-sm md:text-base space-y-3 min-h-[320px]">
                    {LOG_STEPS.slice(0, visibleLines).map((step, index) => (
                        <div key={index} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
                            <span className="text-slate-600 shrink-0">{step.time}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-300 font-semibold">{step.label}</span>
                                <span className={step.color}>{step.value}</span>
                            </div>
                        </div>
                    ))}
                    
                    {visibleLines < LOG_STEPS.length && (
                        <div className="flex items-center gap-2 text-slate-500 animate-pulse mt-4">
                            <span className="w-2 h-4 bg-blue-500 block"></span>
                            <span>Processing...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SystemLogicPath;
