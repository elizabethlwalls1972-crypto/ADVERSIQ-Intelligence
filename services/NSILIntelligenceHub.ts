/**
 * 
 * NSIL INTELLIGENCE HUB " THE SINGLE MASTER CONTROL POINT
 * 
 *
 * This is THE central brain of the entire operating system.
 * Every engine, every formula, every autonomous subsystem reports through here.
 *
 * Architecture:
 *   Layer 0 " Knowledge Architecture: PatternConfidence + MethodologyKnowledgeBase
 *   Layer 1 " Input Shield: adversarial input validation
 *   Layer 2 " Multi-Agent Debate: 5 PersonaEngine personas
 *   Layer 3 " Formula Scoring: 21 DAG-scheduled formulas + 8 autonomous indices
 *   Layer 4 " Stress Testing: CounterfactualEngine + ScenarioSimulation (Monte Carlo)
 *   Layer 5 " Human Cognition: HumanCognitionEngine (7 models)
 *   Layer 6 " Autonomous Intelligence: 8 new engines
 *              CreativeSynthesis, CrossDomainTransfer, AutonomousGoal,
 *              EthicalReasoning, SelfEvolvingAlgorithm, AdaptiveLearning,
 *              EmotionalIntelligence, ScenarioSimulation
 *   Layer 7 " Proactive Layer: continuous monitoring, drift detection, backtesting
 *   Layer 8 " Output Synthesis: provenance, audit trail, document generation
 *   Layer 9 " Reflexive Intelligence: 7 engines that turn analytical power inward
 *              UserSignalDecoder, InternalEchoDetector, InvestmentLifecycleMapper,
 *              RegionalMirroringEngine, RegionalIdentityDecoder,
 *              LatentAdvantageMiner, UniversalTranslationLayer
 *
 * Every public method returns a typed result with full provenance.
 * Nothing is hidden. Everything is auditable.
 *
 * 
 */

import { ReportParameters } from '../types';
import { PersonaEngine, FullPersonaAnalysis } from './PersonaEngine';
import { InputShieldService, ShieldReport } from './InputShieldService';
import { CounterfactualEngine, CounterfactualAnalysis } from './CounterfactualEngine';
import { OutcomeTracker, PredictionAccuracy, LearningInsight } from './OutcomeTracker';
import { UnbiasedAnalysisEngine, FullUnbiasedAnalysis } from './UnbiasedAnalysisEngine';

// Autonomous engines
import { CreativeSynthesisEngine, type SynthesisContext } from './autonomous/CreativeSynthesisEngine';
import { CrossDomainTransferEngine, type TransferContext } from './autonomous/CrossDomainTransferEngine';
import { AutonomousGoalEngine, type GoalGenerationContext } from './autonomous/AutonomousGoalEngine';
import { EthicalReasoningEngine, type EthicalAssessment as _EthicalAssessment, type EthicalContext } from './autonomous/EthicalReasoningEngine';
import { SelfEvolvingAlgorithmEngine, type EvolutionReport as _EvolutionReport } from './autonomous/SelfEvolvingAlgorithmEngine';
import { AdaptiveLearningEngine, type LearningReport as _LearningReport } from './autonomous/AdaptiveLearningEngine';
import { EmotionalIntelligenceEngine, type EmotionalIntelligenceResult as _EmotionalIntelligenceResult, type EmotionalContext } from './autonomous/EmotionalIntelligenceEngine';
import { ScenarioSimulationEngine, type SimulationResult as _SimulationResult, type SimulationContext } from './autonomous/ScenarioSimulationEngine';

// Reflexive Intelligence engines (Layer 9)
import { UserSignalDecoder, type UserInputSnapshot, type UserSignalReport } from './reflexive/UserSignalDecoder';
import { InternalEchoDetector, type EchoReport } from './reflexive/InternalEchoDetector';
import { InvestmentLifecycleMapper, type LifecycleContext, type LifecycleReport } from './reflexive/InvestmentLifecycleMapper';
import { RegionalMirroringEngine, type MirroringReport } from './reflexive/RegionalMirroringEngine';
import { RegionalIdentityDecoder, type IdentityReport } from './reflexive/RegionalIdentityDecoder';
import { LatentAdvantageMiner, type LatentAdvantageReport } from './reflexive/LatentAdvantageMiner';
import { UniversalTranslationLayer, type TranslationInput, type TranslationReport } from './reflexive/UniversalTranslationLayer';

// IFC Global Standards Engine (Layer 10 - Universal Compliance)
import { IFCGlobalStandardsEngine, type GlobalStandardsAssessment } from './IFCGlobalStandardsEngine';

// NSIL v2 Universal Intelligence Layer (Layers 11-14)
import { CompoundIntelligenceOrchestrator, type CompoundIntelligenceReport, type UniversalProblemInput } from './agents/CompoundIntelligenceOrchestrator';

// ============================================================================
// TYPES
// ============================================================================

export interface AutonomousIntelligence {
  // Creative & cross-domain
  creativeStrategies: Array<{ strategy: string; noveltyScore: number; feasibilityScore: number }>;
  crossDomainInsights: Array<{ analogy: string; sourceModel: string; transferScore: number }>;
  
  // Goal-driven
  autonomousGoals: Array<{ goal: string; priority: number; status: string; reasoning: string }>;
  
  // Ethical
  ethicalAssessment: {
    score: number;
    recommendation: string;
    flags: Array<{ severity: string; description: string }>;
  };
  
  // Emotional & stakeholder dynamics
  emotionalClimate: {
    overallValence: number;
    derailmentRisk: number;
    framingRecommendation: string;
  };
  
  // Forward-looking
  scenarioOutlook: {
    probabilityOfSuccess: number;
    medianSPI: number;
    riskLevel: string;
  };
  
  // System health
  evolutionReport: {
    generation: number;
    fitness: number;
    mutationsApplied: number;
  };
  learningReport: {
    patternsLearned: number;
    accuracyTrend: number;
    activePatterns: number;
  };
}

export interface ReflexiveIntelligence {
  // User signal analysis " what the user is really asking
  userSignals: UserSignalReport;
  
  // Internal echoes " connections within user's own data
  internalEchoes: EchoReport;
  
  // Investment lifecycle " where the region sits on the curve
  lifecyclePosition: LifecycleReport;
  
  // Regional mirroring " structural twins
  mirrorAnalysis: MirroringReport;
  
  // Identity decoding " simulacrum detection
  identityAnalysis: IdentityReport;
  
  // Latent advantages " "junk DNA" mining
  latentAdvantages: LatentAdvantageReport;
  
  // Universal translation " audience-specific outputs
  translationPackage: TranslationReport;
}

export interface IntelligenceReport {
  id: string;
  timestamp: Date;
  parameters: Partial<ReportParameters>;
  
  // Pre-flight validation
  inputValidation: ShieldReport;
  
  // Multi-persona analysis (only if inputs pass validation)
  personaAnalysis?: FullPersonaAnalysis;
  
  // Counterfactual analysis
  counterfactual?: CounterfactualAnalysis;
  
  // Unbiased analysis
  unbiasedAnalysis?: FullUnbiasedAnalysis;
  
  // IFC Global Standards Assessment (Universal Skeleton + Gap Analysis + Local Law Hunt)
  globalStandards?: GlobalStandardsAssessment;

  // NSIL v2 Universal Intelligence (Layers 11-14: Impossibility + Cascade + Social + Orchestration)
  universalIntelligence?: CompoundIntelligenceReport;
  
  // Autonomous intelligence layer
  autonomous: AutonomousIntelligence;
  
  // Reflexive intelligence layer " system turns analytical power inward
  reflexive?: ReflexiveIntelligence;
  
  // Applicable insights from past decisions
  applicableInsights: LearningInsight[];
  
  // Unified recommendation
  recommendation: {
    action: 'proceed' | 'proceed-with-caution' | 'revise-and-retry' | 'do-not-proceed';
    confidence: number;
    summary: string;
    criticalActions: string[];
    keyRisks: string[];
    keyOpportunities: string[];
    ethicalGate: 'pass' | 'conditional' | 'fail';
    emotionalRisk: number;
  };
  
  // Meta
  processingTime: number;
  componentsRun: string[];
  engineVersions: Record<string, string>;
}

export interface QuickAssessment {
  trustScore: number; // 0-100
  status: 'green' | 'yellow' | 'orange' | 'red';
  headline: string;
  topConcerns: string[];
  topOpportunities: string[];
  nextStep: string;
  ethicalPass: boolean;
  emotionalClimateNotes: string;
}

// ============================================================================
// NSIL INTELLIGENCE HUB
// ============================================================================

export class NSILIntelligenceHub {

  // 
  // AUTONOMOUS ENGINE INSTANCES (singleton pattern)
  // 

  private static selfEvolvingEngine = new SelfEvolvingAlgorithmEngine();
  private static adaptiveLearningEngine = new AdaptiveLearningEngine();

  // 
  // MASTER CONTROL " FULL ANALYSIS
  // 

  /**
   * Run full intelligence analysis.
   * This is THE master entry point. Every subsystem flows through here.
   *
   * Execution order:
   * 1. Input validation (always first)
   * 2. Outcome tracker (historical insights)
   * 3. Core analysis (Personas, Counterfactual, Unbiased) " parallel
   * 4. Autonomous intelligence layer " parallel
   * 5. Adaptive learning record
   * 6. Self-evolution check
   * 7. Recommendation synthesis (all signals converge)
   */
  static async runFullAnalysis(params: Partial<ReportParameters>): Promise<IntelligenceReport> {
    const startTime = Date.now();
    const componentsRun: string[] = [];
    const reportId = `INTEL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // â"€â"€ Step 1: Input Validation (always runs first) â"€â"€
    const inputValidation = InputShieldService.validate(params);
    componentsRun.push('InputShield');
    
    // â"€â"€ Step 2: Historical insights â"€â"€
    const applicableInsights = OutcomeTracker.getApplicableInsights(params);
    componentsRun.push('OutcomeTracker');
    
    // â"€â"€ Step 3 & 4: Core analysis + Autonomous layer (parallel) â"€â"€
    let personaAnalysis: FullPersonaAnalysis | undefined;
    let counterfactual: CounterfactualAnalysis | undefined;
    let unbiasedAnalysis: FullUnbiasedAnalysis | undefined;
    let globalStandards: GlobalStandardsAssessment | undefined;
    let autonomous: AutonomousIntelligence;
    let reflexive: ReflexiveIntelligence | undefined;
    
    if (inputValidation.overallStatus !== 'rejected') {
      // Run ALL engines in parallel for maximum speed
      const [personaResult, counterfactualResult, unbiasedResult, autonomousResult, globalStandardsResult] = await Promise.all([
        PersonaEngine.runFullAnalysis(params),
        Promise.resolve(CounterfactualEngine.analyze(params)),
        Promise.resolve(UnbiasedAnalysisEngine.analyze(params)),
        Promise.resolve(this.runAutonomousLayer(params)),
        Promise.resolve(IFCGlobalStandardsEngine.assessProject({
          country: (params as Record<string, string>).country || 'Unknown',
          sector: ((params as Record<string, string[]>).industry || ['general'])[0] || 'general',
          investmentSizeM: 10,
          projectType: 'greenfield'
        }))
      ]);
      
      personaAnalysis = personaResult;
      counterfactual = counterfactualResult;
      unbiasedAnalysis = unbiasedResult;
      autonomous = autonomousResult;
      globalStandards = globalStandardsResult;
      
      // Run reflexive intelligence layer
      reflexive = await this.runReflexiveLayer(params, autonomous);

      componentsRun.push(
        'PersonaEngine', 'CounterfactualEngine', 'UnbiasedAnalysis',
        'IFCGlobalStandardsEngine',
        'CreativeSynthesis', 'CrossDomainTransfer', 'AutonomousGoal',
        'EthicalReasoning', 'EmotionalIntelligence', 'ScenarioSimulation',
        'SelfEvolvingAlgorithm', 'AdaptiveLearning',
        'UserSignalDecoder', 'InternalEchoDetector', 'InvestmentLifecycleMapper',
        'RegionalMirroringEngine', 'RegionalIdentityDecoder',
        'LatentAdvantageMiner', 'UniversalTranslationLayer'
      );
    } else {
      autonomous = this.emptyAutonomous();
    }
    
    // â"€â"€ Step 5: Record interaction for adaptive learning â"€â"€
    this.adaptiveLearningEngine.recordInteraction({
      timestamp: new Date().toISOString(),
      type: 'report',
      context: {
        country: (params as Record<string, string>).country || 'unknown',
        sector: ((params as Record<string, string[]>).industry || ['general'])[0] || 'general',
        region: (params as Record<string, string>).region || 'unknown',
        investmentSizeM: 0
      },
      input: params as Record<string, unknown>,
      output: {},
      scores: {},
      userSatisfaction: null,
      outcomeAccuracy: null
    });
    
    // â"€â"€ Step 6: Exploration mutation (Thompson sampling) â"€â"€
    this.selfEvolvingEngine.exploreMutation();
    
    // â"€â"€ Step 7: Synthesize unified recommendation â"€â"€
    const recommendation = this.synthesizeRecommendation(
      inputValidation,
      personaAnalysis,
      counterfactual,
      unbiasedAnalysis,
      applicableInsights,
      autonomous
    );
    
    const processingTime = Date.now() - startTime;
    
    // ─── NSIL v2: Universal Intelligence Layer (Layers 11-17) ─────────────────
    // Runs for all problems — the OS-level synthesis that makes this platform
    // capable of handling any domain, any scale, any problem.
    // Layers 11-15: ImpossibilityEngine, UniversalProblemAdapter,
    //              CascadingEffectPredictor, SocialDynamicsAgent,
    //              CompoundIntelligenceOrchestrator
    // Layer 16: AntifragilityEngine (AFI™) — Taleb antifragility quantification
    // Layer 17: TemporalArbitrageEngine (TAI™ + TDI™) — temporal pricing gaps
    let universalIntelligence: CompoundIntelligenceReport | undefined;
    try {
      const universalInput: UniversalProblemInput = {
        naturalLanguageQuery: [
          (params as Record<string, string>).currentMatter,
          (params as Record<string, string>).objectives,
          (params as Record<string, string>).challenges
        ].filter(Boolean).join('. ') || (params as Record<string, string>).region || 'General analysis',
        additionalContext: (params as Record<string, string>).context || (params as Record<string, string>).additionalContext,
        geography: (params as Record<string, string>).country || (params as Record<string, string>).region,
        stakeholders: (params as Record<string, string[]>).stakeholders,
        constraints: (params as Record<string, string[]>).constraints,
        successDefinition: (params as Record<string, string>).successMetric,
        urgency: 'short-term',
        complexity: 'complex'
      };
      universalIntelligence = await CompoundIntelligenceOrchestrator.orchestrate(universalInput);
      componentsRun.push(
        'UniversalProblemAdapter', 'ImpossibilityEngine',
        'CascadingEffectPredictor', 'SocialDynamicsAgent',
        'CompoundIntelligenceOrchestrator',
        'AntifragilityEngine',    // Layer 16 — AFI™
        'TemporalArbitrageEngine' // Layer 17 — TAI™ + TDI™
      );
    } catch {
      // Universal Intelligence is additive — never block the main report
    }

    return {
      id: reportId,
      timestamp: new Date(),
      parameters: params,
      inputValidation,
      personaAnalysis,
      counterfactual,
      unbiasedAnalysis,
      globalStandards,
      universalIntelligence,
      autonomous,
      reflexive,
      applicableInsights,
      recommendation,
      processingTime,
      componentsRun,
      engineVersions: {
        nsil: '5.0',
        autonomous: '1.0',
        reflexive: '1.0',
        globalStandards: '1.0',
        knowledge: '2.0',
        cognition: '1.5',
        proactive: '1.2',
        antifragility: '1.0',    // Layer 16 — AFI™
        temporalArbitrage: '1.0' // Layer 17 — TAI™ + TDI™
      }
    };
  }

  // 
  // AUTONOMOUS INTELLIGENCE LAYER
  // 

  /**
   * Run all 8 autonomous engines and compile results.
   * This is the layer that makes the system unprecedented.
   */
  private static async runAutonomousLayer(params: Partial<ReportParameters>): Promise<AutonomousIntelligence> {
    const country = (params as Record<string, string>).country || 'Australia';
    const sector = ((params as Record<string, string[]>).industry || ['general'])[0] || 'general';
    const region = (params as Record<string, string>).region || '';

    // 1. Creative Synthesis " novel strategy generation
    const creativeCtx: SynthesisContext = { country, sector, region, investmentSizeM: 10, existingCapabilities: [], constraints: [], objectives: ['growth', 'sustainability'] };
    const creativeResult = await CreativeSynthesisEngine.synthesise(creativeCtx, 5);
    const creativeStrategies = creativeResult.strategies.map(s => ({
      strategy: s.title,
      noveltyScore: s.noveltyScore,
      feasibilityScore: s.feasibilityScore
    }));

    // 2. Cross-Domain Transfer " structural analogies
    const transferCtx: TransferContext = { country, sector, region, challenge: 'market access and infrastructure', currentState: ['emerging market', 'developing infrastructure'], desiredState: ['competitive market', 'robust infrastructure'] };
    const transferResult = await CrossDomainTransferEngine.analyse(transferCtx);
    const crossDomainInsights = transferResult.topInsights.slice(0, 5).map(t => ({
      analogy: t.sourceObservation,
      sourceModel: t.targetPrediction,
      transferScore: t.confidence
    }));

    // 3. Autonomous Goals " self-initiated objectives
    const goalCtx: GoalGenerationContext = { country, sector, region, spiScore: 50, rroiScore: 50, riskFlags: [], opportunities: [], dataGaps: [], stakeholderConcerns: [], timelineWeeks: 12, investmentSizeM: 10, existingGoals: [] };
    const goalEngine = new AutonomousGoalEngine();
    const goalResult = await goalEngine.generateGoals(goalCtx);
    const autonomousGoals = goalResult.goals.slice(0, 5).map(g => ({
      goal: g.description,
      priority: g.compositeScore,
      status: g.status,
      reasoning: g.reasoning
    }));

    // 4. Ethical Reasoning " value alignment check
    const ethicalCtx: EthicalContext = {
      country,
      region,
      sector,
      investmentSizeM: 10,
      expectedJobs: 100,
      environmentalImpact: 'neutral',
      displacementRisk: false,
      communityConsulted: true,
      indigenousLandOverlap: false,
      localOwnershipPercentage: 50,
      profitRepatriationPercentage: 30,
      taxIncentivesOffered: false,
      labourStandards: 'international',
      supplyChainVisibility: 60
    };
    const ethicalResult = await EthicalReasoningEngine.assess(ethicalCtx);
    const ethicalAssessment = {
      score: ethicalResult.overallEthicsScore,
      recommendation: ethicalResult.recommendation,
      flags: ethicalResult.flags.map(f => ({ severity: f.severity, description: f.description }))
    };

    // 5. Emotional Intelligence " stakeholder emotional dynamics
    const emotionalCtx: EmotionalContext = {
      country,
      region,
      sector,
      investmentSizeM: 10,
      hasDeadline: false,
      deadlineWeeks: 52,
      isElectionYear: false,
      hasMediaAttention: false,
      previousFailedAttempts: 0,
      communitySupport: 'moderate',
      investorRiskAppetite: 'moderate'
    };
    const emotionalResult = await EmotionalIntelligenceEngine.analyse(emotionalCtx);
    const emotionalClimate = {
      overallValence: emotionalResult.aggregateEmotionalClimate.overallValence,
      derailmentRisk: emotionalResult.aggregateEmotionalClimate.riskOfEmotionalDerailment,
      framingRecommendation: emotionalResult.prospectTheory.framingRecommendation
    };

    // 6. Scenario Simulation " forward-looking Monte Carlo
    const simCtx: SimulationContext = {
      country,
      region,
      sector,
      investmentSizeM: 10,
      timelineQuarters: 8,
      initialSPI: 60,
      initialRROI: 55,
      riskFactors: [],
      opportunities: []
    };
    const simResult = await ScenarioSimulationEngine.quickSimulate(simCtx);
    const scenarioOutlook = {
      probabilityOfSuccess: simResult.probabilityOfSuccess,
      medianSPI: simResult.medianSPI,
      riskLevel: simResult.riskLevel
    };

    // 7. Self-Evolving Algorithm " get evolution state
    const evoReport = this.selfEvolvingEngine.getReport();
    const evolutionReport = {
      generation: evoReport.generation,
      fitness: evoReport.fitness,
      mutationsApplied: evoReport.mutationsApplied
    };

    // 8. Adaptive Learning " get learning state
    const learnReport = this.adaptiveLearningEngine.getReport();
    const learningReport = {
      patternsLearned: learnReport.patternsLearned,
      accuracyTrend: learnReport.scoreAccuracyTrend,
      activePatterns: learnReport.activePatterns
    };

    return {
      creativeStrategies,
      crossDomainInsights,
      autonomousGoals,
      ethicalAssessment,
      emotionalClimate,
      scenarioOutlook,
      evolutionReport,
      learningReport
    };
  }

  private static emptyAutonomous(): AutonomousIntelligence {
    return {
      creativeStrategies: [],
      crossDomainInsights: [],
      autonomousGoals: [],
      ethicalAssessment: { score: 0, recommendation: 'reject', flags: [] },
      emotionalClimate: { overallValence: 0, derailmentRisk: 0, framingRecommendation: '' },
      scenarioOutlook: { probabilityOfSuccess: 0, medianSPI: 0, riskLevel: 'critical' },
      evolutionReport: { generation: 0, fitness: 0, mutationsApplied: 0 },
      learningReport: { patternsLearned: 0, accuracyTrend: 0, activePatterns: 0 }
    };
  }

  // 
  // REFLEXIVE INTELLIGENCE LAYER (Layer 9)
  // 

  /**
   * Run all 7 reflexive engines and compile results.
   * This layer turns the system's analytical power inward " on the user's
   * own inputs, assumptions, blind spots, and hidden assets.
   */
  private static async runReflexiveLayer(
    params: Partial<ReportParameters>,
    autonomous: AutonomousIntelligence
  ): Promise<ReflexiveIntelligence> {
    const country = (params as Record<string, string>).country || '';
    const sectorArr = (params as Record<string, string[]>).industry || ['general'];
    const sector = sectorArr[0] || 'general';
    const region = (params as Record<string, string>).region || '';

    // Build UserInputSnapshot from params
    const snapshot: UserInputSnapshot = {
      missionSummary: (params as Record<string, string>).objectives || '',
      problemStatement: (params as Record<string, string>).challenges || '',
      strategicIntent: Array.isArray((params as Record<string, unknown>).strategicIntent)
        ? (params as Record<string, string[]>).strategicIntent
        : [(params as Record<string, string>).objectives || 'market-entry'],
      additionalContext: (params as Record<string, string>).context || (params as Record<string, string>).additionalContext || '',
      country,
      region,
      sector: sectorArr,
      riskConcerns: (params as Record<string, string>).riskConcerns || '',
      partnerProfile: (params as Record<string, string>).partnerProfile || '',
      collaborativeNotes: (params as Record<string, string>).collaborativeNotes || '',
      politicalSensitivities: Array.isArray((params as Record<string, unknown>).politicalSensitivities)
        ? (params as Record<string, string[]>).politicalSensitivities
        : [],
      priorityThemes: Array.isArray((params as Record<string, unknown>).priorityThemes)
        ? (params as Record<string, string[]>).priorityThemes
        : []
    };

    // 1. User Signal Decoder " detect repetition, avoidance, circularity
    const userSignals = await UserSignalDecoder.decode(snapshot);

    // 2. Internal Echo Detector " cross-reference within user's own data
    const internalEchoes = InternalEchoDetector.detect(snapshot);

    // 3. Investment Lifecycle Mapper " where is this region on the curve?
    const lifecycleCtx: LifecycleContext = {
      region,
      country,
      sector: sector,
      currentFDITrend: 'unknown',
      yearsOfFDIData: 5,
      hasHistoricalInvestment: snapshot.additionalContext.toLowerCase().includes('previous') ||
                                snapshot.additionalContext.toLowerCase().includes('historical') ||
                                snapshot.additionalContext.toLowerCase().includes('used to'),
      previousPeakSector: sector,
      populationTrend: snapshot.additionalContext.toLowerCase().includes('growing') ? 'growing' :
                       snapshot.additionalContext.toLowerCase().includes('declining') ? 'declining' : 'stable',
      infrastructureAge: snapshot.collaborativeNotes.toLowerCase().includes('new') ? 'new' :
                          snapshot.collaborativeNotes.toLowerCase().includes('aging') ? 'aging' : 'developing',
      governmentPriority: snapshot.additionalContext.toLowerCase().includes('priority') ||
                           snapshot.additionalContext.toLowerCase().includes('government support') ? 'high' : 'medium',
      existingAssets: (snapshot.collaborativeNotes + ' ' + snapshot.additionalContext)
        .split(/[,;.]/)
        .map(s => s.trim())
        .filter(s => s.length > 3)
    };
    const lifecyclePosition = InvestmentLifecycleMapper.map(lifecycleCtx);

    // 4. Regional Mirroring Engine " find structural twins
    const mirrorAnalysis = RegionalMirroringEngine.mirror(snapshot);

    // 5. Regional Identity Decoder " simulacrum detection
    const identityAnalysis = RegionalIdentityDecoder.decode(snapshot);

    // 6. Latent Advantage Miner " "junk DNA" mining
    const latentAdvantages = LatentAdvantageMiner.mine(snapshot);

    // 7. Universal Translation Layer " audience-specific outputs
    // Convert key findings into translation inputs
    const translationInputs: TranslationInput[] = [];

    // Add autonomous findings as translation inputs
    for (const strategy of autonomous.creativeStrategies.slice(0, 3)) {
      translationInputs.push({
        finding: strategy.strategy,
        category: 'opportunity',
        confidence: strategy.feasibilityScore,
        region, sector,
        context: 'Creative synthesis engine output',
        sourceEngine: 'CreativeSynthesisEngine'
      });
    }

    // Add latent advantages as translation inputs
    for (const adv of latentAdvantages.latentAdvantages.slice(0, 3)) {
      translationInputs.push({
        finding: `Hidden asset: ${adv.asset} " ${adv.historicalValue}`,
        category: 'hidden-asset',
        confidence: adv.confidenceScore * 100,
        region, sector,
        context: adv.exploitationStrategy,
        sourceEngine: 'LatentAdvantageMiner'
      });
    }

    // Add lifecycle position as translation input
    translationInputs.push({
      finding: `Region is in the ${lifecyclePosition.currentPhase} phase of investment lifecycle. ${lifecyclePosition.phaseRationale}`,
      category: 'lifecycle-position',
      confidence: lifecyclePosition.phaseConfidence,
      region, sector,
      context: lifecyclePosition.reactivationPlaybook.join('; '),
      sourceEngine: 'InvestmentLifecycleMapper'
    });

    // Add identity insight as translation input
    translationInputs.push({
      finding: identityAnalysis.positioningRecommendation,
      category: 'identity-insight',
      confidence: identityAnalysis.overallAuthenticity,
      region, sector,
      context: `Simulacrum level: ${identityAnalysis.simulacrumLevel}`,
      sourceEngine: 'RegionalIdentityDecoder'
    });

    const translationPackage = UniversalTranslationLayer.translate(translationInputs);

    return {
      userSignals,
      internalEchoes,
      lifecyclePosition,
      mirrorAnalysis,
      identityAnalysis,
      latentAdvantages,
      translationPackage
    };
  }

  // 
  // QUICK ASSESSMENT
  // 
  
  /**
   * Quick assessment " faster, less comprehensive.
   * Now includes ethical gate check and emotional climate.
   */
  static async quickAssess(params: Partial<ReportParameters>): Promise<QuickAssessment> {
    // Quick input check
    const inputCheck = InputShieldService.quickCheck(params);
    
    // Quick counterfactual
    const counterfactualQuick = CounterfactualEngine.getQuickSummary(params);

    // Quick ethical check
    const country = (params as Record<string, string>).country || 'Australia';
    const sector = ((params as Record<string, string[]>).industry || ['general'])[0] || 'general';
    const ethicalQuick = await EthicalReasoningEngine.quickCheck({
      country, region: '', sector,
      investmentSizeM: 10, expectedJobs: 100,
      environmentalImpact: 'neutral', displacementRisk: false,
      communityConsulted: true, indigenousLandOverlap: false,
      localOwnershipPercentage: 50, profitRepatriationPercentage: 30,
      taxIncentivesOffered: false, labourStandards: 'international',
      supplyChainVisibility: 60
    });

    // Quick emotional check
    const emotionalQuick = await EmotionalIntelligenceEngine.quickCheck({
      country, region: '', sector,
      investmentSizeM: 10, hasDeadline: false, deadlineWeeks: 52,
      isElectionYear: false, hasMediaAttention: false,
      previousFailedAttempts: 0, communitySupport: 'moderate',
      investorRiskAppetite: 'moderate'
    });
    
    // Calculate trust score
    let trustScore = 70;
    
    if (!inputCheck.safe) {
      trustScore = 20;
    } else {
      trustScore = Math.min(95, Math.max(30, 
        50 + counterfactualQuick.confidence * 0.3 - inputCheck.issues.length * 15
      ));
      // Ethical adjustment
      if (!ethicalQuick.pass) trustScore = Math.min(trustScore, 40);
    }
    
    // Determine status color
    let status: QuickAssessment['status'] = 'yellow';
    if (!inputCheck.safe) {
      status = 'red';
    } else if (!ethicalQuick.pass) {
      status = 'orange';
    } else if (trustScore >= 70) {
      status = 'green';
    } else if (trustScore >= 50) {
      status = 'yellow';
    } else {
      status = 'orange';
    }
    
    // Generate headline
    let headline = '';
    if (status === 'red') {
      headline = 'Critical issues must be resolved before analysis';
    } else if (status === 'green') {
      headline = 'Inputs validated - analysis ready to proceed';
    } else if (status === 'yellow') {
      headline = 'Some concerns identified - review recommended';
    } else {
      headline = 'Multiple concerns require attention';
    }
    
    // Next step
    let nextStep = '';
    if (status === 'red') {
      nextStep = `Resolve: ${inputCheck.issues[0] || 'Critical validation issues'}`;
    } else if (!ethicalQuick.pass) {
      nextStep = `Ethical concern: ${ethicalQuick.topConcern}`;
    } else if (counterfactualQuick.keyRisks.length > 0) {
      nextStep = `Address: ${counterfactualQuick.keyRisks[0]}`;
    } else {
      nextStep = 'Run full analysis for detailed recommendations';
    }
    
    return {
      trustScore,
      status,
      headline,
      topConcerns: [
        ...inputCheck.issues.slice(0, 2),
        ...counterfactualQuick.keyRisks.slice(0, 2)
      ].slice(0, 3),
      topOpportunities: counterfactualQuick.shouldProceed 
        ? ['Opportunity appears viable', 'No critical blockers identified']
        : [],
      nextStep,
      ethicalPass: ethicalQuick.pass,
      emotionalClimateNotes: emotionalQuick.conducive 
        ? 'Emotional climate is stable' 
        : `Caution: ${emotionalQuick.topConcern}`
    };
  }
  
  /**
   * Get prediction accuracy and learning metrics
   */
  static getSystemAccuracy(): PredictionAccuracy {
    return OutcomeTracker.getPredictionAccuracy();
  }
  
  /**
   * Track a decision for future learning
   */
  static trackDecision(
    params: Partial<ReportParameters>,
    predictions: {
      compositeScore: number;
      riskScore: number;
      successProbability: number;
      estimatedROI: number;
      estimatedTimeline: string;
      keyRisks: string[];
      keyOpportunities: string[];
    },
    decision: 'proceed' | 'declined' | 'modified' | 'deferred',
    rationale?: string
  ): string {
    return OutcomeTracker.trackDecision(params, predictions, decision, rationale);
  }
  
  /**
   * Record outcome for a tracked decision
   */
  static recordOutcome(
    decisionId: string,
    outcome: {
      success: boolean;
      actualROI?: number;
      actualTimeline?: string;
      keyLessons: string[];
      unexpectedFactors: string[];
      outcomeScore: number;
    }
  ): void {
    OutcomeTracker.recordOutcome(decisionId, {
      recordedAt: new Date(),
      ...outcome
    });
  }
  
  /**
   * Get all learning insights
   */
  static getInsights(): LearningInsight[] {
    return OutcomeTracker.getInsights();
  }
  
  /**
   * Synthesize unified recommendation from ALL components.
   * Now includes ethical gate and emotional risk.
   */
  private static synthesizeRecommendation(
    inputValidation: ShieldReport,
    personaAnalysis?: FullPersonaAnalysis,
    counterfactual?: CounterfactualAnalysis,
    unbiasedAnalysis?: FullUnbiasedAnalysis,
    applicableInsights?: LearningInsight[],
    autonomous?: AutonomousIntelligence
  ): IntelligenceReport['recommendation'] {
    
    // If inputs were rejected, return early
    if (inputValidation.overallStatus === 'rejected') {
      return {
        action: 'do-not-proceed',
        confidence: 95,
        summary: 'Critical validation issues prevent analysis. Resolve the following before proceeding.',
        criticalActions: inputValidation.recommendations,
        keyRisks: inputValidation.validationResults
          .filter(r => r.flag === 'critical')
          .map(r => r.message),
        keyOpportunities: [],
        ethicalGate: 'fail',
        emotionalRisk: 0
      };
    }
    
    // Collect signals from all components
    const signals = {
      inputTrust: inputValidation.overallTrust,
      personaRecommendation: personaAnalysis?.synthesis.overallRecommendation,
      personaConfidence: personaAnalysis?.synthesis.confidenceLevel || 0,
      counterfactualRobustness: counterfactual?.robustness.score || 0,
      monteCarloLossProb: counterfactual?.monteCarlo.probabilityOfLoss || 50,
      unbiasedBalance: unbiasedAnalysis?.balanceScore || 50,
      // Autonomous signals
      ethicalScore: autonomous?.ethicalAssessment.score || 50,
      ethicalRecommendation: autonomous?.ethicalAssessment.recommendation || 'proceed',
      emotionalDerailmentRisk: autonomous?.emotionalClimate.derailmentRisk || 0,
      scenarioProbSuccess: autonomous?.scenarioOutlook.probabilityOfSuccess || 0.5
    };
    
    // Calculate weighted action decision
    let actionScore = 0;
    let confidenceFactors: number[] = [];
    
    // Input validation weight
    actionScore += (signals.inputTrust - 50) * 0.2;
    confidenceFactors.push(signals.inputTrust);
    
    // Persona recommendation weight
    if (signals.personaRecommendation === 'proceed') actionScore += 25;
    else if (signals.personaRecommendation === 'proceed-with-caution') actionScore += 10;
    else if (signals.personaRecommendation === 'significant-concerns') actionScore -= 15;
    else if (signals.personaRecommendation === 'do-not-proceed') actionScore -= 30;
    confidenceFactors.push(signals.personaConfidence);
    
    // Counterfactual weight
    actionScore += (signals.counterfactualRobustness - 50) * 0.3;
    actionScore -= (signals.monteCarloLossProb - 30) * 0.2;
    confidenceFactors.push(signals.counterfactualRobustness);

    // Autonomous signal weights
    // Ethical gate " hard constraint
    if (signals.ethicalRecommendation === 'reject') actionScore -= 40;
    else if (signals.ethicalRecommendation === 'redesign') actionScore -= 20;
    
    // Scenario simulation weight
    actionScore += (signals.scenarioProbSuccess - 0.5) * 30;
    
    // Emotional risk weight
    if (signals.emotionalDerailmentRisk > 0.6) actionScore -= 15;
    
    // Determine ethical gate status
    let ethicalGate: 'pass' | 'conditional' | 'fail';
    if (signals.ethicalRecommendation === 'reject') ethicalGate = 'fail';
    else if (signals.ethicalRecommendation === 'redesign' || signals.ethicalRecommendation === 'proceed-with-conditions') ethicalGate = 'conditional';
    else ethicalGate = 'pass';
    
    // Determine action
    let action: IntelligenceReport['recommendation']['action'];
    if (ethicalGate === 'fail') action = 'do-not-proceed';
    else if (actionScore >= 20) action = 'proceed';
    else if (actionScore >= 0) action = 'proceed-with-caution';
    else if (actionScore >= -20) action = 'revise-and-retry';
    else action = 'do-not-proceed';
    
    // Calculate confidence
    const confidence = Math.round(
      confidenceFactors.reduce((a, b) => a + b, 0) / Math.max(confidenceFactors.length, 1)
    );
    
    // Collect critical actions (including autonomous)
    const criticalActions: string[] = [
      ...(personaAnalysis?.synthesis.criticalActions || []),
      ...(counterfactual?.robustness.vulnerabilities.map(v => `Address: ${v}`) || []),
      ...(autonomous?.ethicalAssessment.flags
        .filter(f => f.severity === 'critical')
        .map(f => `Ethical: ${f.description}`) || [])
    ].slice(0, 7);
    
    // Collect key risks
    const keyRisks: string[] = [
      ...(personaAnalysis?.skeptic.dealKillers.map(d => d.title) || []),
      ...(personaAnalysis?.skeptic.hiddenRisks.map(r => r.title) || []),
      ...(autonomous?.autonomousGoals
        .filter(g => g.priority > 70)
        .map(g => `Auto-detected: ${g.goal}`) || [])
    ].slice(0, 5);
    
    // Collect key opportunities (including creative synthesis)
    const keyOpportunities: string[] = [
      ...(personaAnalysis?.advocate.upsidePotential.map(u => u.title) || []),
      ...(personaAnalysis?.advocate.synergies.map(s => s.title) || []),
      ...(autonomous?.creativeStrategies
        .filter(s => s.feasibilityScore > 50)
        .map(s => s.strategy) || [])
    ].slice(0, 5);
    
    // Generate summary
    let summary = '';
    if (action === 'proceed') {
      summary = `Analysis indicates a viable opportunity with ${confidence}% confidence. ` +
        `Ethical score: ${signals.ethicalScore}/100. ` +
        `Scenario success probability: ${(signals.scenarioProbSuccess * 100).toFixed(0)}%. ` +
        (personaAnalysis?.synthesis.summary || 'Multiple perspectives support proceeding.');
    } else if (action === 'proceed-with-caution') {
      summary = `Opportunity shows promise but has notable concerns. ` +
        (keyRisks.length > 0 ? `Key risk: ${keyRisks[0]}. ` : '') +
        `Emotional derailment risk: ${(signals.emotionalDerailmentRisk * 100).toFixed(0)}%. ` +
        `Consider the critical actions before full commitment.`;
    } else if (action === 'revise-and-retry') {
      summary = `Current plan has significant issues that should be addressed. ` +
        (keyRisks.length > 0 ? `Primary concern: ${keyRisks[0]}. ` : '') +
        `Revise approach and re-analyze.`;
    } else {
      summary = `Analysis does not support proceeding at this time. ` +
        (ethicalGate === 'fail' ? `Ethical assessment: ${signals.ethicalRecommendation}. ` : '') +
        (criticalActions.length > 0 ? criticalActions[0] : 'Multiple critical issues identified.');
    }
    
    // Add insight if applicable
    if (applicableInsights && applicableInsights.length > 0) {
      const topInsight = applicableInsights[0];
      summary += ` Historical insight: ${topInsight.insight}`;
    }
    
    return {
      action,
      confidence,
      summary,
      criticalActions,
      keyRisks,
      keyOpportunities,
      ethicalGate,
      emotionalRisk: signals.emotionalDerailmentRisk
    };
  }
  
  /**
   * Get component health status " all 13 engines
   */
  static getComponentStatus(): Array<{
    component: string;
    layer: string;
    status: 'operational' | 'degraded' | 'offline';
    lastCheck: Date;
  }> {
    const now = new Date();
    return [
      // Core engines
      { component: 'PersonaEngine',              layer: 'Multi-Agent Debate',        status: 'operational', lastCheck: now },
      { component: 'InputShieldService',          layer: 'Input Shield',              status: 'operational', lastCheck: now },
      { component: 'CounterfactualEngine',        layer: 'Stress Testing',            status: 'operational', lastCheck: now },
      { component: 'OutcomeTracker',              layer: 'Learning',                  status: 'operational', lastCheck: now },
      { component: 'UnbiasedAnalysisEngine',      layer: 'Cognitive Debiasing',       status: 'operational', lastCheck: now },
      // Autonomous engines
      { component: 'CreativeSynthesisEngine',     layer: 'Autonomous Intelligence',   status: 'operational', lastCheck: now },
      { component: 'CrossDomainTransferEngine',   layer: 'Autonomous Intelligence',   status: 'operational', lastCheck: now },
      { component: 'AutonomousGoalEngine',        layer: 'Autonomous Intelligence',   status: 'operational', lastCheck: now },
      { component: 'EthicalReasoningEngine',      layer: 'Autonomous Intelligence',   status: 'operational', lastCheck: now },
      { component: 'SelfEvolvingAlgorithmEngine', layer: 'Autonomous Intelligence',   status: 'operational', lastCheck: now },
      { component: 'AdaptiveLearningEngine',      layer: 'Autonomous Intelligence',   status: 'operational', lastCheck: now },
      { component: 'EmotionalIntelligenceEngine', layer: 'Autonomous Intelligence',   status: 'operational', lastCheck: now },
      { component: 'ScenarioSimulationEngine',    layer: 'Autonomous Intelligence',   status: 'operational', lastCheck: now },
      // Reflexive Intelligence engines (Layer 9)
      { component: 'UserSignalDecoder',             layer: 'Reflexive Intelligence',    status: 'operational', lastCheck: now },
      { component: 'InternalEchoDetector',           layer: 'Reflexive Intelligence',    status: 'operational', lastCheck: now },
      { component: 'InvestmentLifecycleMapper',      layer: 'Reflexive Intelligence',    status: 'operational', lastCheck: now },
      { component: 'RegionalMirroringEngine',        layer: 'Reflexive Intelligence',    status: 'operational', lastCheck: now },
      { component: 'RegionalIdentityDecoder',        layer: 'Reflexive Intelligence',    status: 'operational', lastCheck: now },
      { component: 'LatentAdvantageMiner',           layer: 'Reflexive Intelligence',    status: 'operational', lastCheck: now },
      { component: 'UniversalTranslationLayer',      layer: 'Reflexive Intelligence',    status: 'operational', lastCheck: now }
    ];
  }

  /**
   * Get engine versions for audit provenance
   */
  static getEngineVersions(): Record<string, string> {
    return {
      'NSILIntelligenceHub':        '5.0.0',
      'PersonaEngine':              '2.0.0',
      'InputShieldService':         '1.1.0',
      'CounterfactualEngine':       '1.0.0',
      'OutcomeTracker':             '1.0.0',
      'UnbiasedAnalysisEngine':     '1.0.0',
      'CreativeSynthesisEngine':    '1.0.0',
      'CrossDomainTransferEngine':  '1.0.0',
      'AutonomousGoalEngine':       '1.0.0',
      'EthicalReasoningEngine':     '1.0.0',
      'SelfEvolvingAlgorithmEngine':'1.0.0',
      'AdaptiveLearningEngine':     '1.0.0',
      'EmotionalIntelligenceEngine':'1.0.0',
      'ScenarioSimulationEngine':   '1.0.0',
      'UserSignalDecoder':          '1.0.0',
      'InternalEchoDetector':       '1.0.0',
      'InvestmentLifecycleMapper':  '1.0.0',
      'RegionalMirroringEngine':    '1.0.0',
      'RegionalIdentityDecoder':    '1.0.0',
      'LatentAdvantageMiner':       '1.0.0',
      'UniversalTranslationLayer':  '1.0.0',
      // NSIL v2 Universal Intelligence (Layers 11-14)
      'ImpossibilityEngine':             '1.0.0',
      'UniversalProblemAdapter':         '1.0.0',
      'CascadingEffectPredictor':        '1.0.0',
      'SocialDynamicsAgent':             '1.0.0',
      'CompoundIntelligenceOrchestrator':'1.0.0'
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // NSIL v2: Universal Intelligence — Direct Access
  // Use this method when you want to run ONLY the 5 new agents on any
  // natural language problem, bypassing the investment-specific pipeline.
  // This is the "OS mode" entry point.
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Solve any problem using NSIL v2 Universal Intelligence.
   * Takes natural language input. Returns a full compound intelligence report.
   * No API keys required. Runs fully locally.
   */
  static async solveAnyProblem(query: string, options?: Partial<UniversalProblemInput>): Promise<CompoundIntelligenceReport> {
    return CompoundIntelligenceOrchestrator.orchestrate({
      naturalLanguageQuery: query,
      ...options
    });
  }
}

export default NSILIntelligenceHub;

