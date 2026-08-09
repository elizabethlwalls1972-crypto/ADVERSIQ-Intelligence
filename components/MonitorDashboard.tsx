import React from 'react';
import { ReportParameters } from '../types';
import { Activity, Zap, Server, Database } from 'lucide-react';

interface MonitorDashboardProps {
  reports: ReportParameters[];
}

export default function MonitorDashboard({ reports }: MonitorDashboardProps) {
  // Use the reports as "Active Nodes" in a background processing visualization
  return (
    <div className="flex-1 bg-black text-green-500 font-mono p-4 overflow-hidden flex flex-col h-full relative">
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ backgroundImage: 'linear-gradient(#0f0 1px, transparent 1px), linear-gradient(90deg, #0f0 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      <header className="flex justify-between items-center border-b border-green-900 pb-4 mb-4 relative z-10 bg-black">
        <div>
            <h2 className="text-xl font-bold flex items-center gap-3">
                <Activity className="animate-pulse" /> SYSTEM MONITOR // BACKGROUND PROCESS
            </h2>
            <p className="text-xs text-green-700 mt-1">
                Processing 10 Years of Historical Data (2015-2025)
            </p>
        </div>
        <div className="text-right">
            <div className="text-2xl font-bold">{reports.length}</div>
            <div className="text-xs text-green-700">ACTIVE NODES</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar pr-2">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {reports.map((report) => (
                <div key={report.id} className="border border-green-900/50 bg-green-900/5 p-2 text-xs flex justify-between items-center hover:bg-green-900/20 transition-colors">
                    <div className="flex flex-col">
                        <span className="font-bold opacity-70">[{report.id}]</span>
                        <span className="truncate w-32 md:w-48 text-green-400">{report.organizationName}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className={`${report.outcome === 'Success' ? 'text-green-400' : 'text-red-400'}`}>
                            {report.outcome?.toUpperCase() || 'PROCESSING'}
                        </span>
                        <span className="text-[10px] opacity-50">{report.country}</span>
                    </div>
                </div>
            ))}
         </div>
      </div>

      <footer className="mt-4 border-t border-green-900 pt-4 relative z-10 bg-black flex gap-8 text-xs">
          <div className="flex items-center gap-2">
              <Server size={14} /> 
              <span>SERVER LOAD: 42%</span>
          </div>
          <div className="flex items-center gap-2">
              <Database size={14} /> 
              <span>HISTORICAL DB: CONNECTED</span>
          </div>
          <div className="flex items-center gap-2 ml-auto text-green-300">
              <Zap size={14} className="fill-green-300" /> 
              <span>IVAS ENGINE: ACTIVE</span>
          </div>
      </footer>
    </div>
  );
}
