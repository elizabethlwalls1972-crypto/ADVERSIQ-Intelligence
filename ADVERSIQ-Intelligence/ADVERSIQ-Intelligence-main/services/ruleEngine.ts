import { compile } from 'mathjs';
import { NeuroSymbolicState, ChecklistItem, DynamicFormula, ReportParameters, ChecklistStatus } from '../types';

// --- INITIAL DATA SEEDING ---

export const INITIAL_CHECKLIST: ChecklistItem[] = [
    { id: 'c1', label: 'Organization Name Defined', category: 'Identity', status: 'pending', required: true, description: 'Legal entity name must be provided.' },
    { id: 'c2', label: 'Target Country Selected', category: 'Strategy', status: 'pending', required: true, description: 'Primary jurisdiction for analysis.' },
    { id: 'c3', label: 'Revenue Band Confirmed', category: 'Identity', status: 'pending', required: true, description: 'Scale of operations validation.' },
    { id: 'c4', label: 'Strategic Intent Clarified', category: 'Strategy', status: 'pending', required: true, description: 'Clear mission statement provided.' },
    { id: 'c5', label: 'Budget Cap Defined', category: 'Financial', status: 'pending', required: false, description: 'Maximum capital allocation set.' },
    { id: 'c6', label: 'Risk Tolerance Set', category: 'Risk', status: 'pending', required: true, description: 'Acceptable risk profile selected.' },
    { id: 'c7', label: 'Sector Identified', category: 'Strategy', status: 'pending', required: true, description: 'Primary industry vertical.' },
    { id: 'c8', label: 'Timeline Established', category: 'Strategy', status: 'pending', required: false, description: 'Execution horizon defined.' },
    { id: 'c9', label: 'Compliance Audit', category: 'Compliance', status: 'pending', required: false, description: 'Preliminary regulatory check.' },
    { id: 'c10', label: 'Partner Profile', category: 'Strategy', status: 'pending', required: false, description: 'Ideal counterparty attributes.' }
];

export const INITIAL_FORMULAS: DynamicFormula[] = [
    { 
        id: 'f1', 
        name: 'Risk Adjusted Velocity', 
        expression: '(revenue_score * 0.3) + (100 - risk_score)', 
        variables: ['revenue_score', 'risk_score'],
        description: 'Calculates speed of execution vs risk exposure.',
        isSystem: true
    },
    { 
        id: 'f2', 
        name: 'Market Penetration Potential', 
        expression: 'market_size / competition_index * 10', 
        variables: ['market_size', 'competition_index'],
        description: 'Estimates ease of entry based on saturation.',
        isSystem: true
    }
];

// --- LOGIC ENGINE ---

export class NeuroSymbolicEngine {
    
    // 1. Validate Checklist against Current Params
    static validateGatekeeper(params: ReportParameters, currentState: NeuroSymbolicState): NeuroSymbolicState {
        const updatedChecklist = currentState.checklist.map((item): ChecklistItem => {
            let isSatisfied = false;
            let val: any = undefined;

            // Map params to checklist items (Symbolic Logic)
            switch(item.id) {
                case 'c1': isSatisfied = !!params.organizationName && params.organizationName.length > 2; val = params.organizationName; break;
                case 'c2': isSatisfied = !!params.country; val = params.country; break;
                case 'c3': isSatisfied = !!params.revenueBand; val = params.revenueBand; break;
                case 'c4': isSatisfied = !!params.strategicIntent; val = params.strategicIntent; break;
                case 'c5': isSatisfied = !!params.calibration?.constraints?.budgetCap; val = params.calibration?.constraints?.budgetCap; break;
                case 'c6': isSatisfied = !!params.riskTolerance; val = params.riskTolerance; break;
                case 'c7': isSatisfied = params.industry && params.industry.length > 0; val = params.industry?.[0]; break;
                case 'c8': isSatisfied = !!params.expansionTimeline; val = params.expansionTimeline; break;
                case 'c9': isSatisfied = !!params.politicalSensitivities?.length; val = params.politicalSensitivities?.length ? "Assessed" : undefined; break;
                case 'c10': isSatisfied = !!params.idealPartnerProfile; val = params.idealPartnerProfile ? "Defined" : undefined; break;
                default: isSatisfied = item.status === 'satisfied'; // Keep manual overrides
            }

            const newStatus: ChecklistStatus = isSatisfied ? 'satisfied' : (item.status === 'skipped' ? 'skipped' : 'pending');

            return {
                ...item,
                status: newStatus,
                value: val
            };
        });

        // Update Variable Store for Math Engine - calculate from actual inputs
        const revenueScoreMap: Record<string, number> = {
            'under_1m': 20,
            '1m_10m': 40,
            '10m_100m': 60,
            '100m_500m': 80,
            '500m_1b': 90,
            'over_1b': 100
        };
        
        const riskScoreMap: Record<string, number> = {
            'conservative': 25,
            'moderate': 50,
            'balanced': 60,
            'aggressive': 75,
            'high': 85
        };

        const variableStore: Record<string, number | string | boolean> = {
            ...currentState.variableStore,
            revenue_score: revenueScoreMap[params.revenueBand || ''] || 50,
            risk_score: riskScoreMap[params.riskTolerance || ''] || 50,
            market_size: params.calibration?.constraints?.budgetCap 
                ? parseFloat(String(params.calibration.constraints.budgetCap).replace(/[^0-9.]/g, '')) / 10000 
                : 500,
            competition_index: params.industry?.length 
                ? Math.min(90, 30 + params.industry.length * 15) 
                : 50
        };

        return {
            ...currentState,
            checklist: updatedChecklist,
            variableStore
        };
    }

    // 2. Execute Dynamic Formula
    static evaluateFormula(formula: DynamicFormula, variableStore: Record<string, unknown>): number | string {
        try {
            // Safe evaluation using mathjs
            const result = compile(formula.expression).evaluate(variableStore as Record<string, number>);
            return typeof result === 'number' ? parseFloat(result.toFixed(2)) : result;
        } catch (error) {
            console.warn(`Formula ${formula.name} failed:`, error);
            return "Error";
        }
    }

    // 3. Create New Formula
    static createFormula(name: string, expression: string, currentState: NeuroSymbolicState): NeuroSymbolicState {
        // Simple extraction of variables (alphanumeric strings)
        const matches = expression.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
        const variables = Array.from(new Set(matches)); // Dedupe

        const newFormula: DynamicFormula = {
            id: `custom_${Date.now()}`,
            name,
            expression,
            variables,
            description: 'User defined logic.'
        };

        return {
            ...currentState,
            formulas: [...currentState.formulas, newFormula]
        };
    }
}

