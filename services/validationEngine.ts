// Comprehensive Form Validation Engine
export const validationRules: { [key: string]: ((value: any) => string | null) | ((param: any) => (value: any) => string | null) } = {
  // Required field validation
  required: (value) => !value || value.toString().trim() === '' ? 'This field is required' : null,
  
  // Email validation
  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? 'Invalid email format' : null;
  },
  
  // URL validation
  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Invalid URL format';
    }
  },
  
  // Percentage validation (0-100)
  percentage: (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    return isNaN(num) || num < 0 || num > 100 ? 'Must be between 0 and 100' : null;
  },
  
  // Currency validation (positive numbers)
  currency: (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    return isNaN(num) || num < 0 ? 'Must be a positive number' : null;
  },
  
  // Integer validation
  integer: (value) => {
    if (!value) return null;
    return !Number.isInteger(parseFloat(value)) ? 'Must be a whole number' : null;
  },
  
  // Phone validation
  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[\d\s\-\+\(\)]+$|^[+\d\s\(\)\-]{10,}$/;
    return !phoneRegex.test(value) ? 'Invalid phone format' : null;
  },
  
  // Min length validation
  minLength: (minLen: number) => (value: any) => {
    if (!value) return null;
    return value.toString().length < minLen ? `Minimum ${minLen} characters required` : null;
  },
  
  // Max length validation
  maxLength: (maxLen: number) => (value: any) => {
    if (!value) return null;
    return value.toString().length > maxLen ? `Maximum ${maxLen} characters allowed` : null;
  },
  
  // Min value validation
  min: (minVal: number) => (value: any) => {
    if (!value) return null;
    const num = parseFloat(value);
    return isNaN(num) || num < minVal ? `Must be at least ${minVal}` : null;
  },
  
  // Max value validation
  max: (maxVal: number) => (value: any) => {
    if (!value) return null;
    const num = parseFloat(value);
    return isNaN(num) || num > maxVal ? `Must not exceed ${maxVal}` : null;
  },
};

// Field validation configuration by step and field
export const fieldValidationConfig: { [key: string]: { [key: string]: any[] } } = {
  // Step 1: Entity Profile
  '1.1': {
    organizationName: [validationRules.required],
    entityType: [validationRules.required],
    country: [validationRules.required],
  },
  '1.2': {
    competencies: [validationRules.required],
  },
  '1.3': {
    marketPositioning: [validationRules.required],
  },
  '1.4': {
    threeYearGoals: [validationRules.required],
  },
  '1.5': {
    riskAppetite: [validationRules.required],
  },
  
  // Step 2: Market Analysis
  '2.1': {
    marketSize: [validationRules.required, validationRules.currency],
    marketGrowthRate: [validationRules.percentage],
  },
  '2.2': {
    competitorCount: [validationRules.required, validationRules.integer],
  },
  '2.3': {
    marketTrends: [validationRules.required],
  },
  '2.4': {
    saturationRisk: [validationRules.percentage],
  },
  '2.5': {
    customerSegment: [validationRules.required],
  },
  
  // Step 3: Financial Planning
  '3.1': {
    year1Revenue: [validationRules.currency],
    operatingMarginTarget: [validationRules.percentage],
  },
  '3.2': {
    budgetOperations: [validationRules.percentage],
    budgetGrowth: [validationRules.percentage],
    budgetContingency: [validationRules.percentage],
  },
  '3.3': {
    totalCapital: [validationRules.currency],
    equityPercentage: [validationRules.percentage],
    debtPercentage: [validationRules.percentage],
  },
  '3.4': {
    q1CashFlow: [validationRules.currency],
    burnRate: [validationRules.currency],
  },
  '3.5': {
    grossMargin: [validationRules.percentage],
    operatingMargin: [validationRules.percentage],
    netMargin: [validationRules.percentage],
  },
};

// Validate a single field
export const validateField = (fieldName: string, value: any, step: string): string | null => {
  const rules = fieldValidationConfig[step]?.[fieldName];
  if (!rules) return null;
  
  for (const rule of rules) {
    const error = typeof rule === 'function' ? rule(value) : null;
    if (error) return error;
  }
  return null;
};

// Validate entire step
export const validateStep = (stepId: string, params: any): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};
  const stepConfig = fieldValidationConfig[stepId];
  
  if (!stepConfig) return errors;
  
  for (const fieldName in stepConfig) {
    const error = validateField(fieldName, params[fieldName], stepId);
    if (error) {
      errors[fieldName] = error;
    }
  }
  
  return errors;
};

// Calculate step completion percentage
export const calculateStepCompletion = (stepId: string, params: any): number => {
  const stepConfig = fieldValidationConfig[stepId];
  if (!stepConfig) return 0;
  
  const totalFields = Object.keys(stepConfig).length;
  if (totalFields === 0) return 100;
  
  const filledFields = Object.keys(stepConfig).filter(
    fieldName => params[fieldName] && params[fieldName].toString().trim() !== ''
  ).length;
  
  return Math.round((filledFields / totalFields) * 100);
};

// Calculate overall readiness score
export const calculateOverallReadiness = (params: any): number => {
  const steps = ['1.1', '1.2', '1.3', '1.4', '1.5', '2.1', '2.2', '2.3', '2.4', '2.5',
                 '3.1', '3.2', '3.3', '3.4', '3.5', '4.1', '4.2', '4.3', '4.4', '4.5',
                 '5.1', '5.2', '5.3', '5.4', '6.1', '6.2', '6.3', '6.4',
                 '7.1', '7.2', '7.3', '7.4', '7.5', '8.1', '8.2', '8.3', '8.4', '8.5'];
  
  const completionScores = steps.map(step => calculateStepCompletion(step, params));
  const average = completionScores.reduce((a, b) => a + b, 0) / completionScores.length;
  
  return Math.round(average);
};

// Cross-step dependency validation
export const validateCrossDependencies = (params: any): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};
  
  // If JVs selected in 5.3, must have partnership identified in 5.1
  if (params.jvOpportunities && !params.targetPartners) {
    errors['jvDependency'] = 'Step 5.1: Must identify target partners before setting up JVs';
  }
  
  // Budget percentages in 3.2 must equal 100%
  const totalBudget = (parseFloat(params.budgetOperations) || 0) +
                      (parseFloat(params.budgetGrowth) || 0) +
                      (parseFloat(params.budgetContingency) || 0);
  if (totalBudget > 0 && Math.abs(totalBudget - 100) > 0.1) {
    errors['budgetTotal'] = `Budget allocation must total 100% (currently ${totalBudget.toFixed(1)}%)`;
  }
  
  // Equity + Debt in 3.3 should equal ~100%
  const totalCapitalMix = (parseFloat(params.equityPercentage) || 0) +
                          (parseFloat(params.debtPercentage) || 0);
  if (totalCapitalMix > 0 && Math.abs(totalCapitalMix - 100) > 0.1) {
    errors['capitalMix'] = `Equity + Debt must total 100% (currently ${totalCapitalMix.toFixed(1)}%)`;
  }
  
  // Market size must be > target revenue (3.1 revenue < 2.1 market size)
  const revenue = parseFloat(params.year1Revenue) || 0;
  const marketSize = parseFloat(params.marketSize) || 0;
  if (revenue > 0 && marketSize > 0 && revenue > marketSize) {
    errors['revenueMismatch'] = 'Year 1 revenue cannot exceed market size';
  }
  
  return errors;
};

