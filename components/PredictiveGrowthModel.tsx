import React, { useState, useEffect } from 'react';
// Gemini/Google AI logic removed
import { TrendingUp, BrainCircuit, Loader2 } from 'lucide-react';

// Gemini/Google AI logic removed

const generateThinkingContent = async (prompt: string) => {
    try {
        const response = await ai.models.generateContent({
            // Gemini model removed
            contents: prompt,
        });
        return response.text;
    } catch (e) {
        console.error(e);
        return "Simulation unavailable. Please check your API configuration.";
    }
}

interface PredictiveGrowthModelProps {
    location: any;
    timeHorizon: number;
    onModelComplete: () => void;
}

const PredictiveGrowthModel: React.FC<PredictiveGrowthModelProps> = ({ location, timeHorizon, onModelComplete }) => {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [thinking, setThinking] = useState(false);
    const [thinkingStep, setThinkingStep] = useState<string>('');

    useEffect(() => {
        let isMounted = true;

        const runSimulation = async () => {
            if (location && location.city && location.country && !analysis && !thinking) {
                if(isMounted) setThinking(true);
                
                // Simulation steps for UI
                const steps = ["Analyzing historical GDP trends...", "Projecting infrastructure impact...", "Simulating geopolitical variables...", "Synthesizing growth scenarios..."];
                let stepIdx = 0;
                
                const stepInterval = setInterval(() => {
                    if(stepIdx < steps.length) {
                        if(isMounted) setThinkingStep(steps[stepIdx]);
                        stepIdx++;
                    }
                }, 1000);

                const prompt = `
                    Act as a senior economist using the 'Predictive Growth Model' engine. 
                    Target: ${location.city}, ${location.country}.
                    Horizon: ${timeHorizon} Years.
                    
                    Generate a detailed economic forecast including:
                    1. **GDP Trajectory**: Best/Base/Worst case scenarios.
                    2. **Key Growth Drivers**: Specific sectors or infrastructure projects.
                    3. **Risk Factors**: Inflation, political stability, climate impact.
                    4. **Strategic Implication**: What this means for an investor entering now.
                    
                    Format as a clean, structured strategic brief using Markdown. Use bolding for key metrics.
                `;
                
                const result = await generateThinkingContent(prompt);
                
                clearInterval(stepInterval);
                if(isMounted) {
                    setAnalysis(result || "Analysis failed.");
                    setThinking(false);
                    onModelComplete();
                }
            }
        };

        runSimulation();

        return () => { isMounted = false; };
    }, [location, timeHorizon, analysis, thinking, onModelComplete]);

    if (!location || !location.city || !location.country) {
        return (
            <div className="p-12 bg-gray-50 border border-gray-200 rounded-xl text-center shadow-sm">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-gray-800 mb-2">Predictive Model Standby</h4>
                <p className="text-gray-500 text-sm">Model will generate once a specific target jurisdiction is defined.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <h4 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Predictive Growth Model
                </h4>
                {thinking && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                        <BrainCircuit className="w-3 h-3 animate-pulse" />
                        // Gemini reference removed
                    </div>
                )}
            </div>
            
            <div className="p-6 flex-grow overflow-y-auto">
                {thinking ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-6 py-12">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <h5 className="text-stone-800 font-bold text-lg">Running Simulation</h5>
                            <p className="text-stone-500 text-sm font-mono">{thinkingStep}</p>
                        </div>
                    </div>
                ) : (
                    <div className="prose prose-sm max-w-none text-stone-700 leading-relaxed">
                        <div className="whitespace-pre-wrap">{analysis || "Analysis could not be generated."}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PredictiveGrowthModel;
