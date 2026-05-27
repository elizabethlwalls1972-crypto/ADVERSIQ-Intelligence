import React from 'react';
import { SPIResult } from '../types';
import { TrendingUp } from 'lucide-react';

interface SuccessScoreCardProps {
    spiResult: SPIResult;
}

const SuccessScoreCard: React.FC<SuccessScoreCardProps> = ({ spiResult }) => {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> SPI(TM) Score
                </h3>
                <span className="text-4xl font-black">{spiResult.spi}%</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {spiResult.breakdown.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="bg-white/10 rounded p-2 backdrop-blur-sm">
                        <div className="text-[10px] uppercase opacity-70 mb-1">{item.label}</div>
                        <div className="font-bold text-lg">{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuccessScoreCard;
