import React, { useState, useEffect, useRef } from 'react';
import { 
  agentSpawner, 
  SubAgent, 
  AgentTask 
} from '../services/AgentSpawner';
import { EventBus } from '../services/EventBus';
import { 
  Shield, 
  Play, 
  Trash2, 
  Cpu, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Layers, 
  PlusCircle, 
  Activity, 
  Server, 
  Clock, 
  CheckCircle2, 
  Terminal, 
  Sliders, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const AgentSpawnerPanel: React.FC = () => {
  // --- STATE ---
  const [agents, setAgents] = useState<SubAgent[]>([]);
  const [taskQueue, setTaskQueue] = useState<AgentTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<AgentTask[]>([]);
  
  // Spawner Form State
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentPurpose, setNewAgentPurpose] = useState('');
  const [newAgentAutonomy, setNewAgentAutonomy] = useState<SubAgent['autonomyLevel']>('supervised');
  const [selectedCaps, setSelectedCaps] = useState<string[]>(['data_analysis']);
  
  // Task Form State
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<AgentTask['priority']>('medium');
  const [isExecutingTask, setIsExecutingTask] = useState(false);
  const [activeTaskLog, setActiveTaskLog] = useState<string[]>([]);
  
  const logEndRef = useRef<HTMLDivElement>(null);

  // Available agent capabilities in the system
  const AVAILABLE_CAPABILITIES = [
    { key: 'data_analysis', label: '📊 Data Analysis' },
    { key: 'report_generation', label: '📝 Report Generation' },
    { key: 'monitoring', label: '📈 System Monitoring' },
    { key: 'research', label: '🔍 Deep Research' },
    { key: 'document_drafting', label: '✉️ Document Drafting' }
  ];

  // Refresh lists from singleton
  const refreshAgentSpawnerState = () => {
    setAgents(agentSpawner.getAllAgents());
    
    // Read all tasks from the spawner
    const pending = agentSpawner.getPendingTasks();
    setTaskQueue(pending);
  };

  // Bootstrap & Event Bus listeners
  useEffect(() => {
    refreshAgentSpawnerState();

    // Subscribe to EventBus events for agent activities
    const unsubAgentSpawned = EventBus.subscribe('agentSpawned', () => {
      refreshAgentSpawnerState();
      addLogEntry('System Alert: New sub-agent successfully compiled and spawned.');
    });

    const unsubAgentTerminated = EventBus.subscribe('agentTerminated', (event) => {
      refreshAgentSpawnerState();
      addLogEntry(`Governance Directive: Agent ${event.agent.name} was terminated. Reason: ${event.reason}`);
    });

    const unsubTaskAssigned = EventBus.subscribe('taskAssigned', (event) => {
      refreshAgentSpawnerState();
      addLogEntry(`Task Dispatched: "${event.task.description}" assigned to ${event.agent.name}`);
    });

    return () => {
      unsubAgentSpawned();
      unsubAgentTerminated();
      unsubTaskAssigned();
    };
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTaskLog]);

  // Local logger helper
  const addLogEntry = (msg: string) => {
    setActiveTaskLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Spawning risk assessment logic based on AgentSpawner.ts parameters
  const calculatedRisk = () => {
    let risk = 0;
    const reasons: string[] = [];

    const activeCount = agents.filter(a => a.status === 'active').length;
    if (activeCount >= 8) {
      risk += 30;
      reasons.push('⚠️ Multi-brain load: high concurrent agent density');
    } else if (activeCount >= 4) {
      risk += 15;
      reasons.push('⚠️ Moderate allocation: standard memory consumption');
    }

    // Capability duplication risk
    const duplicates = agents.filter(a => 
      a.status === 'active' && 
      a.capabilities.some(cap => selectedCaps.includes(cap))
    );
    if (duplicates.length > 0) {
      risk += 20;
      reasons.push(`⚠️ Redundancy: ${duplicates.length} active agent(s) share selected capabilities`);
    }

    // Autonomy level risk
    if (newAgentAutonomy === 'fully-autonomous') {
      risk += 40;
      reasons.push('🔴 Security Warning: Fully autonomous agent bypasses standard gatekeepers');
    } else if (newAgentAutonomy === 'semi-autonomous') {
      risk += 20;
      reasons.push('⚠️ Semi-autonomous mode: occasional manual confirmations required');
    }

    return {
      score: Math.min(risk, 100) || 5,
      reasons: reasons.length > 0 ? reasons : ['🟢 Safe threshold: optimal resource boundaries']
    };
  };

  const risk = calculatedRisk();

  // Spawning handler
  const handleSpawn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim() || !newAgentPurpose.trim()) {
      addLogEntry('Spawning Error: Agent must have a valid Name and Purpose.');
      return;
    }

    addLogEntry(`Spawning request received: Compiling structural weights for "${newAgentName}"...`);
    
    const agent = await agentSpawner.spawnAgent({
      name: newAgentName,
      purpose: newAgentPurpose,
      capabilities: selectedCaps,
      autonomyLevel: newAgentAutonomy
    });

    if (agent) {
      setNewAgentName('');
      setNewAgentPurpose('');
      setSelectedCaps(['data_analysis']);
      setNewAgentAutonomy('supervised');
      setSelectedAgentId(agent.id);
    } else {
      addLogEntry('Spawning Aborted: Governance safety gates rejected spawning (exceeded maximum limits or high security risk).');
    }
  };

  // Task execution handler
  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId) {
      addLogEntry('Execution Error: Please select an active sub-agent.');
      return;
    }
    if (!taskDescription.trim()) {
      addLogEntry('Execution Error: Task description cannot be empty.');
      return;
    }

    const agent = agents.find(a => a.id === selectedAgentId);
    if (!agent) return;

    addLogEntry(`Dispatching task payload to ${agent.name}...`);
    setIsExecutingTask(true);

    const success = await agentSpawner.assignTask(selectedAgentId, {
      description: taskDescription,
      priority: taskPriority
    });

    if (success) {
      setTaskDescription('');
      refreshAgentSpawnerState();
      
      addLogEntry(`Task locked on thread. Starting AI multi-brain pipeline for execution...`);
      
      setTimeout(async () => {
        try {
          await agentSpawner.executeTasks();
          refreshAgentSpawnerState();
          
          const allAgents = agentSpawner.getAllAgents();
          const targetAgent = allAgents.find(a => a.id === selectedAgentId);
          
          if (targetAgent) {
            addLogEntry(`SUCCESS: ${targetAgent.name} successfully completed task execution.`);
            setAgents(allAgents);
          }
        } catch (err) {
          addLogEntry(`CRITICAL FAILURE: Pipeline execution aborted. Details: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
          setIsExecutingTask(false);
        }
      }, 1500);
    } else {
      addLogEntry(`Failed to assign task. Please ensure ${agent.name} is online and active.`);
      setIsExecutingTask(false);
    }
  };

  // Terminate agent handler
  const handleTerminate = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to terminate sub-agent ${name}? This action will cancel all active execution threads.`)) {
      addLogEntry(`Directive: Terminating sub-agent ${name}...`);
      await agentSpawner.terminateAgent(id, 'Decommissioned by economic overseer');
      if (selectedAgentId === id) setSelectedAgentId('');
    }
  };

  return (
    <div className="min-h-screen w-full bg-stone-100 text-slate-800 p-4 md:p-8 pb-32 overflow-y-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Visual Light Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 p-6 bg-white border border-stone-200 rounded-2xl shadow-sm gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-600">
              <Cpu size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-blue-600 tracking-[0.2em] uppercase">ADVERSIQ CORE LAYER</span>
                <span className="bg-blue-50 text-blue-700 text-[9px] px-2 py-0.5 rounded-full border border-blue-200 font-mono">AUTONOMY ENGINE v6.2</span>
              </div>
              <h1 className="text-xl md:text-2xl font-light tracking-wide text-slate-900">Sub-Agent Control Room</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium">System Load</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      agents.filter(a => a.status === 'active').length >= 8 ? 'bg-red-500' : 'bg-green-500'
                    }`} 
                    style={{ width: `${(agents.filter(a => a.status === 'active').length / 10) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-slate-800 font-bold">{agents.filter(a => a.status === 'active').length} / 10</span>
              </div>
            </div>
            
            <button 
              onClick={refreshAgentSpawnerState}
              className="p-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-slate-600 transition-colors"
              title="Refresh sub-agent status"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Dynamic Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Agent list and spawn form (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Spawn Form Card */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-3">
                <PlusCircle size={16} className="text-blue-600" /> Compile New Sub-Agent
              </h2>
              
              <form onSubmit={handleSpawn} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Agent Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. GeopoliticalResearchBot"
                      value={newAgentName}
                      onChange={(e) => setNewAgentName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 focus:border-blue-500 focus:bg-white outline-none p-3 rounded-lg text-sm text-slate-800 placeholder-slate-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Autonomy Level</label>
                    <select
                      value={newAgentAutonomy}
                      onChange={(e) => setNewAgentAutonomy(e.target.value as SubAgent['autonomyLevel'])}
                      className="w-full bg-stone-50 border border-stone-200 focus:border-blue-500 focus:bg-white outline-none p-3 rounded-lg text-sm text-slate-800 cursor-pointer"
                    >
                      <option value="supervised" className="bg-white">Supervised (Approve every action)</option>
                      <option value="semi-autonomous" className="bg-white">Semi-Autonomous (Occasional gates)</option>
                      <option value="fully-autonomous" className="bg-white">Fully-Autonomous (Unrestricted loops)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Mission Purpose</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Scrape and index conflict metrics across GDELT/ACLED for target region"
                    value={newAgentPurpose}
                    onChange={(e) => setNewAgentPurpose(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-blue-500 focus:bg-white outline-none p-3 rounded-lg text-sm text-slate-800 placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Capabilities Injected</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {AVAILABLE_CAPABILITIES.map(cap => {
                      const isSelected = selectedCaps.includes(cap.key);
                      return (
                        <button
                          key={cap.key}
                          type="button"
                          onClick={() => {
                            setSelectedCaps(prev => 
                              isSelected 
                                ? prev.filter(c => c !== cap.key) 
                                : [...prev, cap.key]
                            );
                          }}
                          className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' 
                              : 'bg-stone-50 border-stone-200 text-slate-600 hover:border-stone-300'
                          }`}
                        >
                          <span>{cap.label}</span>
                          {isSelected && <CheckCircle size={12} className="text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Risk Assessor Section */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mt-4 grid md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-4 text-center md:border-r md:border-stone-200 md:pr-4">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Autonomy Risk</span>
                    <div className="text-2xl font-bold font-mono mt-1">
                      <span className={
                        risk.score >= 60 ? 'text-red-600' : risk.score >= 30 ? 'text-amber-600' : 'text-green-600'
                      }>
                        {risk.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          risk.score >= 60 ? 'bg-red-500' : risk.score >= 30 ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${risk.score}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-8 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Assessments</span>
                    <div className="text-xs space-y-1.5 max-h-20 overflow-y-auto">
                      {risk.reasons.map((reason, idx) => (
                        <p key={idx} className="text-slate-700 font-mono leading-relaxed truncate">{reason}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={selectedCaps.length === 0}
                    className="flex items-center gap-2 px-5 py-3 bg-stone-900 hover:bg-black disabled:bg-stone-200 text-white disabled:text-slate-400 font-bold transition-colors rounded-lg text-sm shadow-sm"
                  >
                    <PlusCircle size={16} />
                    Compile &amp; Initialize Agent
                  </button>
                </div>
              </form>
            </div>

            {/* Sub-Agent Registry List */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-3">
                <Activity size={16} className="text-blue-600" /> Active Agent Registry
              </h2>

              {agents.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-stone-200 rounded-xl bg-stone-50">
                  <Cpu size={32} className="text-stone-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 font-medium">No active sub-agents currently registered.</p>
                  <p className="text-xs text-slate-400 mt-1">Use the compiler form above to spin up your first worker.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div 
                      key={agent.id}
                      className={`border p-4 rounded-xl transition-all relative ${
                        agent.status === 'terminated' 
                          ? 'border-stone-100 bg-stone-50/50 opacity-40' 
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50/20 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900 leading-none">{agent.name}</h3>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border ${
                              agent.status === 'active' 
                                ? 'bg-green-50 border-green-200 text-green-700' 
                                : 'bg-stone-100 border-stone-200 text-stone-500'
                            }`}>
                              {agent.status}
                            </span>
                            
                            <span className="text-[9px] font-mono bg-stone-100 border border-stone-200 text-slate-600 px-1.5 py-0.5 rounded">
                              {agent.autonomyLevel}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">{agent.purpose}</p>
                        </div>

                        {agent.status === 'active' && (
                          <button
                            onClick={() => handleTerminate(agent.id, agent.name)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded transition-colors"
                            title="Terminate Sub-Agent"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {/* Capabilities */}
                      <div className="flex flex-wrap gap-1.5 my-3">
                        {agent.capabilities.map(cap => (
                          <span 
                            key={cap} 
                            className="text-[9px] bg-white border border-stone-200 text-slate-600 px-2 py-0.5 rounded-md font-mono font-medium"
                          >
                            {AVAILABLE_CAPABILITIES.find(c => c.key === cap)?.label || cap}
                          </span>
                        ))}
                      </div>

                      {/* Performance Bar */}
                      <div className="grid grid-cols-3 gap-2 border-t border-stone-100 pt-3 text-[10px] text-slate-500 font-mono">
                        <div>
                          <span className="text-slate-400">Success Rate:</span>
                          <p className="text-slate-800 font-bold mt-0.5">
                            {Math.round(agent.performance.successRate * 100)}%
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">Tasks Executed:</span>
                          <p className="text-slate-800 font-bold mt-0.5">
                            {agent.performance.tasksCompleted}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">Uptime:</span>
                          <p className="text-slate-800 font-bold mt-0.5">
                            {Math.round((Date.now() - new Date(agent.createdAt).getTime()) / 60000)}m
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Task Operation & Execution Log (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Task Assigner */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-3">
                <Play size={16} className="text-blue-600" /> Dispatch Task Payload
              </h2>

              <form onSubmit={handleAssignTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Target Agent</label>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-blue-500 focus:bg-white outline-none p-3 rounded-lg text-sm text-slate-800 cursor-pointer font-medium"
                  >
                    <option value="" className="text-slate-400 bg-white">Select active agent...</option>
                    {agents.filter(a => a.status === 'active').map(agent => (
                      <option key={agent.id} value={agent.id} className="bg-white text-slate-800">
                        {agent.name} (Success: {Math.round(agent.performance.successRate * 100)}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Priority Thread</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['low', 'medium', 'high', 'critical'] as const).map(prio => (
                      <button
                        key={prio}
                        type="button"
                        onClick={() => setTaskPriority(prio)}
                        className={`p-2 border rounded-lg text-xs font-mono font-bold capitalize text-center transition-all ${
                          taskPriority === prio
                            ? prio === 'critical' ? 'bg-red-50 border-red-300 text-red-700'
                              : prio === 'high' ? 'bg-amber-50 border-amber-300 text-amber-700'
                              : prio === 'medium' ? 'bg-blue-50 border-blue-300 text-blue-700'
                              : 'bg-stone-100 border-stone-300 text-stone-700'
                            : 'bg-stone-50 border-stone-200 text-slate-400 hover:border-stone-300'
                        }`}
                      >
                        {prio}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Task Payload Description</label>
                  <textarea
                    placeholder="e.g. Compile a comprehensive structured dataset of local regulatory tax breaks and incentive structures in Victoria, Australia..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-blue-500 focus:bg-white outline-none p-3 rounded-lg text-sm text-slate-800 placeholder-slate-400 resize-none font-sans"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isExecutingTask || !selectedAgentId || !taskDescription.trim()}
                    className="flex items-center gap-2 px-5 py-3 bg-stone-900 hover:bg-black disabled:bg-stone-200 text-white disabled:text-slate-400 font-bold transition-colors w-full justify-center rounded-lg text-sm shadow-sm"
                  >
                    {isExecutingTask ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Executing Task Pipeline...
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        Launch Execution Thread
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Visual Task Log - styled with a refined corporate look */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Terminal size={16} className="text-blue-600" /> Operational Console
                </h2>
                
                <button 
                  onClick={() => setActiveTaskLog([])}
                  className="text-[10px] text-slate-400 hover:text-slate-600 font-mono underline"
                >
                  Clear Console
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-[11px] text-slate-300 space-y-2 h-72 overflow-y-auto shadow-inner">
                {activeTaskLog.length === 0 ? (
                  <div className="text-center py-20 text-slate-600 italic">
                    &gt; Standing by. No active operation logs.
                  </div>
                ) : (
                  activeTaskLog.map((log, index) => (
                    <div key={index} className="leading-relaxed whitespace-pre-wrap">
                      <span className="text-slate-500">&gt;</span> {log}
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
