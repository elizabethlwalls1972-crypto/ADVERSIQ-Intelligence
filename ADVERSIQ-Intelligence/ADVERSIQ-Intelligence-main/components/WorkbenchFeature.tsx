
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, MessageSquare, ArrowRight, Activity } from 'lucide-react';

const USE_CASES = [
    {
        title: "The 2 AM Epiphany",
        quote: "Woke up with a concern about currency risk? Don't wait for Monday.",
        action: "Type it into the Workbench. Get a risk mitigation strategy before breakfast.",
        gradient: "from-bw-gold/15 to-transparent",
        border: "group-hover:border-bw-gold/40"
    },
    {
        title: "The Silent Board Member",
        quote: "In a negotiation? Feed the counter-party's terms into the Notepad.",
        action: "The system runs a 'Deal Killer' analysis in real-time, flagging critical risks while you negotiate.",
        gradient: "from-bw-gold/15 to-transparent",
        border: "group-hover:border-bw-gold/40"
    },
    {
        title: "The Devil's Advocate",
        quote: "Think your strategy is perfect? Ask the Workbench to 'Attack this Plan.'",
        action: "It will simulate adversarial scenarios to find your blind spots.",
        gradient: "from-bw-gold/15 to-transparent",
        border: "group-hover:border-bw-gold/40"
    }
];

const SYSTEM_LOGS = [
    { time: '00:01', label: 'DETECTED INTENT:', value: 'Logistics Risk / Supply Chain', color: 'text-bw-gold' },
    { time: '00:01', label: 'CONTEXT:', value: 'Philippine Region', color: 'text-white/60' },
    { time: '00:02', label: 'ACTIVATING:', value: 'Trade Disruption Simulator', color: 'text-bw-gold' },
    { time: '00:02', label: 'LOADING:', value: 'Historical Port Congestion Index', color: 'text-white/60' },
    { time: '00:03', label: 'RETRIEVING:', value: 'Vietnam Port Throughput Data (2024)', color: 'text-bw-gold' },
    { time: '00:03', label: 'ANALYZING:', value: 'Wait times > 48hrs...', color: 'text-white/60' },
    { time: '00:04', label: 'GENERATING:', value: 'Mitigation Strategy Beta...', color: 'text-bw-gold' }
];

export const WorkbenchFeature: React.FC = () => {
    const [typedText, setTypedText] = useState('');
    const fullText = "I'm worried about port congestion affecting my supply chain in Vietnam...";
    
    // Live Terminal State
    const [terminalLines, setTerminalLines] = useState<typeof SYSTEM_LOGS>([]);
    const [currentLogIndex, setCurrentLogIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Typing Effect for Notepad (Left Side)
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setTypedText(fullText.substring(0, index));
            index++;
            if (index > fullText.length) {
                clearInterval(interval);
            }
        }, 40); // Slightly faster typing for notepad
        return () => clearInterval(interval);
    }, []);

    // Live Terminal Effect (Right Side - Typewriter style)
    useEffect(() => {
        if (currentLogIndex >= SYSTEM_LOGS.length) return;

        const targetLog = SYSTEM_LOGS[currentLogIndex];
        
        // Typing speed: faster for values to look like data streaming
        const typingSpeed = 25; 
        
        const timeout = setTimeout(() => {
            // Ensure the line exists in state
            setTerminalLines(prev => {
                const newLines = [...prev];
                if (!newLines[currentLogIndex]) {
                    // Initialize new line with empty value
                    newLines[currentLogIndex] = { ...targetLog, value: '' };
                } else {
                    // Update existing line
                    const nextChar = targetLog.value.charAt(charIndex);
                    newLines[currentLogIndex] = {
                        ...targetLog,
                        value: newLines[currentLogIndex].value + nextChar
                    };
                }
                return newLines;
            });

            // Increment character or move to next line
            if (charIndex < targetLog.value.length) {
                setCharIndex(prev => prev + 1);
            } else {
                // Line finished, pause briefly then next line
                setTimeout(() => {
                    setCurrentLogIndex(prev => prev + 1);
                    setCharIndex(0);
                }, 300); // 300ms pause between lines
            }

            // Auto-scroll
            if (logContainerRef.current) {
                logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
            }

        }, typingSpeed);

        return () => clearTimeout(timeout);
    }, [currentLogIndex, charIndex]);

    return (
             <section className="py-24 bg-bw-navy text-white relative overflow-hidden border-t border-white/10">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#b49b67 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                
                {/* Header */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-start mb-16">
                    <div className="lg:col-span-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest text-bw-gold">
                            <Activity className="w-4 h-4" /> Always-On
                        </div>
                        <h2 className="mt-6 text-4xl md:text-5xl font-serif font-bold leading-tight">
                            The Workbench
                            <span className="block mt-2 text-white/70">Your strategic front panel.</span>
                        </h2>
                    </div>
                    <div className="lg:col-span-7">
                        <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
                            The Workbench is the front panel for the Regional Intelligence Core. You type what you are trying to do in plain language, and the system turns it into a logic path - activating NSIL, adversarial cross-checks, multi-persona reasoning, and counterfactual simulation - so a vague concern becomes a tested strategy you can defend.
                        </p>
                    </div>
                </div>

                {/* Live workbench preview */}
                <div className="grid lg:grid-cols-2 gap-0 border border-white/10 rounded-2xl overflow-hidden shadow-2xl mb-24 bg-black/40 backdrop-blur-sm h-[460px]">
                    
                    {/* Left: User Input */}
                    <div className="p-8 border-b lg:border-b-0 lg:border-r border-white/10 bg-white/5 flex flex-col">
                        <div className="flex items-center gap-2 mb-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
                            <MessageSquare className="w-4 h-4" /> Your Strategic Notepad
                        </div>
                        <div className="font-serif text-2xl text-white/90 leading-relaxed flex-grow">
                            "{typedText}<span className="animate-pulse text-bw-gold">|</span>"
                        </div>
                        <div className="text-xs text-slate-500 mt-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-bw-gold rounded-full animate-pulse"></span>
                            Status: Listening...
                        </div>
                    </div>

                    {/* Right: System Reaction (Live Terminal) */}
                    <div className="p-8 bg-black/80 font-mono text-xs relative flex flex-col">
                        <div className="flex items-center gap-2 mb-6 text-bw-gold font-bold uppercase tracking-widest border-b border-white/10 pb-4">
                            <Terminal className="w-4 h-4" /> System Logic Path
                        </div>
                        
                        <div ref={logContainerRef} className="space-y-4 overflow-y-auto custom-scrollbar flex-grow pr-2">
                            {terminalLines.map((log, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <span className="text-slate-600 shrink-0">[{log.time}]</span>
                                    <span className={`${log.color} font-bold shrink-0`}>{log.label}</span>
                                    <span className="text-white/90">
                                        {log.value}
                                        {i === currentLogIndex && <span className="animate-pulse inline-block w-2 h-4 bg-bw-gold/60 ml-1 align-middle"></span>}
                                    </span>
                                </div>
                            ))}
                            
                            {currentLogIndex >= SYSTEM_LOGS.length && (
                                <div className="mt-6 p-3 border border-bw-gold/30 bg-bw-gold/10 text-bw-gold text-center rounded animate-in fade-in zoom-in duration-300">
                                    {'>> STRATEGY READY FOR REVIEW'}
                                </div>
                            )}
                        </div>
                        
                        {/* Floating Badge */}
                        <div className="absolute bottom-6 right-6 px-3 py-1 bg-bw-gold/10 border border-bw-gold/30 rounded-full text-bw-gold text-[10px] font-bold uppercase">
                            Auto-Provisioning Active
                        </div>
                    </div>
                </div>

                {/* The Use Cases - Redesigned (No Icons) */}
                <div className="grid md:grid-cols-3 gap-6">
                    {USE_CASES.map((useCase, idx) => (
                        <div key={idx} className={`relative p-8 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${useCase.border}`}>
                            
                            {/* Subtle colored gradient overlay on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                            
                            <div className="relative z-10 flex flex-col h-full">
                                <h3 className="text-xl font-serif font-bold mb-4 text-white group-hover:text-bw-gold transition-colors">{useCase.title}</h3>
                                <p className="text-slate-300 text-sm mb-6 italic leading-relaxed flex-grow">"{useCase.quote}"</p>
                                
                                <div className="pt-6 border-t border-white/5 mt-auto">
                                    <p className="text-slate-400 text-xs font-medium leading-relaxed flex gap-3">
                                        <ArrowRight className="w-4 h-4 shrink-0 text-bw-gold mt-0.5" />
                                        {useCase.action}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* The "Clarifier" Disclaimer */}
                <div className="mt-24 relative p-10 bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-bw-navy"></div>
                    <div className="relative z-10 text-center">
                        <h4 className="text-slate-900 font-serif font-bold text-3xl mb-4">The Great Clarifier.</h4>
                        <p className="text-slate-600 max-w-3xl mx-auto leading-relaxed text-lg">
                            This system is not designed to replace human expertise. Whether you are an <strong>expert</strong> running daily due diligence or a <strong>novice</strong> unsure where to start, the Workbench organises regional chaos into a structure you can act on - using the same NSIL math and engines that power SPI, IVAS, SCF, RROI, SEAM, and the rest of the stack.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
};

