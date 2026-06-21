/**
 * ADVANCED ML PIPELINE - Real Pattern Learning & Model Persistence
 * 
 * This provides actual:
 * - Pattern extraction from historical outcomes
 * - Weight adjustment based on prediction accuracy
 * - Model state persistence to disk
 * - Online learning with exponential decay
 * - Feature importance tracking
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Model persistence paths
const MODEL_STATE_PATH = path.resolve(__dirname, 'model_state.json');
const FEATURE_WEIGHTS_PATH = path.resolve(__dirname, 'feature_weights.json');
const PATTERN_STORE_PATH = path.resolve(__dirname, 'pattern_store.json');

// ============================================================================
// TYPES
// ============================================================================

interface ModelState {
  version: string;
  lastTrained: string;
  trainingCycles: number;
  accuracy: number;
  sampleCount: number;
  weights: Record<string, number>;
  biases: Record<string, number>;
  learningRate: number;
  momentum: number;
}

interface FeatureWeight {
  feature: string;
  weight: number;
  importance: number;
  lastUpdated: string;
  updateCount: number;
}

interface Pattern {
  id: string;
  type: 'success' | 'failure' | 'neutral';
  features: Record<string, number | string | boolean>;
  outcome: number;
  confidence: number;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
}

interface TrainingDataPoint {
  taskId: string;
  outcome: {
    actionsTaken: unknown[];
    auditTrail: unknown[];
    confidence: number;
    success?: boolean;
    actualValue?: number;
    predictedValue?: number;
  };
  timestamp: string;
}

// ============================================================================
// MODEL STATE MANAGEMENT
// ============================================================================

function loadModelState(): ModelState {
  try {
    if (fs.existsSync(MODEL_STATE_PATH)) {
      return JSON.parse(fs.readFileSync(MODEL_STATE_PATH, 'utf-8'));
    }
  } catch {
    console.warn('Failed to load model state, initializing new model');
  }
  
  return {
    version: '1.0.0',
    lastTrained: new Date().toISOString(),
    trainingCycles: 0,
    accuracy: 0.5,
    sampleCount: 0,
    weights: {
      confidence: 0.3,
      actionCount: 0.2,
      auditLength: 0.1,
      successRate: 0.4
    },
    biases: { default: 0.1 },
    learningRate: 0.01,
    momentum: 0.9
  };
}

function saveModelState(state: ModelState): void {
  try {
    fs.writeFileSync(MODEL_STATE_PATH, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Failed to save model state:', error);
  }
}

function loadPatterns(): Pattern[] {
  try {
    if (fs.existsSync(PATTERN_STORE_PATH)) {
      return JSON.parse(fs.readFileSync(PATTERN_STORE_PATH, 'utf-8'));
    }
  } catch {
    console.warn('Failed to load patterns');
  }
  return [];
}

function savePatterns(patterns: Pattern[]): void {
  try {
    fs.writeFileSync(PATTERN_STORE_PATH, JSON.stringify(patterns, null, 2));
  } catch (error) {
    console.error('Failed to save patterns:', error);
  }
}

function loadFeatureWeights(): FeatureWeight[] {
  try {
    if (fs.existsSync(FEATURE_WEIGHTS_PATH)) {
      return JSON.parse(fs.readFileSync(FEATURE_WEIGHTS_PATH, 'utf-8'));
    }
  } catch {
    console.warn('Failed to load feature weights');
  }
  return [];
}

function saveFeatureWeights(weights: FeatureWeight[]): void {
  try {
    fs.writeFileSync(FEATURE_WEIGHTS_PATH, JSON.stringify(weights, null, 2));
  } catch (error) {
    console.error('Failed to save feature weights:', error);
  }
}

// ============================================================================
// FEATURE EXTRACTION
// ============================================================================

function extractFeatures(dataPoint: TrainingDataPoint): Record<string, number> {
  const features: Record<string, number> = {};
  
  features.confidence = dataPoint.outcome.confidence || 0;
  features.actionCount = dataPoint.outcome.actionsTaken?.length || 0;
  features.auditLength = dataPoint.outcome.auditTrail?.length || 0;
  features.hasSuccess = dataPoint.outcome.success ? 1 : 0;
  features.actionDensity = features.auditLength > 0 
    ? features.actionCount / features.auditLength : 0;
  
  const timestamp = new Date(dataPoint.timestamp);
  features.hourOfDay = timestamp.getHours() / 24;
  features.dayOfWeek = timestamp.getDay() / 7;
  
  if (dataPoint.outcome.actualValue !== undefined && dataPoint.outcome.predictedValue !== undefined) {
    features.predictionError = Math.abs(dataPoint.outcome.actualValue - dataPoint.outcome.predictedValue);
    features.predictionAccuracy = 1 - Math.min(1, features.predictionError / Math.max(1, dataPoint.outcome.actualValue));
  }
  
  return features;
}

// ============================================================================
// PATTERN RECOGNITION
// ============================================================================

function findMatchingPattern(features: Record<string, number>, patterns: Pattern[]): Pattern | null {
  let bestMatch: Pattern | null = null;
  let bestScore = 0;
  
  for (const pattern of patterns) {
    let matchScore = 0;
    let totalFeatures = 0;
    
    for (const [key, value] of Object.entries(pattern.features)) {
      if (key in features) {
        totalFeatures++;
        const featureValue = features[key];
        if (typeof value === 'number' && typeof featureValue === 'number') {
          const similarity = 1 - Math.abs(value - featureValue) / Math.max(1, Math.abs(value));
          if (similarity > 0.8) matchScore++;
        } else if (value === featureValue) {
          matchScore++;
        }
      }
    }
    
    const score = totalFeatures > 0 ? matchScore / totalFeatures : 0;
    if (score > bestScore && score > 0.7) {
      bestScore = score;
      bestMatch = pattern;
    }
  }
  
  return bestMatch;
}

function createPattern(features: Record<string, number>, outcome: number, success: boolean): Pattern {
  return {
    id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: success ? 'success' : outcome > 0.5 ? 'neutral' : 'failure',
    features: { ...features },
    outcome,
    confidence: 0.5,
    occurrences: 1,
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString()
  };
}

function updatePattern(pattern: Pattern, outcome: number): Pattern {
  const alpha = 0.3;
  pattern.outcome = alpha * outcome + (1 - alpha) * pattern.outcome;
  pattern.occurrences++;
  pattern.lastSeen = new Date().toISOString();
  pattern.confidence = Math.min(0.99, 0.5 + (pattern.occurrences * 0.05));
  return pattern;
}

// ============================================================================
// GRADIENT DESCENT TRAINING
// ============================================================================

function computeGradient(
  features: Record<string, number>,
  target: number,
  prediction: number
): Record<string, number> {
  const gradients: Record<string, number> = {};
  const error = prediction - target;
  
  for (const [feature, value] of Object.entries(features)) {
    gradients[feature] = error * value;
  }
  
  return gradients;
}

function applyGradient(
  weights: Record<string, number>,
  gradients: Record<string, number>,
  learningRate: number,
  momentum: number,
  previousGradients: Record<string, number> = {}
): { weights: Record<string, number>; gradients: Record<string, number> } {
  const newWeights: Record<string, number> = { ...weights };
  const newGradients: Record<string, number> = {};
  
  for (const [feature, gradient] of Object.entries(gradients)) {
    const prevGrad = previousGradients[feature] || 0;
    const momentumGrad = momentum * prevGrad + (1 - momentum) * gradient;
    newGradients[feature] = momentumGrad;
    
    if (feature in newWeights) {
      newWeights[feature] -= learningRate * momentumGrad;
      newWeights[feature] = Math.max(-2, Math.min(2, newWeights[feature]));
    } else {
      newWeights[feature] = -learningRate * momentumGrad;
    }
  }
  
  return { weights: newWeights, gradients: newGradients };
}

// ============================================================================
// MAIN TRAINING FUNCTION
// ============================================================================

export function retrainModel(data: TrainingDataPoint[]): void {
  if (!data || data.length === 0) {
    console.log('No training data provided');
    return;
  }
  
  console.log(`ðŸ§  ML Pipeline: Training on ${data.length} data points`);
  
  let modelState = loadModelState();
  let patterns = loadPatterns();
  const featureWeights = loadFeatureWeights();
  let previousGradients: Record<string, number> = {};
  
  let totalLoss = 0;
  let correctPredictions = 0;
  
  for (const dataPoint of data) {
    const features = extractFeatures(dataPoint);
    
    let prediction = modelState.biases.default;
    for (const [feature, value] of Object.entries(features)) {
      const weight = modelState.weights[feature] || 0;
      prediction += weight * value;
    }
    prediction = 1 / (1 + Math.exp(-prediction));
    
    const target = dataPoint.outcome.success ? 1 : 
                   dataPoint.outcome.confidence > 0.7 ? 1 : 0;
    
    const loss = Math.pow(prediction - target, 2);
    totalLoss += loss;
    
    const predictedClass = prediction > 0.5 ? 1 : 0;
    if (predictedClass === target) correctPredictions++;
    
    const gradients = computeGradient(features, target, prediction);
    const result = applyGradient(
      modelState.weights,
      gradients,
      modelState.learningRate,
      modelState.momentum,
      previousGradients
    );
    modelState.weights = result.weights;
    previousGradients = result.gradients;
    
    const matchingPattern = findMatchingPattern(features, patterns);
    if (matchingPattern) {
      updatePattern(matchingPattern, target);
    } else {
      patterns.push(createPattern(features, target, target === 1));
    }
    
    for (const [feature] of Object.entries(features)) {
      const existing = featureWeights.find(fw => fw.feature === feature);
      if (existing) {
        existing.weight = modelState.weights[feature] || 0;
        existing.importance = Math.abs(existing.weight);
        existing.lastUpdated = new Date().toISOString();
        existing.updateCount++;
      } else {
        featureWeights.push({
          feature,
          weight: modelState.weights[feature] || 0,
          importance: Math.abs(modelState.weights[feature] || 0),
          lastUpdated: new Date().toISOString(),
          updateCount: 1
        });
      }
    }
  }
  
  modelState.trainingCycles++;
  modelState.lastTrained = new Date().toISOString();
  modelState.sampleCount += data.length;
  modelState.accuracy = correctPredictions / data.length;
  
  if (modelState.accuracy > 0.9) {
    modelState.learningRate = Math.max(0.001, modelState.learningRate * 0.95);
  } else if (modelState.accuracy < 0.6) {
    modelState.learningRate = Math.min(0.1, modelState.learningRate * 1.05);
  }
  
  patterns.sort((a, b) => b.occurrences - a.occurrences);
  patterns = patterns.slice(0, 1000);
  
  saveModelState(modelState);
  savePatterns(patterns);
  saveFeatureWeights(featureWeights);
  
  console.log(`âœ… Training complete: Cycles=${modelState.trainingCycles}, Accuracy=${(modelState.accuracy * 100).toFixed(1)}%, Patterns=${patterns.length}, Loss=${(totalLoss / data.length).toFixed(4)}`);
}

// ============================================================================
// PREDICTION FUNCTIONS
// ============================================================================

export function predictOutcome(input: Record<string, number> | number): number {
  const modelState = loadModelState();
  
  if (typeof input === 'number') {
    return modelState.biases.default + modelState.weights.confidence * input;
  }
  
  let prediction = modelState.biases.default;
  for (const [feature, value] of Object.entries(input)) {
    const weight = modelState.weights[feature] || 0;
    prediction += weight * value;
  }
  
  return 1 / (1 + Math.exp(-prediction));
}

export function predictWithPatterns(features: Record<string, number>): {
  prediction: number;
  confidence: number;
  matchedPattern: Pattern | null;
  reasoning: string;
} {
  const patterns = loadPatterns();
  const matchedPattern = findMatchingPattern(features, patterns);
  
  if (matchedPattern) {
    return {
      prediction: matchedPattern.outcome,
      confidence: matchedPattern.confidence,
      matchedPattern,
      reasoning: `Matched pattern "${matchedPattern.id}" with ${matchedPattern.occurrences} occurrences`
    };
  }
  
  const prediction = predictOutcome(features);
  return {
    prediction,
    confidence: 0.5,
    matchedPattern: null,
    reasoning: 'No matching pattern found, using weight-based prediction'
  };
}

export function getModelDiagnostics(): {
  state: ModelState;
  topFeatures: FeatureWeight[];
  patternCount: number;
  recentPatterns: Pattern[];
} {
  const modelState = loadModelState();
  const featureWeights = loadFeatureWeights();
  const patterns = loadPatterns();
  
  const topFeatures = [...featureWeights]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 10);
  
  const recentPatterns = [...patterns]
    .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
    .slice(0, 5);
  
  return { state: modelState, topFeatures, patternCount: patterns.length, recentPatterns };
}

export function resetModel(): void {
  try {
    if (fs.existsSync(MODEL_STATE_PATH)) fs.unlinkSync(MODEL_STATE_PATH);
    if (fs.existsSync(FEATURE_WEIGHTS_PATH)) fs.unlinkSync(FEATURE_WEIGHTS_PATH);
    if (fs.existsSync(PATTERN_STORE_PATH)) fs.unlinkSync(PATTERN_STORE_PATH);
    console.log('Model reset complete');
  } catch (error) {
    console.error('Failed to reset model:', error);
  }
}
