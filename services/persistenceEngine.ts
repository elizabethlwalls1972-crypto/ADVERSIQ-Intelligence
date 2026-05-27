// Industry Templates & Data Persistence Engine

const STORAGE_KEY = 'bw-nexus-workspace';
const TEMPLATE_KEY = 'bw-nexus-templates';

// Industry templates with pre-filled data
export const industryTemplates: { [key: string]: any } = {
  'Tech Startup': {
    organizationName: 'TechVenture Inc',
    entityType: 'C-Corporation',
    country: 'United States',
    marketSize: '5000000000',
    marketGrowthRate: '25',
    competitorCount: '15',
    year1Revenue: '250000',
    operatingMarginTarget: '15',
    totalCapital: '2000000',
    equityPercentage: '70',
    debtPercentage: '30',
    budgetOperations: '50',
    budgetGrowth: '30',
    budgetContingency: '20',
    employeeCount: '15',
    techStack: 'React, Node.js, PostgreSQL, AWS, AI/ML',
    competencies: 'Software Development, Cloud Architecture, Data Analytics',
    marketPositioning: 'Enterprise SaaS for SMBs',
    grossMargin: '75',
    operatingMargin: '15',
    riskAppetite: 'High',
    complianceLevel: 'SOC 2 Type II',
  },
  'Manufacturing': {
    organizationName: 'Manufacturing Pro',
    entityType: 'LLC',
    country: 'United States',
    marketSize: '2000000000',
    marketGrowthRate: '8',
    competitorCount: '25',
    year1Revenue: '5000000',
    operatingMarginTarget: '12',
    totalCapital: '10000000',
    equityPercentage: '40',
    debtPercentage: '60',
    budgetOperations: '60',
    budgetGrowth: '20',
    budgetContingency: '20',
    employeeCount: '100',
    techStack: 'ERP System, Inventory Management, CAD/CAM',
    competencies: 'Production Management, Quality Control, Supply Chain',
    marketPositioning: 'High-quality specialized components',
    grossMargin: '35',
    operatingMargin: '12',
    riskAppetite: 'Medium',
    complianceLevel: 'ISO 9001',
  },
  'Retail': {
    organizationName: 'Retail Solutions Inc',
    entityType: 'S-Corporation',
    country: 'United States',
    marketSize: '1500000000',
    marketGrowthRate: '5',
    competitorCount: '50',
    year1Revenue: '3000000',
    operatingMarginTarget: '8',
    totalCapital: '5000000',
    equityPercentage: '50',
    debtPercentage: '50',
    budgetOperations: '70',
    budgetGrowth: '15',
    budgetContingency: '15',
    employeeCount: '75',
    techStack: 'POS System, Inventory Tracking, E-commerce Platform',
    competencies: 'Retail Management, Customer Service, Merchandising',
    marketPositioning: 'Customer-centric retail experience',
    grossMargin: '45',
    operatingMargin: '8',
    riskAppetite: 'Medium-Low',
    complianceLevel: 'Standard retail compliance',
  },
  'Financial Services': {
    organizationName: 'FinServ Partners',
    entityType: 'C-Corporation',
    country: 'United States',
    marketSize: '8000000000',
    marketGrowthRate: '12',
    competitorCount: '100',
    year1Revenue: '2000000',
    operatingMarginTarget: '20',
    totalCapital: '5000000',
    equityPercentage: '60',
    debtPercentage: '40',
    budgetOperations: '55',
    budgetGrowth: '25',
    budgetContingency: '20',
    employeeCount: '50',
    techStack: 'Bloomberg Terminal, Risk Management Systems, Cloud Infrastructure',
    competencies: 'Financial Analysis, Risk Management, Compliance',
    marketPositioning: 'Boutique financial advisory',
    grossMargin: '85',
    operatingMargin: '20',
    riskAppetite: 'Medium',
    complianceLevel: 'SEC, FINRA, SOX',
  },
  'Healthcare': {
    organizationName: 'HealthCare Solutions',
    entityType: 'C-Corporation',
    country: 'United States',
    marketSize: '3500000000',
    marketGrowthRate: '15',
    competitorCount: '30',
    year1Revenue: '4000000',
    operatingMarginTarget: '18',
    totalCapital: '8000000',
    equityPercentage: '50',
    debtPercentage: '50',
    budgetOperations: '60',
    budgetGrowth: '25',
    budgetContingency: '15',
    employeeCount: '80',
    techStack: 'EHR Systems, Telemedicine Platform, AI Diagnostics',
    competencies: 'Clinical Expertise, Healthcare IT, Patient Care',
    marketPositioning: 'Accessible healthcare technology',
    grossMargin: '65',
    operatingMargin: '18',
    riskAppetite: 'Low-Medium',
    complianceLevel: 'HIPAA, FDA, CMS',
  },
};

// Load data from localStorage
export const loadData = (): any => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
};

// Save data to localStorage
export const saveData = (data: any): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

// Auto-save draft
export const autoSaveDraft = (params: any, timestamp: number = Date.now()): boolean => {
  try {
    const draft = {
      params,
      timestamp,
      autoSaved: true,
    };
    localStorage.setItem(`${STORAGE_KEY}-draft`, JSON.stringify(draft));
    return true;
  } catch (error) {
    console.error('Error auto-saving draft:', error);
    return false;
  }
};

// Load auto-saved draft
export const loadDraft = (): any => {
  try {
    const draft = localStorage.getItem(`${STORAGE_KEY}-draft`);
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

// Save report versions for comparison
export const saveReportVersion = (params: any, reportName: string, timestamp: number = Date.now()): string => {
  try {
    const versions = getReportVersions();
    const versionId = `version-${timestamp}`;
    
    const version = {
      id: versionId,
      name: reportName,
      timestamp,
      params: JSON.parse(JSON.stringify(params)), // Deep copy
      created: new Date(timestamp).toISOString(),
    };
    
    versions.push(version);
    localStorage.setItem(`${STORAGE_KEY}-versions`, JSON.stringify(versions));
    return versionId;
  } catch (error) {
    console.error('Error saving report version:', error);
    return '';
  }
};

// Get all report versions
export const getReportVersions = (): any[] => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}-versions`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading versions:', error);
    return [];
  }
};

// Get specific version
export const getReportVersion = (versionId: string): any => {
  try {
    const versions = getReportVersions();
    return versions.find(v => v.id === versionId);
  } catch (error) {
    console.error('Error getting version:', error);
    return null;
  }
};

// Compare two report versions
export const compareReportVersions = (
  version1: any,
  version2: any
): { field: string; oldValue: string; newValue: string }[] => {
  const changes: { field: string; oldValue: string; newValue: string }[] = [];
  
  const allKeys = new Set([
    ...Object.keys(version1.params || {}),
    ...Object.keys(version2.params || {}),
  ]);
  
  allKeys.forEach(key => {
    const val1 = version1.params?.[key];
    const val2 = version2.params?.[key];
    
    if (val1 !== val2) {
      changes.push({
        field: key,
        oldValue: val1 ? String(val1) : 'Not set',
        newValue: val2 ? String(val2) : 'Not set',
      });
    }
  });
  
  return changes;
};

// Apply industry template
export const applyTemplate = (templateName: string): any => {
  const template = industryTemplates[templateName];
  if (!template) return null;
  
  return JSON.parse(JSON.stringify(template)); // Deep copy
};

// Export data as JSON
export const exportDataAsJSON = (params: any, fileName: string = 'report-data'): void => {
  try {
    const dataStr = JSON.stringify(params, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting JSON:', error);
  }
};

// Import data from JSON
export const importDataFromJSON = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Export data as CSV
export const exportDataAsCSV = (params: any, fileName: string = 'report-data'): void => {
  try {
    const rows: string[] = [];
    
    // Header row
    rows.push('Field,Value');
    
    // Data rows
    Object.entries(params).forEach(([key, value]) => {
      const escapedValue = String(value).includes(',') 
        ? `"${String(value).replace(/"/g, '""')}"` 
        : String(value);
      rows.push(`${key},${escapedValue}`);
    });
    
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting CSV:', error);
  }
};

// Get workspace summary
export const getWorkspaceSummary = (params: any): any => {
  return {
    lastModified: new Date().toISOString(),
    dataFields: Object.keys(params).length,
    completedSections: Object.values(params).filter(v => v && v.toString().trim() !== '').length,
    estimatedCompletion: `${Math.round((Object.values(params).filter(v => v && v.toString().trim() !== '').length / Object.keys(params).length) * 100)}%`,
  };
};

// Clear all data
export const clearAllData = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(`${STORAGE_KEY}-draft`);
    localStorage.removeItem(`${STORAGE_KEY}-versions`);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

