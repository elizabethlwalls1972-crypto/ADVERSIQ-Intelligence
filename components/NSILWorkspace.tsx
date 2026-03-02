import React from 'react';
import { type ReportParameters, type ReportData, type GenerationPhase, type CopilotInsight } from '../types';

interface NSILWorkspaceProps {
  reportData: ReportData;
  isGenerating: boolean;
  generationPhase: GenerationPhase;
  generationProgress: number;
  onGenerate: () => void;
  reports: ReportParameters[];
  onOpenReport: (report: ReportParameters) => void;
  onDeleteReport: (id: string) => void;
  onNewAnalysis: () => void;
  onCopilotMessage?: (msg: CopilotInsight) => void;
  params: ReportParameters;
  setParams: (params: ReportParameters) => void;
  onChangeViewMode?: (mode: string) => void;
  insights?: CopilotInsight[];
  autonomousMode?: boolean;
  autonomousSuggestions?: string[];
  isAutonomousThinking?: boolean;
  initialConsultantQuery?: string;
  onInitialConsultantQueryHandled?: () => void;
  initialContext?: { city: string; country: string; summary: string; profile: Record<string, unknown>; research: object | null } | null;
  onInitialContextHandled?: () => void;
}

const NSILWorkspace: React.FC<NSILWorkspaceProps> = () => {
  return <div className="w-full h-full bg-white" />;
};

export default NSILWorkspace;
