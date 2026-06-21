
import React from 'react';
import { Check, ChevronRight, Lock } from 'lucide-react';
import { PricingPlan } from '../types';

interface PricingProps {
  onOpenSystem: () => void;
}

const plans: PricingPlan[] = [
  {
    id: 'pilot',
    name: '7-Day Pilot',
    price: '$35',
    duration: 'One-Time Pass',
    description: 'Perfect for executing a single high-stakes mission or trial run.',
    features: [
      'Core Trinity Engines (IVAS(TM), SPI(TM), SCF(TM))',
      '18+ Specialized Engines (RROI, SEAM, risk & ops layers)',
      'Unlimited Report & Dossier Generation',
      'Partner Discovery & SPI-Driven Matchmaking',
      'Document Suite (LoI, MoU, Proposal)',
      'Live Data Spine (World Bank, sanctions, exchange rates)',
      'NSIL / API Export for downstream workflows'
    ]
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: '$245',
    duration: 'For 3 Months',
    description: 'Designed for strategic planning cycles and market analysis.',
    features: [
      'Core Trinity Engines (IVAS(TM), SPI(TM), SCF(TM))',
      '18+ Specialized Engines (RROI, SEAM, risk & ops layers)',
      'Unlimited Report & Dossier Generation',
      'Partner Discovery & SPI-Driven Matchmaking',
      'Document Suite (LoI, MoU, Proposal)',
      'Live Data Spine (World Bank, sanctions, exchange rates)',
      'NSIL / API Export for downstream workflows'
    ]
  },
  {
    id: 'semiannual',
    name: 'Semi-Annual',
    price: '$496',
    duration: 'For 6 Months',
    description: 'Sustained intelligence for regional expansion execution.',
    features: [
      'Core Trinity Engines (IVAS(TM), SPI(TM), SCF(TM))',
      '18+ Specialized Engines (RROI, SEAM, risk & ops layers)',
      'Unlimited Report & Dossier Generation',
      'Partner Discovery & SPI-Driven Matchmaking',
      'Document Suite (LoI, MoU, Proposal)',
      'Live Data Spine (World Bank, sanctions, exchange rates)',
      'NSIL / API Export for downstream workflows'
    ],
    recommended: true
  },
  {
    id: 'annual',
    name: 'Annual',
    price: '$785',
    duration: 'For 12 Months',
    description: 'Maximum value. Continuous global monitoring & strategy.',
    features: [
      'Core Trinity Engines (IVAS(TM), SPI(TM), SCF(TM))',
      '18+ Specialized Engines (RROI, SEAM, risk & ops layers)',
      'Unlimited Report & Dossier Generation',
      'Partner Discovery & SPI-Driven Matchmaking',
      'Document Suite (LoI, MoU, Proposal)',
      'Live Data Spine (World Bank, sanctions, exchange rates)',
      'NSIL / API Export for downstream workflows'
    ]
  }
];

export const Pricing: React.FC<PricingProps> = ({ onOpenSystem }) => {
  return (
    <section id="pricing" className="py-24 bg-bw-navy text-white border-t border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#b49b67 1px, transparent 1px)', backgroundSize: '34px 34px' }} />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-start mb-14">
          <div className="lg:col-span-5">
            <h2 className="text-bw-gold font-bold uppercase tracking-widest text-xs mb-3">Access Grid</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold leading-tight">System Access Plans</h3>
          </div>
          <div className="lg:col-span-7">
            <p className="text-white/80 text-lg leading-relaxed max-w-3xl">
              The full Regional Intelligence Core is available on every tier. Choose the tempo that matches how often you need to interrogate the system - from a single mission to continuous regional execution.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`flex flex-col p-6 rounded-2xl border ${plan.recommended ? 'border-bw-gold bg-white/10 shadow-2xl' : 'border-white/10 bg-white/5'} backdrop-blur-md transition-all duration-300 hover:bg-white/10`}
            >
              {plan.recommended && (
                <div className="self-start bg-bw-gold text-bw-navy text-xs font-bold uppercase py-1 px-3 rounded-full mb-4">
                  Recommended
                </div>
              )}
              <h4 className="text-lg font-bold">{plan.name}</h4>
              <div className="mt-4 mb-2">
                <span className="text-4xl font-serif font-bold">{plan.price}</span>
              </div>
              <p className="text-xs text-white/60 uppercase font-bold tracking-wide mb-6">{plan.duration}</p>
              
              <p className="text-sm text-white/75 mb-5 leading-relaxed">{plan.description}</p>
              
              <div className="flex-grow space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start">
                    <Check className="h-4 w-4 text-bw-gold mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-white/85 leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
              {/* Individual buttons removed as requested */}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center">
            <p className="text-sm text-white/60 mb-6 italic">Secure connection required. Please verify identity upon entry.</p>
            <button
                onClick={onOpenSystem}
                className="group relative inline-flex items-center justify-center px-12 py-5 overflow-hidden font-bold text-bw-navy transition-all duration-300 bg-bw-gold rounded-xl hover:bg-white hover:text-bw-navy shadow-2xl focus:outline-none transform hover:-translate-y-1"
            >
                <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                <span className="relative text-xl uppercase tracking-wider flex items-center gap-3">
                    <Lock className="w-5 h-5" /> Initialize System Access <ChevronRight className="h-6 w-6" />
                </span>
            </button>
        </div>

      </div>
    </section>
  );
};

